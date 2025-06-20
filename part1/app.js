const express = require('express');
const mysql= require('mysql2/promise');
const app = express();
const port=8080;

const dbconfig={
    host:'localhost',
    user:'root',
    password:'root123',
    database:'DogWalkService'
};

let db;
async function connectDB() {
  db = await mysql.createConnection(dbConfig);
}
connectDB();

app.get('/', (req, res) => res.send('API is working!'));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        Dogs.name AS dog_name,
        Dogs.size,
        Users.username AS owner_username
      FROM Dogs
      JOIN Users ON Dogs.owner_id = Users.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});