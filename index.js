require('dotenv').config();
const express = require("express");
const app = express();
const db = require('./dbConnection');
const port = process.env.PORT || 8080;

app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': "GET, POST, PUT, DELETE",
        'Content-Type': 'application/json'
    });
    next();
});

db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection error:', err);
  } else {
    console.log('✅ Connected! Current time:', res.rows[0]);
  }
});

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
})