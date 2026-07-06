// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000';

export default function App() {
  const [habits, setHabits] = useState([]);
  const [checkinsByHabit, setCheckinsByHabit] = useState({});
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState('');

  const refreshAll = async () => {
    try {
      const res = await fetch(`${API_URL}/habits`);
      const habitsData = await res.json();
      
      const checkinsObj = {};
      await Promise.all(
        habitsData.map(async (habit) => {
          const checkinRes = await fetch(`${API_URL}/habits/${habit.id}/checkins`);
          const checkinDates = await checkinRes.json();
          checkinsObj[habit.id] = checkinDates;
        })
      );

      setHabits(habitsData);
      setCheckinsByHabit(checkinsObj);
    } catch (error) {
      console.error("Failed to fetch habits track matrix:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHabitName.trim() }),
      });
      if (res.ok) {
        setNewHabitName('');
        await refreshAll();
      }
    } catch (error) {
      console.error("Failed to add new tracking element:", error);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      const res = await fetch(`${API_URL}/habits/${habitId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await refreshAll();
      }
    } catch (error) {
      console.error("Failed to record routine point completion:", error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      const res = await fetch(`${API_URL}/habits/${habitId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshAll();
      }
    } catch (error) {
      console.error("Failed to completely remove selected objective profile:", error);
    }
  };

  const getPastSevenDays = () => {
    const days = [];
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localToday = new Date(now.getTime() - (offset * 60 * 1000));

    for (let i = 0; i < 7; i++) {
      const d = new Date(localToday);
      d.setDate(localToday.getDate() - i);
      days.push({
        dateString: d.toISOString().split('T')[0],
        dayNum: d.getDate()
      });
    }
    return days;
  };

  const pastSevenDays = getPastSevenDays();
  const todayStr = pastSevenDays[0].dateString;

  return (
    <div className="container">
      <h1>🔥 Habit Tracker</h1>

      <div className="new-habit-card">
        <form onSubmit={handleAddHabit} className="input-row">
          <input
            type="text"
            placeholder="e.g. Drink 2L water"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
          />
          <button type="submit">Add Habit</button>
        </form>
      </div>

      {loading ? (
        <p className="status-text">Loading your habits...</p>
      ) : habits.length === 0 ? (
        <p className="status-text">No habits yet. Add one above to get started!</p>
      ) : (
        <div className="habit-list">
          {habits.map((habit) => {
            const historyList = checkinsByHabit[habit.id] || [];
            const isCheckedInToday = historyList.includes(todayStr);

            return (
              <div key={habit.id} className="habit-card">
                <h3>{habit.name}</h3>
                
                <p className={`streak-text ${habit.streak > 0 ? 'active' : ''}`}>
                  {habit.streak > 0 ? `🔥 ${habit.streak} day streak` : 'No streak yet — check in today!'}
                </p>

                {isCheckedInToday ? (
                  <button className="checkin-btn disabled" disabled>
                    ✅ Checked in today
                  </button>
                ) : (
                  <button className="checkin-btn" onClick={() => handleCheckIn(habit.id)}>
                    Check In
                  </button>
                )}

                <div className="history-timeline">
                  {pastSevenDays.map((day) => {
                    const isDone = historyList.includes(day.dateString);
                    return (
                      <div
                        key={day.dateString}
                        className={`history-box ${isDone ? 'done' : 'not-done'}`}
                        title={day.dateString}
                      >
                        {day.dayNum}
                      </div>
                    );
                  })}
                </div>

                <button className="delete-btn" onClick={() => handleDeleteHabit(habit.id)}>
                  Delete Habit
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}