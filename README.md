# Express and Mongoose Starter

A JavaScript REST API starter built with Node.js, Express, and Mongoose.

## Requirements

- Node.js 20 or newer
- MongoDB running locally, or a MongoDB connection URI

## Setup

```sh
npm install
```

Copy `.env.example` to `.env` and adjust `MONGODB_URI` or `PORT` if needed. Start the server with:

```sh
npm start
```

For development with Node's watch mode:

```sh
npm run dev
```

The server connects to MongoDB before listening. The default URI is `mongodb://127.0.0.1:27017/express_mongoose_starter`, and the default port is `3000`.

## Mongoose models

The schemas in `src/models` create the `admins`, `employees`, `locations`, and `attendances` collections. Mongoose adds `_id`, `createdAt`, and `updatedAt` automatically.

- `Admin`: unique username and email, required password and name, optional role (`SUPER_ADMIN` or `ADMIN`), an `isActive` flag (default `true`), and an optional last login date. Usernames and emails are stored in lowercase, and passwords are hashed before storage and excluded from JSON responses.
- `Employee`: unique `empCode`, required `name` and `employmentStart`, optional contact/department/end date, and an `isActive` flag (default `true`).
- `Location`: unique `code`, required `name` and `type` (`SHOP` or `OFFICE`), optional address, and an `isActive` flag (default `true`).
- `Attendance`: required employee and location references, denormalized employee/location codes, a validated `YYYY-MM-DD` date, an action (`CHECK_IN` or `CHECK_OUT`), timestamp, and optional notes. It has indexes for employee history and location/day queries.

## API

### Admins

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/admins` | List all admins, sorted by username |
| `GET` | `/api/admins/:username` | Get an admin by username |
| `POST` | `/api/admins` | Create an admin |
| `PUT` | `/api/admins/:username` | Update an admin by username |
| `DELETE` | `/api/admins/:username` | Delete an admin by username |

Create and update requests use `Content-Type: application/json`. Admin fields are `username`, `email`, `password`, `name`, `role`, `isActive`, and `lastLogin`. `username`, `email`, `password`, and `name` are required when creating an admin. Usernames and emails are normalized to lowercase. Passwords are hashed before storage and are not included in API responses.

Example create request:

```json
{
  "username": "jane.admin",
  "email": "jane@example.com",
  "password": "change-this-password",
  "name": "Jane Admin",
  "role": "ADMIN"
}
```

Invalid admin data returns `400`; unknown usernames return `404`.

### Employees

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/employees` | List all employees, sorted by employee code |
| `GET` | `/api/employees/:empCode` | Get an employee by code |
| `POST` | `/api/employees` | Create an employee |
| `PUT` | `/api/employees/:empCode` | Update an employee by code |

Create and update requests use `Content-Type: application/json`. Employee fields are `empCode`, `name`, `email`, `department`, `employmentStart`, `employmentEnd`, and `isActive`. `empCode`, `name`, and `employmentStart` are required when creating an employee. Updates may include one or more of the employee fields.

Example create request:

```json
{
  "empCode": "E001",
  "name": "Chan Tai Man",
  "email": "chan@example.com",
  "department": "IT",
  "employmentStart": "2024-03-01"
}
```

Duplicate employee codes return `409`; invalid employee data returns `400`; unknown employee codes return `404`.

### Locations

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/locations` | List all locations, sorted by location code |
| `POST` | `/api/locations` | Create a location |
| `GET` | `/api/locations/:code` | Get a location by code |
| `PUT` | `/api/locations/:code` | Update a location by code |

Create and update requests use `Content-Type: application/json`. Location fields are `code`, `name`, `type`, `address`, and `isActive`. `code`, `name`, and `type` are required when creating a location. Updates may include one or more of the location fields.

Example create request:

```json
{
  "code": "OF001",
  "name": "Central Office",
  "type": "OFFICE",
  "address": "1 Harbour Road",
  "isActive": true
}
```

Duplicate location codes return `409`; invalid location data returns `400`; unknown location codes return `404`.

### Attendance

Submit an attendance event with `POST /api/attendance/checkIn` or `POST /api/attendance/checkOut`. Both endpoints require an active employee and active location matching the supplied codes. The API records the current UTC timestamp and UTC calendar date and returns the created attendance record.

```json
{
  "empCode": "E001",
  "locationCode": "SH001"
}
```
