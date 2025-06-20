const express = require('express');
const path = require('path');
const pool=require('./models/db');
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

app.post('/api/login', async (req, res) => {
    const{username, password} = req.body;
    let con;

    try{
        con=await pool.getConnection();

        const[users] = await con.query('SELECT * FROM Users WHERE username = ? AND password_hash = ?', [username, password]);

        if (users.length===0){
            return res.json({success:false, message: "User record does not match in database"});
        }
        const user = users[0];

        req.session.user = {
            user_id : user.user_id,
            role: user.role,
            username: user.username
        };

        res.json({success:true, role:user.role});
    } catch(err){
        console.error("Login error: ", err);
        res.json({success:false, message:"Server error"});
    }finally {if (con) con.release();
    }
});

// Export the app instead of listening here
module.exports = app;