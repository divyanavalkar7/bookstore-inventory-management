# Bookstore Inventory Management System (BIMS)

BIMS is a modern, premium full-stack application designed to manage a bookstore's inventory. It features a responsive Angular frontend and a robust Node.js Express backend using Sequelize and PostgreSQL.

---

## 📂 Project Structure
- **`/bims_backend`**: Node.js & Express API server with Sequelize ORM and PostgreSQL database.
- **`/bims_frontend`**: Standalone Angular client using reactive Signals and HttpClient.

---

## 🚀 Backend Setup and Run Instructions

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v22.23.1 or higher)
- **PostgreSQL** (running locally or remotely)

### 2. Installation
Navigate to the backend directory and install dependencies:
```bash
cd bims_backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in `/bims_backend`:
```ini
PORT=3000
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=bims_development
DB_HOST=127.0.0.1
DB_PORT=5432
```

### 4. Database Setup & Seeding
Create the database, apply schema migrations, and load sample demo data:
```bash
# Create database
npx sequelize-cli db:create

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data
npx sequelize-cli db:seed:all
```

### 5. Running the Backend
Start the server on port 3000:
```bash
node app.js
```

---

## 💻 Frontend Setup and Run Instructions

### 1. Installation
Navigate to the frontend directory and install dependencies:
```bash
cd bims_frontend
npm install
```

### 2. Running the Frontend
Start the local Vite/Angular development server:
```bash
npm start
```
Open your browser and navigate to `http://localhost:4200/`.

---

## 🧪 Test-Run Instructions

### Backend Integration Tests
To execute backend validation and flow tests using the native Node test runner:
```bash
cd bims_backend
npm test
```

### Frontend Unit Tests
To run frontend components and service unit tests using Vitest:
```bash
cd bims_frontend
npm run test
```

## 🎨 Design Decisions

1. To address the multi-author uniqueness rule , we enforced a strict, case-insensitive author name validation constraint across both the frontend and backend, preventing duplicate entries for the same author name.
2.Used filters from backend instead of filtering from front end directly
3. As of now pagination concept is not used. If the data is more then it need to be implemented in future
4. Stock increment or decrement option is given. this does not support batch increment or decrement