# Bookstore Inventory Management System (BIMS) - Backend

Welcome to the backend of the Bookstore Inventory Management System (BIMS). This project is built using **Node.js**, **Express**, and **Sequelize ORM** with **PostgreSQL**.

---

## 🚀 Getting Started

Follow the steps below to set up and run the backend server locally.

### 1. Prerequisites

Ensure you have Node.js and npm installed with the appropriate versions:
- **Node.js**: `v22.23.1` or higher
- **npm**: `10.9.8` or higher

Check your installed versions using:
```bash
node -v
npm -v
```

### 2. Initialization & Dependency Installation

Initialize a new Node.js project (if not already done) and install the necessary dependencies:

```bash
# Initialize npm package
npm init -y

# Install production dependencies
npm install sequelize pg pg-hstore dotenv

# Install development dependencies
npm install --save-dev sequelize-cli
```

### 3. Environment Configuration

Create a `.env` file in the root directory of the project and define your configuration variables. 

Example `.env` content:
```ini
PORT=3000
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=bims_development
DB_HOST=127.0.0.1
DB_PORT=5432
```

Ensure you have `config.js` and `database.js` configured in your root directory to load these variables and establish the Sequelize connection.

### 4. Database Setup & Initialization

Perform the following steps to initialize and build the database schema in PostgreSQL:

#### A. Create the Database
```bash
# Creates the database defined in your configuration (e.g., bims_development)
npx sequelize-cli db:create
```

#### B. Initialize Models Directory
```bash
# Initializes models folder structure
npx sequelize-cli init:models
```

#### C. Create Migrations
To create new migration files for models:
```bash
npx sequelize-cli migration:create --name <migration-name>
```

#### D. Run Migrations
Run migrations to create/update tables in the database:
```bash
npx sequelize-cli db:migrate
```

---

## 📦 Seeding Data (Optional)

To populate the database with demo/initial data, run the seeders:

```bash
# Run all seeders
npx sequelize-cli db:seed:all

# Undo seeders (if you need to roll back demo data)
npx sequelize-cli db:seed:undo
```

---

## 🏃 Running the Server

Start the application using Node:

```bash
node app.js
```

npm install express cors