// 1. IMPORTS & SETUP
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 2. DATABASE CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pickleball_db',
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database');
  createTables();
});

// 3. CREATE TABLES FUNCTION
function createTables() {
  const leaguesTable = `CREATE TABLE IF NOT EXISTS leagues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    skill_level_req DECIMAL(3, 1) DEFAULT 2.5,
    time_slot_start TIME NOT NULL,
    time_slot_end TIME NOT NULL
  )`;

  const usersTable = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    skill_rating DECIMAL(3, 1) DEFAULT 2.5,
    is_admin BOOLEAN DEFAULT FALSE,
    league_id INT,
    FOREIGN KEY (league_id) REFERENCES leagues(id)
  )`;

  const matchesTable = `CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    league_id INT,
    player_1_id INT,
    player_2_id INT,
    score_p1 INT,
    score_p2 INT,
    match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (league_id) REFERENCES leagues(id),
    FOREIGN KEY (player_1_id) REFERENCES users(id),
    FOREIGN KEY (player_2_id) REFERENCES users(id)
  )`;

  db.query(leaguesTable, (err) => { if (err) console.log("❌ League Error:", err); else console.log("✅ Leagues table ready"); });
  db.query(usersTable, (err) => { if (err) console.log("❌ User Error:", err); else console.log("✅ Users table ready"); });
  db.query(matchesTable, (err) => { if (err) console.log("❌ Match Error:", err); else console.log("✅ Matches table ready"); });
}

// 4. API ROUTES

// Home Route
app.get('/', (req, res) => {
  res.send('Pickleball API is running!');
});

// Seed Route (Fills the database)
app.get('/api/seed', (req, res) => {
  
  // 1. Create REAL Leagues
  const sqlLeagues = `INSERT INTO leagues (name, location, skill_level_req, time_slot_start, time_slot_end) VALUES 
    -- BEGINNER LEAGUES --
    ('Beginner Ladder (Mon AM)', '3D Fit Ultimate Fitness Arena', 2.0, '09:00:00', '11:00:00'),
    ('Beginner Ladder (Thu PM)', '3D Fit Ultimate Fitness Arena', 2.0, '12:00:00', '14:00:00'),
    ('Beginner Round Robin (Mon Eve)', '3D Fit Ultimate Fitness Arena', 2.0, '18:30:00', '20:30:00'),
    ('Beginner Round Robin (Tue Women)', '3D Fit Ultimate Fitness Arena', 2.0, '15:00:00', '17:00:00'),
    ('Beginner Level 2 (Fri Night)', '3D Fit Ultimate Fitness Arena', 2.5, '20:30:00', '22:30:00'),

    -- INTERMEDIATE LEAGUES --
    ('Intermediate Ladder (Wed AM)', '3D Fit Ultimate Fitness Arena', 3.0, '09:00:00', '11:00:00'),
    ('Intermediate Ladder (Tue PM)', '3D Fit Ultimate Fitness Arena', 3.0, '17:00:00', '19:00:00'),
    ('Intermediate Round Robin (Wed Night)', '3D Fit Ultimate Fitness Arena', 3.0, '20:30:00', '22:30:00'),
    ('Intermediate Round Robin (Sat AM)', '3D Fit Ultimate Fitness Arena', 3.0, '11:30:00', '13:30:00'),
    ('Intermediate Ladder (Mon Night)', '3D Fit Ultimate Fitness Arena', 3.5, '20:30:00', '22:30:00'),

    -- ADVANCED LEAGUES --
    ('Advanced Ladder (Mon Night)', '3D Fit Ultimate Fitness Arena', 4.0, '20:30:00', '22:30:00'),
    ('Advanced Round Robin (Thu Night)', '3D Fit Ultimate Fitness Arena', 4.0, '19:30:00', '21:30:00'),
    ('Advanced Early Birds (Fri AM)', '3D Fit Ultimate Fitness Arena', 4.0, '07:00:00', '09:00:00')`;

  // 2. Create Users
  const sqlUsers = `INSERT INTO users (name, email, password, skill_rating, league_id) VALUES 
    ('Robin Redley', 'robin@test.com', 'password123', 4.0, 11),
    ('John Doe', 'john@test.com', 'secret', 3.5, 10),
    ('Alice Baker', 'alice@test.com', 'pass1', 2.0, 1),
    ('Charlie Davis', 'charlie@test.com', 'pass2', 2.5, 5),
    ('Eve Fisher', 'eve@test.com', 'pass3', 3.0, 6),
    ('Frank Green', 'frank@test.com', 'pass4', 3.5, 8),
    ('Grace Hill', 'grace@test.com', 'pass5', 4.0, 13),
    ('Hank Irwin', 'hank@test.com', 'pass6', 2.0, 2),
    ('Ivy Jones', 'ivy@test.com', 'pass7', 3.0, 7),
    ('Jack King', 'jack@test.com', 'pass8', 4.5, 11),
    ('Karen Lee', 'karen@test.com', 'pass9', 2.0, 3),
    ('Leo Miller', 'leo@test.com', 'pass10', 3.5, 12)`;

  db.query(sqlLeagues, (err) => {
    if (err) return res.send("⚠️ Leagues might already exist. Reset DB to fix.");
    db.query(sqlUsers, (err) => {
      if (err) return res.send("⚠️ Error creating users: " + err.message);
      res.send("✅ DATABASE SEEDED! Created 3D Fit Arena Leagues.");
    });
  });
});

// View Leagues Route
app.get('/api/leagues', (req, res) => {
  const sql = "SELECT * FROM leagues";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// *** NEW ROUTE: Get Players for a Specific League ***
app.get('/api/leagues/:id/players', (req, res) => {
  const leagueId = req.params.id;
  const sql = "SELECT name, skill_rating FROM users WHERE league_id = ?";
  
  db.query(sql, [leagueId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 5. START SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});