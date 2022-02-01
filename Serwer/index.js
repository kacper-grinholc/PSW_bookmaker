const express = require('express');
const app = express();
const operations = require("./Routes/Operations")
const events = require("./Routes/Events")
const bets = require("./Routes/Bets")
const users = require("./Routes/Users")

app.use(express.json());
var cors = require('cors')
app.use(cors())

require('dotenv').config();
const dbConnData = {
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT || 7777,
  database: process.env.PGDATABASE || 'postgres',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'tajne'
};

const { Client } = require('pg');
const client = new Client(dbConnData);
console.log('Connection parameters: ');
console.log(dbConnData);
client
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
    const port = process.env.PORT || 5000
    app.listen(port, () => {
      console.log(`API server listening at http://localhost:${port}`);
    });
  })
  .catch(err => console.error('Connection error', err.stack));

  operations(app, client)
  events(app, client)
  bets(app, client)
  users(app,client)