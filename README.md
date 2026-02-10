# Find My Family - Backend

A streamlined backend for a small family location sharing app. This monolithic server handles real-time location updates, geofencing, and family management for small groups (5-10 members).

## Features

### 🔐 Authentication
- **User Registration**: Create a new account with email, password, and name.
- **User Login**: Secure JWT-based authentication.
- **Password Hashing**: Uses `bcryptjs` for secure password storage.

### 👪 Family Management
- **Create Family**: Users can create a family group.
- **Invite Members**: Simple invite system to add existing users to a family.
- **Family List**: Get all families a user belongs to.

### 📍 Location Tracking
- **Real-time Updates**: GPS coordinates, accuracy, and battery level tracking.
- **In-Memory Cache**: Ultra-fast access to the latest locations of family members.
- **Location History**: Persistent storage of location updates in PostgreSQL.
- **WebSocket Broadcasting**: Real-time location updates pushed to family members via Socket.io.

### 🚧 Geofencing
- **Define Zones**: Create geofences (e.g., Home, School, Work) with a specific radius.
- **Zone Alerts**: Get geofence lists for your family.

### 📱 Device Management
- **Push Notifications Support**: Store device tokens (FCM/APNs) for cross-platform alerts.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io (WebSockets)
- **Auth**: JSON Web Tokens (JWT)
- **Environment**: Dotenv for configuration

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Family
- `GET /api/family` - Get user's families
- `POST /api/family` - Create a new family
- `POST /api/family/invite` - Invite a member to a family

### Locations
- `POST /api/locations` - Update current location (broadcasts via WebSocket)
- `GET /api/locations/current` - Get latest locations of family members

### Geofences
- `POST /api/geofences` - Create a new geofence
- `GET /api/geofences` - Get all geofences for user's families

### System
- `GET /health` - Server health check and uptime

## Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   PORT=3000
   DATABASE_URL=postgres://user:password@localhost:5432/family_location_db
   JWT_SECRET=your_jwt_secret
   ```
4. Initialize the database:
   ```bash
   psql -d family_location_db -f schema.sql
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Deployment

### Render & Neon (Recommended)
This project is configured for easy deployment to **Render** using a `render.yaml` blueprint.

1. Create a [Neon](https://neon.tech/) PostgreSQL database and copy the connection string.
2. Connect your GitHub repository to [Render](https://render.com/).
3. Render will automatically detect the `render.yaml` file and prompt you to create the web service and database.
   - Alternatively, you can manually create a **Web Service** on Render:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment Variables**: Add `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV=production`.

### Manual Deployment
1. Ensure your PostgreSQL server supports SSL (required for many cloud providers like Neon).
2. Set `NODE_ENV=production` to enable SSL for database connections.
3. Run `npm install` and `npm run build`.
4. Run `npm start`.

## WebSocket Events

- **Join Family Room**: Emit `join-family` with `familyId` to start receiving updates for that family.
- **Location Updates**: Clients in the family room receive `location-update` events with the latest coordinates.

Testing purposes
