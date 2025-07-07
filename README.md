Here's a complete and clear `README.md` file for your **Fuel Management System** project built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js), supporting **Admin** and **Driver** roles.

---

## 🚛 Fuel Management System

A full-stack web application for managing fuel usage of vehicles (trucks, buses, cars).
It allows Admins to manage vehicles and drivers, and Drivers to log and view their fuel usage.

---

### 🔧 Technologies Used

* **Frontend**: React.js
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Authentication**: JWT (JSON Web Tokens)
* **Roles**: Admin and Driver

---

### 📁 Project Structure

```
fuel-management-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── pages/
        ├── App.js
        └── index.js
```

---

### ✅ Features

#### Admin:

* Add/Edit/Delete Vehicles
* Assign Drivers
* View fuel logs of all vehicles

#### Driver:

* Log fuel entries (litres, date, vehicle)
* View usage history of assigned vehicle

---

### ⚙️ Setup Instructions

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fuel-management-system.git
cd fuel-management-system
```

---

#### 2. Setup Backend

```bash
cd backend
npm install
```

🛠 Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

▶️ Start Backend:

```bash
npm start
```

---

#### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

---

### 🔑 Default Roles & Access

| Username | Password | Role   |
| -------- | -------- | ------ |
| admin    | admin123 | Admin  |
| driver1  | drive123 | Driver |

*(Register new users with role selection if sign-up is enabled)*

---

### 🧪 API Testing (Postman)

* Import the included `postman_collection.json` file to Postman.
* Test routes:

  * `POST /api/auth/register`
  * `POST /api/auth/login`
  * `GET /api/vehicles`
  * `POST /api/fuel`
  * etc.

---

### 📝 Scripts

| Command       | Description                            |
| ------------- | -------------------------------------- |
| `npm start`   | Starts server/frontend                 |
| `npm run dev` | Starts backend with nodemon (optional) |

---

### 📸 Screenshots

(Insert screenshots or a demo link here)

---

### 🙋‍♂️ Author

* Name - Rangesh113
* (https://github.com/rangesh113)

---

hello world
