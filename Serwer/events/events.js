const express = require('express');
const app = express();
app.use(express.json());


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
  client.query('INSERT INTO events(kind, team1, team2, betTeam1, betTeam2, winner, statu) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
  [req.body.kind, req.body.team1, req.body.team2, req.body.betTeam1, req.body.betTeam2, req.body.winner, req.body.statu], (err, result) => {
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
    client.query('UPDATE events SET kind = $1, team1 = $2, team2 = $3, betTeam1 = $4, betTeam2 = $5, winner = $6, statu = $7 WHERE id = $8;',
    [req.body.kind, req.body.team1, req.body.team2, req.body.betTeam1, req.body.betTeam2, req.body.winner, req.body.statu, id], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        return res.send(result.rows);
      }
    })
  });