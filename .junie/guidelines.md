Simple Family Location Sharing App - Architecture
Scale: 5-10 family members | Complexity: Basic | Cost: Minimal
Overview
A streamlined architecture for a small family location sharing app. No microservices, no
complex infrastructure—just a simple, reliable system for keeping your family connected.
Architecture Components
1. Mobile Apps (iOS & Android)
iOS App - Swift/SwiftUI
Core Location for GPS tracking
Background location updates (significant-change)
Local storage for offline mode
Push notifications via APNs
Android App - Kotlin/Jetpack Compose
Fused Location Provider
Foreground service for tracking
Room database for local cache
Push notifications via FCM
Key Features:
Real-time map showing family members
Battery-efficient location updates (every 5-15 min or on significant movement)
Simple geofences (Home, School, Work)
Low data usage
2. Backend Server (Single Monolith)
Technology: Node.js with Express Hosting: Single VPS (DigitalOcean, Linode) or PaaS
(Heroku, Railway, Render)
Components in One Server:
REST API
POST /api/auth/register
POST /api/auth/login
GET /api/family
POST /api/family/invite
POST /api/locations
GET /api/locations/current
POST /api/geofences
WebSocket Server
Real-time location updates
Simple Socket.io implementation
Rooms per family group
Auto-reconnection handling
Authentication
Email/password login
JWT tokens (no refresh complexity)
Simple session management
Location Handler
Receives GPS coordinates
Stores last 30 days of history
Updates in-memory cache for current locations
Broadcasts to family members via WebSocket
Geofence Logic
Check if location is within defined radius
Trigger notifications on entry/exit
Support 3-5 zones per family
Push Notifications
Firebase Cloud Messaging for both platforms
Simple notification templates
Battery warnings, geofence alerts
Why Single Server?
5 people = minimal traffic
Easy to maintain and debug
Lower hosting costs ($5-20/month)
No complex orchestration needed
3. Database
Option A: PostgreSQL (Recommended)
Good for relational data (users, families)
Supports spatial queries (PostGIS for geofences)
Reliable and well-documented
Free tier on Railway, Supabase, or Neon
Option B: SQLite
Even simpler for tiny scale
Single file database
No separate DB server needed
Great for prototyping
Schema:
-- Users table
users (
id UUID PRIMARY KEY,
email TEXT UNIQUE,
password_hash TEXT,
name TEXT,
phone TEXT,
created_at TIMESTAMP
)
-- Families table
families (
id UUID PRIMARY KEY,
name TEXT,
created_by UUID REFERENCES users(id),
created_at TIMESTAMP
)
-- Family members (junction table)
family_members (
family_id UUID REFERENCES families(id),
user_id UUID REFERENCES users(id),
role TEXT, -- 'admin' or 'member'
joined_at TIMESTAMP,
PRIMARY KEY (family_id, user_id)
)
-- Location history
locations (
id UUID PRIMARY KEY,
user_id UUID REFERENCES users(id),
latitude DECIMAL(10, 8),
longitude DECIMAL(11, 8),
accuracy FLOAT,
timestamp TIMESTAMP,
battery_level INTEGER
)
-- Keep only last 30 days (cleanup job)
-- Geofences
geofences (
id UUID PRIMARY KEY,
family_id UUID REFERENCES families(id),
name TEXT, -- 'Home', 'School', etc.
latitude DECIMAL(10, 8),
longitude DECIMAL(11, 8),
radius_meters INTEGER,
created_at TIMESTAMP
)
-- Device tokens for push
device_tokens (
user_id UUID REFERENCES users(id),
token TEXT,
platform TEXT, -- 'ios' or 'android'
updated_at TIMESTAMP
)
Data Retention:
Location history: 30 days (automated cleanup)
Current location: In-memory cache, refreshed every update
4. In-Memory Cache
Simple JavaScript Object (for 5 people, no Redis needed)
const currentLocations = {
'user-id-1': {
lat: 37.7749,
lng: -122.4194,
timestamp: '2026-02-01T10:30:00Z',
battery: 75
},
// ... other users
}
Purpose:
Quick access to current locations
Avoid DB reads for every map refresh
Update on every location POST
Clear stale data after 30 minutes
5. External Services
Maps API
Mapbox (Recommended for basic tier)
Free tier: 50,000 requests/month
Mobile SDKs for iOS/Android
Beautiful map styles
Geocoding included
Alternative: Google Maps
More features but expensive after free tier
$200/month free credit
Firebase (Push Notifications)
FCM for Android
APNs via Firebase for iOS
Free tier (unlimited messages)
Simple SDK integration
Cloud Functions for server-side sending
Data Flow: Location Update
1. User moves → iOS/Android detects location change
↓
2. App sends: POST /api/locations
{
"latitude": 37.7749,
"longitude": -122.4194,
"accuracy": 10,
"battery_level": 75
}
↓
3. Server validates JWT token
↓
4. Server saves to database (locations table)
↓
5. Server updates in-memory cache (currentLocations)
6. Server checks geofences
→ If triggered: Send push notification
7. Server broadcasts via WebSocket to family members
8. Family members' apps receive update in real-time
↓
↓
↓
↓
9. Maps update with new marker position
Frequency:
Every 5-15 minutes while app is active
On significant location change (>100m)
When entering/exiting geofence
Tech Stack (Simplified)
Component Technology Why?
iOS Swift/SwiftUI Native, best performance
Android Kotlin/Compose Native, modern UI
Backend Node.js + Express Simple, fast development
Real-time Socket.io Easy WebSocket handling
Database PostgreSQL Reliable, spatial support
Hosting Railway/Render Easy deploy, affordable
Maps Mapbox Free tier, good docs
Push Firebase Free, cross-platform
Deployment
Option 1: Railway (Recommended for beginners)
# One command deploy
railway up
# Auto HTTPS, auto scaling, PostgreSQL included
# Cost: ~$5-10/month
Option 2: DigitalOcean Droplet
# $6/month basic droplet
# Manual setup: Nginx, PM2, PostgreSQL
# More control, requires DevOps knowledge
Option 3: Heroku
git push heroku main
# Simple but more expensive (~$15-20/month)
# Free tier discontinued
CI/CD: GitHub Actions (push to main → auto deploy)
Security (Simplified)
Authentication
Bcrypt password hashing (10 rounds)
JWT with 7-day expiration
HTTPS only (enforced by Railway/Render)
Privacy
Each user controls their sharing (on/off toggle)
Location visible only to family members
No third-party data sharing
Account deletion removes all location history
API Security
Rate limiting: 100 requests/minute per user
Input validation (lat/lng bounds, SQL injection prevention)
CORS restricted to mobile app domains
Cost Estimate
Service Tier Cost
Railway/Render Starter $5-10/month
PostgreSQL Included $0
Mapbox Free tier $0 (up to 50k requests)
Firebase Free tier $0
Domain Optional $12/year
Total ~$5-10/month
For 5 people: Easily stays in free/lowest tiers
Features Implementation
Core Features (MVP)
User registration and login
Create family group
Invite family members (via email link)
Real-time location sharing on map
Location history (last 30 days)
3 geofences per family (Home, School, Work)
Push notifications (geofence entry/exit)
Battery level indicator
Nice-to-Have Features
Place check-ins with photos
SOS/emergency button
Driving detection (show speed)
Multiple family groups per user
Dark mode
Not Needed (for 5 people)
Microservices
Load balancer
Redis cache
Message queues
CDN
Auto-scaling
Performance Expectations
Metric Location update time Map load time WebSocket reconnect Push notification Concurrent users Monthly server cost Development Timeline
Expected
< 1 second
< 2 seconds
< 3 seconds
< 5 seconds
Up to 50 (way more than needed)
$5-10
Week 1-2: Backend
Set up Node.js server
Database schema
Auth endpoints
Location endpoints
WebSocket setup
Week 3-4: iOS App
Login/registration UI
Map integration
Location tracking
WebSocket connection
Push notifications
Week 5-6: Android App
Same features as iOS
Platform-specific optimizations
Week 7: Testing & Polish
Bug fixes
UI improvements
Performance optimization
Total: ~7 weeks for MVP
Code Example: Location Update Endpoint
// Backend (Node.js/Express)
app.post('/api/locations', authenticateToken, async (req, res) => {
const { latitude, longitude, accuracy, battery_level } = req.body;
const userId = req.user.id;
// Validate coordinates
if (!isValidCoordinate(latitude, longitude)) {
return res.status(400).json({ error: 'Invalid coordinates' });
}
try {
// Save to database
await db.query(
`INSERT INTO locations (user_id, latitude, longitude, accuracy, battery_level, timestam
VALUES ($1, $2, $3, $4, $5, NOW())`,
[userId, latitude, longitude, accuracy, battery_level]
);
// Update in-memory cache
currentLocations[userId] = {
lat: latitude,
lng: longitude,
timestamp: new Date(),
battery: battery_level
};
// Get user's family ID
const family = await getUserFamily(userId);
// Broadcast to family members via WebSocket
io.to(`family-${family.id}`).emit('location-update', {
userId,
latitude,
longitude,
battery_level
});
// Check geofences
const triggeredGeofence = await checkGeofences(userId, latitude, longitude);
if (triggeredGeofence) {
await sendPushNotification(family.id, triggeredGeofence);
}
res.json({ success: true });
} catch (error) {
console.error(error);
res.status(500).json({ error: 'Failed to update location' });
}
});
Monitoring (Keep It Simple)
Basic Logging
// Use Winston or Pino
logger.info('Location updated', { userId, latitude, longitude });
logger.error('Database error', { error: err.message });
Health Check
app.get('/health', async (req, res) => {
const dbStatus = await checkDatabase();
res.json({
status: 'ok',
database: dbStatus,
uptime: process.uptime()
});
});
Simple Analytics
Count daily active users
Track location updates per day
Monitor API error rates
No need for: Prometheus, Grafana, ELK stack (overkill for 5 people)
Mobile App Battery Optimization
iOS Strategy
Use “significant-change” location service (not continuous)
Defer updates when battery < 20%
Stop tracking when app is killed
Allow user to set update frequency
Android Strategy
Use Fused Location Provider with BALANCED
POWER
ACCURACY
_
_
Batch location updates
Foreground service with notification
Respect Doze mode
Update Intervals:
High accuracy: Every 5 minutes
Balanced: Every 10 minutes
Battery saver: Every 15 minutes or significant change only
Summary
This simplified architecture is perfect for a small family app:
Pros:
Low cost ($5-10/month)
Easy to maintain
Quick to develop
Reliable for 5-10 people
Room to grow if needed
Trade-offs:
Single point of failure (one server)
Manual scaling if you get >100 users
No geographic redundancy
For a family of 5, these trade-offs are totally acceptable. You can always migrate to a more
complex architecture later if the app goes viral!
