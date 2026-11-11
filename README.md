# Time and Attendance API

This project exposes a small Express + Mongoose REST API for managing admins, employees, locations, and attendance check-ins/check-outs.

## Requirements

- Node.js 20 or newer
- MongoDB running locally or a reachable MongoDB URI

## Installation

```bash
npm install
```

## Environment variables

Set the following variables before starting the API:

```bash
JWT_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

The server reads `JWT_SECRET` and `JWT_REFRESH_SECRET` from environment variables when creating and verifying access/refresh tokens.

## Start the server

```bash
npm start
```

For development watch mode:

```bash
npm run dev
```

The app also exposes a health route:

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

## Authentication

Protected routes require a bearer token in the `Authorization` header:

```http
Authorization: Bearer <accessToken>
```

The admin auth flow is:

- `POST /api/admins/login` — authenticate an admin and return `accessToken` and `refreshToken`
- `POST /api/admins/token` — exchange a valid refresh token for a new access token and refresh token
- All other admin routes are protected by `authenticateToken`

## API routes

### 1) Admin routes

Base path: `/api/admins`

| Method | Path | Auth required | Description |
| --- | --- | --- | --- |
| `POST` | `/api/admins/login` | No | Login with username and password |
| `POST` | `/api/admins/token` | No | Exchange a refresh token for new tokens |
| `GET` | `/api/admins` | Yes | List all admins sorted by username |
| `GET` | `/api/admins/:username` | Yes | Get an admin by username |
| `POST` | `/api/admins` | Yes | Create an admin |
| `PUT` | `/api/admins/:username` | Yes | Update an admin by username |
| `DELETE` | `/api/admins/:username` | Yes | Delete an admin by username |

#### Admin login request

```json
{
  "username": "admin",
  "password": "secret123"
}
```

Successful response:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

#### Admin create request

```json
{
  "username": "jane.admin",
  "email": "jane@example.com",
  "password": "change-this-password",
  "name": "Jane Admin",
  "role": "ADMIN",
  "isActive": true
}
```

Notes:

- `username`, `email`, `password`, and `name` are required for create.
- `username` and `email` are normalized to lowercase before saving.
- Passwords are hashed before persistence.
- Unsupported fields are rejected with `400`.

### 2) Employee routes

Base path: `/api/employees`

| Method | Path | Auth required | Description |
| --- | --- | --- | --- |
| `GET` | `/api/employees` | No | List all employees sorted by employee code |
| `GET` | `/api/employees/:empCode` | No | Get an employee by `empCode` |
| `POST` | `/api/employees` | Yes | Create an employee |
| `PUT` | `/api/employees/:empCode` | Yes | Update an employee by `empCode` |

#### Employee create request

```json
{
  "empCode": "E001",
  "name": "Chan Tai Man",
  "email": "chan@example.com",
  "department": "IT",
  "employmentStart": "2024-03-01",
  "isActive": true
}
```

Notes:

- `empCode`, `name`, and `employmentStart` are required on create.
- Duplicate employee codes return `409`.

### 3) Location routes

Base path: `/api/locations`

| Method | Path | Auth required | Description |
| --- | --- | --- | --- |
| `GET` | `/api/locations` | No | List all locations sorted by code |
| `POST` | `/api/locations` | Yes | Create a location |
| `GET` | `/api/locations/:code` | No | Get a location by code |
| `PUT` | `/api/locations/:code` | Yes | Update a location by code |

#### Location create request

```json
{
  "code": "OF001",
  "name": "Central Office",
  "type": "OFFICE",
  "address": "1 Harbour Road",
  "isActive": true
}
```

Notes:

- `code`, `name`, and `type` are required on create.
- Duplicate location codes return `409`.

### 4) Attendance routes

Base path: `/api/attendance`

| Method | Path | Auth required | Description |
| --- | --- | --- | --- |
| `POST` | `/api/attendance/checkIn` | No | Record a check-in event |
| `POST` | `/api/attendance/checkOut` | No | Record a check-out event |

#### Attendance request body

```json
{
  "empCode": "E001",
  "locationCode": "OF001"
}
```

The endpoint:

- validates that both `empCode` and `locationCode` are present
- looks up an active employee and active location
- creates an attendance record with the current timestamp and ISO date
- stores `actionType` as either `CHECK_IN` or `CHECK_OUT`

Example successful response:

```json
{
  "_id": "...",
  "employeeId": "...",
  "empCode": "E001",
  "locationId": "...",
  "locationCode": "OF001",
  "date": "2026-11-12",
  "actionType": "CHECK_IN",
  "timestamp": "2026-11-12T00:00:00.000Z"
}
```

## Common status codes

- `200` — success for reads and updates
- `201` — created
- `400` — invalid request body or validation error
- `401` — unauthorized / invalid token
- `404` — resource not found
- `409` — duplicate code already exists
- `500` — internal server error

## Route summary

```text
GET /health

POST /api/admins/login
POST /api/admins/token
GET /api/admins
GET /api/admins/:username
POST /api/admins
PUT /api/admins/:username
DELETE /api/admins/:username

GET /api/employees
GET /api/employees/:empCode
POST /api/employees
PUT /api/employees/:empCode

GET /api/locations
POST /api/locations
GET /api/locations/:code
PUT /api/locations/:code

POST /api/attendance/checkIn
POST /api/attendance/checkOut
```
