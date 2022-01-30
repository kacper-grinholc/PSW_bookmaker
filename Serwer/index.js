const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // jsonwebtoken
const auth = require("./auth");
const mqttService = require("./mqttService");

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

async function getBalance(id) {
  return await client.query('SELECT SUM(Amount) as balance FROM operations WHERE userid = $1;', [id])
}

async function getEvent(id) {
  const betsDbResult = await calculateBets()
  return client.query('SELECT * FROM events WHERE id = $1;', [id]).then(it => {
    const bets = betsDbResult.rows
    const events = it.rows
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
    return events
  })
}

function isUserInGroup(req, group) {
  return req.user.access_level === group;
}

app.get('/events', async (req, res) => {
  var searchQuery = req.query.query
  var query = 'SELECT * FROM events'
  var params = []
  if (searchQuery !== undefined) {
    params = ["%" + searchQuery.toLowerCase() + "%"]
    console.log(params)
    query = 'SELECT * FROM events WHERE lower(kind) LIKE $1 OR lower(team1) LIKE $1 OR lower(team2) LIKE $1;'
  }
  client.query(query, params, async (err, result) => {
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
        mqttMsg = {
          "eventType" : "EVENT_ADDED",
          "value" : {
            "id": result.rows[0].id,
            "kind": result.rows[0].kind,
            "team1": result.rows[0].team1,
            "team2": result.rows[0].team2,
            "winner": result.rows[0].winner,
            "eventstatus": result.rows[0].eventstatus,
            "creationdate": result.rows[0].creationdate,
            "bett1": 10,
            "bett2": 10
          }
        }
        mqttService.eventMessage(JSON.stringify(mqttMsg))
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
      mqttMsg = {
        "eventType" : "EVENT_DELETED",
        "value" :  {
          "id" : id
        }
      }
      mqttService.eventMessage(JSON.stringify(mqttMsg))
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
        mqttMsg = {
          "eventType" : "EVENT_EDITED",
          "value" : result.rows[0]
        }
        mqttService.eventMessage(JSON.stringify(mqttMsg))
        return res.send(result.rows[0]);
      }
    })
});

app.post('/bets', auth, async (req, res) => {
  const balanceDbResult = await getBalance(req.body.userid)
  console.log(balanceDbResult.rows)
  const balance = balanceDbResult.rows[0].balance
  console.log(balance)
  if (balance - req.body.betAmount < 0) {
    console.log("not enough money")
    return res.status(400).send("not enough money");
  }
  client.query('INSERT INTO bets(userid, eventId, betTeam, betAmount, odd) VALUES($1, $2, $3, $4, $5) RETURNING *',
    [req.body.userid, req.body.eventId, req.body.betTeam, req.body.betAmount, req.body.odd], async (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        const eventDb = await getEvent(req.body.eventId)
        mqttMsg = {
          "eventType" : "EVENT_EDITED",
          "value" : eventDb[0]
        }
        mqttService.eventMessage(JSON.stringify(mqttMsg))
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
  client.query('SELECT SUM (Amount) FROM operations WHERE userid = $1;', [id], (err, result) => {
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

app.get("/hello", async (req, res) => {
  mqttService.eventMessage(JSON.stringify({
    "id": 2,
    "kind": "Football",
    "team1": "Warka Gdynia",
    "team2": "Lechia Gdańsk",
    "winner": "None",
    "eventstatus": "W trakcie",
    "creationdate": "2022-01-30T14:48:35.220Z",
    "bett1": "20",
    "bett2": "40"
}))
  return res.status(200).json(req.user)
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