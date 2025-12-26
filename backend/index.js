const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rootpassword',
  database: 'pickleball_db',
  port: 3307 
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database on Port 3307');
  createTables();
});

// 2. CREATE TABLES AUTOMATICALLY
function createTables() {
  const leaguesTable = `CREATE TABLE IF NOT EXISTS leagues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    time_slot_start TIME NOT NULL,
    time_slot_end TIME NOT NULL
  )`;

  const playersTable = `CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    league_id INT,
    ranking_points INT DEFAULT 0,
    FOREIGN KEY (league_id) REFERENCES leagues(id)
  )`;

  const matchesTable = `CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_1_id INT,
    player_2_id INT,
    score_p1 INT,
    score_p2 INT,
    match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_1_id) REFERENCES players(id),
    FOREIGN KEY (player_2_id) REFERENCES players(id)
  )`;

  db.query(leaguesTable, (err) => { if (err) console.log(err); });
  db.query(playersTable, (err) => { if (err) console.log(err); });
  db.query(matchesTable, (err) => { if (err) console.log(err); });
}

// 3. API ROUTES

// Test Route
app.get('/', (req, res) => {
  res.send('Pickleball API is running!');
});

// SEED ROUTE (Fills the database with dummy data)
app.get('/api/seed', (req, res) => {
  const sqlLeagues = `INSERT INTO leagues (name, time_slot_start, time_slot_end) VALUES 
    ('Beginner League', '09:00:00', '11:00:00'),
    ('Intermediate League', '12:00:00', '14:00:00'),
    ('Advanced League', '15:00:00', '17:00:00')`;

  const sqlPlayers = `INSERT INTO players (name, league_id, ranking_points) VALUES 
    ('Robin Redley', 2, 1200),
    ('John Doe', 2, 1150)`;

  db.query(sqlLeagues, (err) => {
    if (err) return res.send("⚠️ Leagues might already exist. Skipping seed.");
    
    db.query(sqlPlayers, (err) => {
      if (err) return res.send("⚠️ Error creating players.");
      res.send("✅ DATABASE SEEDED! Leagues and Players added.");
    });
  });
});

// VIEW LEAGUES ROUTE (This is the one you were missing!)
app.get('/api/leagues', (req, res) => {
  const sql = "SELECT * FROM leagues";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 4. START SERVER
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});