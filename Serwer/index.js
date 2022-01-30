const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // jsonwebtoken
const auth = require("./auth");

app.use(express.json());
var cors = require('cors')
app.use(cors())

const PRIVATE_KEY = "alaMaKota"

async function findUser(email) {
  const query = `SELECT *
                    FROM users
                    WHERE email = $1;`
  const res = await client.query(query, [email])

  if (res.rowCount == 0) {
    return null
  }
  return res.rows[0]

}

async function addUser(username, email, encryptedUserPassword) {
  const query = `INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *;`
  return await client.query(query, [username, email, encryptedUserPassword])
}

async function setUserToken(email, token) {
  const query = `UPDATE users SET token = $1 WHERE email = $2;`
  const res = await client.query(query, [token, email])
}

async function calculateBets() {
  const query = `SELECT eventid, betteam, SUM(betamount) FROM bets GROUP BY eventid, betteam;`
  return await client.query(query, [])
}

function isUserInGroup(req, group) {
  return req.user.access_level === group;
}

app.get('/events', async (req, res) => {
  client.query('SELECT * FROM events', async (err, result) => {
    if (err) {
      console.log(err.stack)
    } else {
      const betsDbResult = await calculateBets()
      const bets = betsDbResult.rows
      const events = result.rows
      events.forEach(e => {
        const maybeTeam1 = bets.filter(b => b.eventid === e.id && e.team1 === b.betteam)
        if (maybeTeam1.length == 1) {
          e["bett1"] = maybeTeam1[0].sum
        } else {
          e["bett1"] = 0
        }

        const maybeTeam2 = bets.filter(b => b.eventid === e.id && e.team2 === b.betteam)
        if (maybeTeam2.length == 1) {
          e["bett2"] = maybeTeam2[0].sum
        } else {
          e["bett2"] = 0
        }
      });
      return res.send(events);
    }
  })
});

app.post('/events', auth, async (req, res) => {
  if(req.user.access_level !== "admin") {
    return res.status(403).send("You are not an admin");
  }
  client.query('INSERT INTO events(kind, team1, team2, winner, eventStatus) VALUES($1, $2, $3, $4, $5) RETURNING *',
    [req.body.kind, req.body.team1, req.body.team2, req.body.winner, req.body.eventStatus], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(result.rows[0])
        return res.send(result.rows);
      }
    })
});

app.delete('/events/:id', auth, async (req, res) => {
  let id = req.params.id;
  if (!isUserInGroup(req, "admin")) {
    return res.status(401).send("You are not an admin");
  }
  client.query('DELETE FROM events WHERE id = $1;', [id], (err, result) => {
    if (err) {
      console.log(err.stack)
    } else {
      return res.send(result.rows);
    }
  })
});

app.put('/events/:id', auth, async (req, res) => {
  let id = req.params.id;
  if (!isUserInGroup(req, "admin")) {
    return res.status(401).send("You are not an admin");
  }
  client.query('UPDATE events SET kind = $1, team1 = $2, team2 = $3, winner = $4, eventStatus = $5 WHERE id = $6 RETURNING *;',
    [req.body.kind, req.body.team1, req.body.team2, req.body.winner, req.body.eventStatus, id], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        return res.send(result.rows[0]);
      }
    })
});

app.post('/bets', auth, async (req, res) => {
  client.query('INSERT INTO bets(userid, eventId, betTeam, betAmount, odd) VALUES($1, $2, $3, $4, $5) RETURNING *',
    [req.body.userid, req.body.eventId, req.body.betTeam, req.body.betAmount, req.body.odd], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(result.rows[0])
        return res.send(result.rows);
      }
    })
});

app.get('/bets', auth, async (req, res) => {
  let id = req.user.user_id;
  console.log(req.user)
  client.query('SELECT * FROM bets WHERE userid = $1;', [id], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        return res.send(result.rows);
      }
    })
});

app.post('/operations', auth,  async (req, res) => {
  client.query('INSERT INTO operations(operationType, Amount, userid) VALUES($1, $2, $3) RETURNING *',
    [req.body.operationType, req.body.Amount, req.body.userid], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(result.rows[0])
        return res.send(result.rows);
      }
    })
});

app.get('/operations/:id', auth, async (req, res) => {
  let id = req.params.id;
  client.query('SELECT FROM operations WHERE userid = $1;', [id], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        return res.send(result.rows);
      }
    })
});

app.get('/users/:id', auth, async (req, res) => {
  let id = req.params.id;
  client.query('SELECT * FROM users WHERE id = $1;', [id], (err, result) => {
    if (err) {
      console.log(err.stack)
    } else {
      return res.send(result.rows);
    }
  })
});

app.delete('/users/:id', auth, async (req, res) => {
  let id = req.params.id;
  client.query('DELETE FROM users WHERE id = $1;', [id], (err, result) => {
    if (err) {
      console.log(err.stack)
    } else {
      return res.send(result.rows);
    }
  })
});

app.put('/users/:id', auth, async (req, res) => {
  let id = req.params.id;
  client.query('UPDATE users SET username = $1, email = $2, WHERE id = $3;',
    [req.body.username, req.body.email, id], (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        return res.send(result.rows[0]);
      }
    })
});

app.post('/register', async (req, res) => {
  try {
    // Get user input
    const { password, email, username } = req.body;

    // Validate user input
    if (!(email && password && username)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await findUser(email)

    console.log(oldUser)
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedUserPassword = await bcrypt.hash(password, 10);

    dbResult = await addUser(username, email, encryptedUserPassword)

    user = dbResult.rows[0]

    // Create token
    const token = jwt.sign(
      { user_id: user.id, access_level: user.access_level, email },
      PRIVATE_KEY,
      {
        expiresIn: "5h",
      }
    );

    await setUserToken(email, token)

    delete user["password"]
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});


app.post("/login", async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await findUser(email)

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user.id, access_level: user.access_level, email },
        PRIVATE_KEY,
        {
          expiresIn: "1h",
        }
      );

      // save user token
      await setUserToken(email, token)

      delete user["password"]
      user.token = token;

      console.log(user.access_level)

      // user
      return res.status(200).json(user);
    }
    return res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
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