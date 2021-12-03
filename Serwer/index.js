const express = require('express');
const app = express();
app.use(express.json());
var cors = require('cors')
app.use(cors())


app.get('/events', async (req, res) => {
  client.query('SELECT * FROM events', (err, result) => {
    if (err) {
      console.log(err.stack)
    } else {
      return res.send(result.rows);
    }
  })
});

app.post('/events', async (req, res) => {
  client.query('INSERT INTO events(kind, team1, team2, betTeam1, betTeam2, winner, betStatus) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
  [req.body.kind, req.body.team1, req.body.team2, req.body.betteam1, req.body.betteam2, req.body.winner, req.body.betstatus], (err, result) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(result.rows[0])
      return res.send(result.rows);
    }
  })
});

app.delete('/events/:id', async (req, res) => {
  let id = req.params.id;
  client.query('DELETE FROM events WHERE id = $1;', [id], (err, result) => {
    if (err) {
      console.log(err.stack)
    } else {
      return res.send(result.rows);
    }
  })
});
app.put('/events/:id', async (req, res) => {
    let id = req.params.id;
    client.query('UPDATE events SET kind = $1, team1 = $2, team2 = $3, betTeam1 = $4, betTeam2 = $5, winner = $6, betStatus = $7 WHERE id = $8;',
    [req.body.kind, req.body.team1, req.body.team2, req.body.betteam1, req.body.betteam2, req.body.winner, req.body.betstatus, id], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        return res.send(result.rows);
      }
    })
  });

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