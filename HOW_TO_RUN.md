# 🎮 Eylox Backend — How to Run

## Prerequisites
- Node.js installed (https://nodejs.org) — v18 or newer

## 1. Install dependencies
Open a terminal in this `backend/` folder and run:
```
npm install
```

## 2. Start the server
```
npm run dev     ← auto-restarts on file changes (development)
npm start       ← production start
```

## 3. Open the site
Once running, visit:
```
http://localhost:3001/index.html
```

## 4. Test the API directly

### Health check
```
GET  http://localhost:3001/api/health
```

### Register a new user
```
POST http://localhost:3001/api/auth/register
Body: { "username": "CoolGamer", "email": "test@test.com", "password": "mypassword" }
```

### Login
```
POST http://localhost:3001/api/auth/login
Body: { "username": "Player123", "password": "password123" }
```
→ Copy the `token` from the response

### Get all games
```
GET  http://localhost:3001/api/games
GET  http://localhost:3001/api/games?genre=racing
GET  http://localhost:3001/api/games?search=sky
GET  http://localhost:3001/api/games?sort=popular
```

### Get my friends (needs token)
```
GET  http://localhost:3001/api/friends
Header: Authorization: Bearer <your-token>
```

### Send a friend request
```
POST http://localhost:3001/api/friends/request
Header: Authorization: Bearer <your-token>
Body: { "toUsername": "Riley" }
```

## Seed Accounts (already exist at startup)
| Username  | Password     |
|-----------|--------------|
| Player123 | password123  |
| Alex      | alex123      |
| Riley     | riley123     |
