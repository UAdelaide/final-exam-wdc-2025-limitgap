const express = require('express');
const mysql= require('mysql2/promise');
const app = express();

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

