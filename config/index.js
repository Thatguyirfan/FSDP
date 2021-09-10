//ignore this, wont affect the other codes

const express = require('express');
const mysql = require('mysql');

// Creating the SQL connection
const db = mysql.createConnection{(
  host: 'localhost',
  user: 'root',
  password: ''
)};

// Connect to mysql
db.connect(err => {
  if (err) {
    console.log("error occured");
    throw err;
  }
  console.log('MySQL Connected!');
});

const app = express();

// create database
app.get('/created', (req, res) => {
  let sql = 'CREATE DATABASE nodemysql'
  db.query(sql, err => {
    if (err) {
      console.log("error occured");
      throw err;
    }
    res.send('Database Created');
  })
});


app.get('/', (req, res) => {
  res.send('Hello Express app!')
});

app.listen(3000, () => {
  console.log('server started');
});