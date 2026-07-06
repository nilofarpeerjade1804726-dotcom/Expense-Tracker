# 💰 Expense Tracker

A full-stack Expense Tracker application built with **React (Vite)**, **Express.js**, **SQLite**, and **better-sqlite3**. It allows users to add, view, filter, summarize, update, and delete expenses while tracking monthly spending.

---

# Features

## Backend
- Express REST API
- SQLite database using better-sqlite3
- Automatically creates the `expenses` table
- Add new expenses
- View expenses with:
  - Pagination
  - Category filtering
  - Month filtering
- Monthly expense summary grouped by category
- Update existing expenses
- Delete expenses
- CORS enabled for frontend communication

---

## Frontend

- Add Expense form
- Monthly Summary with horizontal progress bars
- Expense list
- Category filter
- Pagination
- Delete expenses
- Loading states
- Error handling using try/catch
- Responsive card-based layout

---

# Tech Stack

## Frontend
- React
- Vite
- CSS

## Backend
- Node.js
- Express
- better-sqlite3
- SQLite

---

# Project Structure

```
project-folder/
│
├── backend/
│   ├── index.js
│   ├── package.json
│   └── data.db
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    │
    └── package.json
```

---

# Database Schema

Table: `expenses`

| Column | Type | Description |
|---------|------|-------------|
| id | INTEGER | Primary Key |
| title | TEXT | Expense title |
| amount | REAL | Expense amount |
| category | TEXT | Expense category |
| date | TEXT | Expense date (YYYY-MM-DD) |
| created_at | TEXT | ISO timestamp |

---

# Expense Categories

The application uses the following categories:

- Food
- Transport
- Bills
- Entertainment
- Other

---

# REST API

## 1. Add Expense

**POST**

```
POST /expenses
```

Request Body

```json
{
  "title": "Groceries",
  "amount": 450.50,
  "category": "Food",
  "date": "2026-07-06"
}
```

---

## 2. Get Expenses

**GET**

```
GET /expenses
```

Optional Query Parameters

| Parameter | Description |
|-----------|-------------|
| page | Page number |
| limit | Number of records |
| category | Category filter |
| month | YYYY-MM |

Example

```
GET /expenses?page=1&limit=10&category=Food&month=2026-07
```

Response

```json
{
  "data": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 1
}
```

---

## 3. Monthly Summary

**GET**

```
GET /expenses/summary
```

Example

```
GET /expenses/summary?month=2026-07
```

Response

```json
{
  "month": "2026-07",
  "categories": [
    {
      "category": "Food",
      "total": 1200.5
    }
  ],
  "grandTotal": 1200.5
}
```

---

## 4. Update Expense

**PUT**

```
PUT /expenses/:id
```

Example

```json
{
  "amount": 650
}
```

---

## 5. Delete Expense

**DELETE**

```
DELETE /expenses/:id
```

Response

```json
{
  "message": "Expense 5 deleted"
}
```

---

# Installation

## Backend

Navigate to the backend folder.

```bash
cd backend
```

Start the server.

```bash
node index.js
```

Server runs at:

```
http://localhost:5000
```

---

## Frontend

Navigate to the frontend folder.

```bash
cd frontend
```

Start the Vite development server.

```bash
npm run dev
```

Usually available at:

```
http://localhost:5173
```

---

# Usage

1. Start the backend server.
2. Start the frontend.
3. Open the Vite URL in your browser.
4. Add new expenses.
5. Filter expenses by category.
6. View monthly summaries.
7. Delete expenses.
8. Navigate through pages using pagination.

---

# Validation Rules

- Title is required.
- Amount must be greater than zero.
- Category is required.
- Date is required.

---

# Pagination

The expense list supports:

- Previous page
- Next page
- Current page indicator
- Total pages

---

# Monthly Summary

The summary displays:

- Total spending per category
- Horizontal comparison bars
- Grand total for the selected month

---

# Future Improvements

- Edit expenses from the UI
- Search expenses
- Export to CSV
- Charts using Chart.js or Recharts
- Budget limits
- Dark mode
- Local storage preferences

---

# License

This project is intended for educational and learning purposes.
