# 🥫 Food Expiry Tracker App

A simple web app to log purchased food items and track their expiry dates. Users can scan barcodes, add food info, and view upcoming expirations in list and calendar formats.

---

## ✨ Features

- ✅ User login & authentication
- 📦 Add food items with expiry dates
  - Scan barcode (EAN)
  - Fetch item details via food API
  - Manually enter if not found
- 📅 View food items
  - List view sorted by expiration
  - Calendar view

---

## 🧱 Database Schema

### `users`

| Column      | Type    | Description              |
|-------------|---------|--------------------------|
| userId      | varchar | Primary key              |
| name        | varchar | User’s full name         |
| email       | varchar | Email address            |
| password    | varchar | Hashed password          |
| created_at  | date    | Date user registered     |

---

### `food_items`

| Column        | Type    | Description                          |
|---------------|---------|--------------------------------------|
| foodId        | varchar | Primary key                          |
| name          | varchar | Food name                            |
| quantity      | int     | Quantity purchased                   |
| purchase_date | date    | When the food was bought             |
| exp_date      | date    | Expiry date                          |
| ean           | varchar | Barcode / EAN (optional)             |
| brand         | varchar | Brand name                           |
| price         | number  | Purchase cost                        |
| manual_entry  | boolean | Whether it was manually entered      |
| userId        | varchar | Foreign key → users.userId           |

---

## 📄 Pages & Flow

### 🔐 Login Page
- Login using email + password.
- Auth token/session stored locally.

### 📄 View Items Page
- Shows upcoming expired items:
  - **List View**
  - **Calendar View**
- Sort by expiry date
- (Future: filtering and grouping)

### ➕ Add Item Page
- Scan EAN with device camera
- If found in food API → pre-fill form
- If not found → user fills in:
  - Food name
  - Quantity
  - Purchase date
  - Expiry date
  - Price
  - Brand

---

## 🧰 Tech Stack

| Layer       | Tech                             |
|-------------|----------------------------------|
| Framework   | React + Next.js                  |
| Styling     | Tailwind CSS or styled-components |
| Date Utils  | `date-fns` or `dayjs`            |
| Barcode     | `react-qr-barcode-scanner` |
| Calendar    | `react-calendar` or `FullCalendar` |
| State Mgmt  | React Context / Zustand (optional) |

---

## ☁️ Online Database Options 

Since this app is frontend-only, choose a cloud-hosted database with client SDK:

| Service       | Type        | Notes                                           |
|---------------|-------------|-------------------------------------------------|
| **Supabase**  | PostgreSQL  | Free tier, full auth, REST & client SDK support |



