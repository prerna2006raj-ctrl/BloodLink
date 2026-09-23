# BloodLink — Blood Bank & Donor-Hospital Matching System

A full-stack DBMS-focused project that matches hospital blood requests with compatible, non-expired blood units. The project demonstrates relational database concepts such as stored procedures, triggers/events, transactions, row-level locking, and concurrency control alongside a full-stack web application.

## Problem Statement

Hospitals often struggle to quickly locate compatible blood units during emergencies, especially when managing blood inventory across multiple blood banks. Manual tracking can also result in blood units expiring unnoticed or the same unit being allotted to multiple requests.

**BloodLink** automates blood compatibility matching, expiry tracking, and safe blood-unit allotment.

## Key Features

* **Blood Group Compatibility Matching** — Automatically finds blood units compatible with the requested blood group and Rh factor.
* **FIFO Allotment** — Among compatible units, the unit closest to expiry is selected first to reduce blood wastage.
* **Automatic Expiry Tracking** — A scheduled MySQL Event automatically marks blood units as expired after their expiry date.
* **Transaction-Safe Allotment** — Uses `SELECT ... FOR UPDATE` row-level locking inside a transaction to prevent the same blood unit from being allotted to two requests simultaneously.
* **Hospital Blood Requests** — Hospitals can create and manage blood requests.
* **Real-Time Matching API** — Backend APIs allow compatible blood units to be searched and allotted.

## Tech Stack

| Layer             | Technology                                                           |
| ----------------- | -------------------------------------------------------------------- |
| Database          | MySQL                                                                |
| Backend           | Node.js, Express.js, mysql2                                          |
| Frontend          | React, Tailwind CSS *(in progress)*                                  |
| Database Concepts | Stored Procedures, Events, Triggers, Transactions, Row-Level Locking |

## Database Design

The database follows a normalized relational design with **6 main tables**:

* `Donor`
* `BloodBank`
* `BloodUnit`
* `Hospital`
* `BloodRequest`
* `Allotment`

### DBMS Concepts Demonstrated

| Concept                        | Implementation                                                  |
| ------------------------------ | --------------------------------------------------------------- |
| Stored Procedure               | `FindMatchingUnits` — compatibility matching and FIFO selection |
| Stored Procedure + Transaction | `AllotBloodUnit` — safe allotment using row-level locking       |
| MySQL Event                    | `expire_old_units` — automatic blood-unit expiry                |
| Multi-table Joins              | Blood-request listing with hospital information                 |
| Transactions                   | Ensures safe and consistent blood-unit allotment                |
| Concurrency Control            | `SELECT ... FOR UPDATE` prevents double-allotment               |

## Project Structure

```text
BloodLink/
│
├── database/
│   ├── 01_bloodbank_schema.sql
│   ├── 02_procedures.sql
│   ├── 03_triggers_events.sql
│   ├── 04_seed.sql
│   └── 05_allotment_procedure.sql
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   └── bloodRoutes.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── client/              # Frontend - in progress
│
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Database Setup

Run the SQL files in the following order:

```bash
cd database

mysql -u root -p < 01_bloodbank_schema.sql
mysql -u root -p < 02_procedures.sql
mysql -u root -p < 03_triggers_events.sql
mysql -u root -p < 04_seed.sql
mysql -u root -p < 05_allotment_procedure.sql
```

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bloodbank_db
PORT=5000
```

Start the server:

```bash
node index.js
```

The backend will run on:

```text
http://localhost:5000
```

### 3. Frontend Setup

The React frontend is currently under development.

Once the client is available:

```bash
cd client
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint                                           | Description                                            |
| ------ | -------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/api/blood/match?blood_group=A%2B&units_needed=2` | Find compatible, non-expired blood units in FIFO order |
| POST   | `/api/blood/allot`                                 | Allot a blood unit to a request                        |
| POST   | `/api/blood/requests`                              | Create a new blood request                             |
| GET    | `/api/blood/requests`                              | List all blood requests                                |

## Concurrency Demonstration

The project demonstrates transaction isolation using two separate MySQL sessions attempting to access the same blood unit simultaneously.

Both sessions attempt to use:

```sql
SELECT ... FOR UPDATE;
```

The second transaction waits while the first transaction holds the row lock. After the first transaction commits, the second transaction continues.

This demonstrates how **row-level locking and transactions** can prevent the same blood unit from being allotted to multiple requests concurrently.

## Future Enhancements

* Geo-based donor matching
* Hospital-to-donor distance calculation
* Donor availability tracking
* Emergency request prioritization
* Blood inventory dashboard
* Authentication and role-based access
* React-based hospital and blood-bank dashboards
* Notifications for critical blood shortages

## Author

**Prerna Raj**

BCA — Chitkara University
