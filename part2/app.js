const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;

const pool=require('./models/db');
app.post('/api/login', async(req,res)) => {
    const{email,passwd} = req.body;

    const con=await pool.getConnection();

    const[users] = await con.query('SELECT * FROM Users WHERE email = ? AND password_hash = ?', [email, passwd]);
    con.release();

    if (users.length=0){
        return res.json({success:false, message: "User record does not match in database"})
    }
    const user = users[0];
    res.json
}