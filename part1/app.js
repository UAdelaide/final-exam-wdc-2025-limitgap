var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    // Insert data if table is empty

    const [rows2] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (rows2[0].count === 0) {
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('aaron123', 'aaron@example.com', 'hashed000', 'owner'),
        ('john123', 'john@example.com', 'hashed111', 'walker')
      `);
    }

    const [rows3] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
    if (rows3[0].count === 0) {
      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES
        ((SELECT user_id FROM Users WHERE username='alice123'), 'Max', 'medium'),
        ((SELECT user_id FROM Users WHERE username='carol123'), 'Bella', 'small'),
        ((SELECT user_id FROM Users WHERE username='alice123'), 'Ben', 'large'),
        ((SELECT user_id FROM Users WHERE username='carol123'), 'Princess', 'medium'),
        ((SELECT user_id FROM Users WHERE username='aaron123'), 'Pluto', 'large')
      `);
    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Route to return books as JSON
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows4] = await db.execute(`
        SELECT Dogs.name AS dog_name, Dogs.size AS size, Users.username AS owner_username
        FROM Dogs JOIN Users ON Dogs.owner_id = Users.user_id`);
    res.json(rows4);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows5] = await db.execute(`
        SELECT WalkRequests.request_id, Dogs.name AS dog_name, WalkRequests.requested_time, WalkRequests.duration_minutes,
        WalkRequests.location, Users.username as owner_username FROM WalkRequests JOIN Dogs ON WalkRequests.dog_id=Dogs.dog_id
        JOIN Users ON Dogs.owner_id=Users.user_id WHERE WalkRequests.status='open'
        `);
    res.json(rows5);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch walk requests' });
  }
});

app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows6] = await db.execute(`
        SELECT Users.username AS walker_username, COUNT(WalkRatings.rating_id) AS total_ratings, AVG(WalkRatings.rating_id) AS average_rating,
        COUNT(DISTINCT CASE WHEN WalkRequests.status='completed' THEN WalkRequests.request_id END) AS completed_walks
        FROM Users LEFT JOIN WalkRatings ON 
        `);
    res.json(rows6);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch walk requests' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;