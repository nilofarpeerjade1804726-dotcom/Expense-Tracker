// backend/index.js

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database('data.db');

// Table configuration for creating the habits data matrix
db.prepare(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`).run();

// Table configuration for managing the tracking dates per habit
db.prepare(`
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    checked_at TEXT NOT NULL,
    UNIQUE(habit_id, date)
  )
`).run();

/**
 * Calculates the current consecutive day streak for a given habit.
 * It fetches all check-ins sorted backwards from the most recent date. Starting from today,
 * if today or yesterday has a check-in, it increments the streak for each consecutive calendar day found.
 * If neither today nor yesterday has a record, the streak immediately breaks and returns 0.
 */
function calculateStreak(habitId) {
  const rows = db.prepare('SELECT date FROM checkins WHERE habit_id = ? ORDER BY date DESC').all(habitId);
  const checkinDates = new Set(rows.map(r => r.date));

  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localToday = new Date(now.getTime() - (offset * 60 * 1000));
  const todayStr = localToday.toISOString().split('T')[0];

  const yesterday = new Date(localToday);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!checkinDates.has(todayStr) && !checkinDates.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let currentCheckDate = checkinDates.has(todayStr) ? localToday : yesterday;

  while (true) {
    const dateStr = currentCheckDate.toISOString().split('T')[0];
    if (checkinDates.has(dateStr)) {
      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Route A: Creates a new habit track item in the system database
app.post('/habits', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ "error": "name is required" });
  }

  const createdAt = new Date().toISOString();
  const info = db.prepare('INSERT INTO habits (name, created_at) VALUES (?, ?)').run(name.trim(), createdAt);
  
  res.status(201).json({
    id: info.lastInsertRowid,
    name: name.trim(),
    created_at: createdAt,
    streak: 0
  });
});

// Route B: Retrieves all registered habits along with their current running streaks
app.get('/habits', (req, res) => {
  const habits = db.prepare('SELECT * FROM habits ORDER BY created_at ASC').all();
  const habitsWithStreaks = habits.map(habit => {
    habit.streak = calculateStreak(habit.id);
    return habit;
  });
  res.status(200).json(habitsWithStreaks);
});

// Route C: Creates a timestamped completion marker for a specific habit date
app.post('/habits/:id/checkin', (req, res) => {
  const { id } = req.params;
  
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localToday = new Date(now.getTime() - (offset * 60 * 1000));
  const todayStr = localToday.toISOString().split('T')[0];

  const date = req.body.date || todayStr;

  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
  if (!habit) {
    return res.status(404).json({ "error": "Habit not found" });
  }

  try {
    const checkedAt = new Date().toISOString();
    const info = db.prepare('INSERT INTO checkins (habit_id, date, checked_at) VALUES (?, ?, ?)').run(id, date, checkedAt);
    const updatedStreak = calculateStreak(id);

    res.status(201).json({
      id: info.lastInsertRowid,
      habit_id: parseInt(id),
      date,
      checked_at: checkedAt,
      streak: updatedStreak
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ "error": "Already checked in for this date" });
    }
    res.status(500).json({ "error": "Internal server error" });
  }
});

// Route D: Returns an array of calendar date completion strings for a target habit
app.get('/habits/:id/checkins', (req, res) => {
  const { id } = req.params;
  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
  if (!habit) {
    return res.status(404).json({ "error": "Habit not found" });
  }

  const rows = db.prepare('SELECT date FROM checkins WHERE habit_id = ? ORDER BY date DESC').all(id);
  const dateStrings = rows.map(r => r.date);
  res.status(200).json(dateStrings);
});

// Route E: Un-checks or deletes a specific day log for a habit item
app.delete('/habits/:id/checkin/:date', (req, res) => {
  const { id, date } = req.params;
  db.prepare('DELETE FROM checkins WHERE habit_id = ? AND date = ?').run(id, date);
  res.status(200).json({ "message": "Checkin removed" });
});

// Route F: Permanently clears a tracking entry and its cascade dates records
app.delete('/habits/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM checkins WHERE habit_id = ?').run(id);
  db.prepare('DELETE FROM habits WHERE id = ?').run(id);
  res.status(200).json({ "message": `Habit ${id} and its checkins deleted` });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});