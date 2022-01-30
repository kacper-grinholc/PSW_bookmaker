const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // jsonwebtoken
const auth = require("../auth");

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

async function addUser(nickname, email, encryptedUserPassword) {
  const query = `INSERT INTO users(nickname, email, password) VALUES($1, $2, $3) RETURNING *;`
  return await client.query(query, [nickname, email, encryptedUserPassword])
}

async function setUserToken(email, token) {
  const query = `UPDATE users SET token = $1 WHERE email = $2;`
  const res = await client.query(query, [token, email])
}

function isUserInGroup(req, group) {
  return req.user.access_level === group;
}


app.post('/register', async (req, res) => {
  try {
    // Get user input
    const { password, email, nickname } = req.body;

    // Validate user input
    if (!(email && password && nickname)) {
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

    dbResult = await addUser(nickname, email, encryptedUserPassword)

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
          expiresIn: "2m",
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

app.get("/hello", auth, async (req, res) => {
  return res.status(200).json(req.user)
});

app.get("/helloAdmin", auth, async (req, res) => {
  if (!isUserInGroup(req, "admin")) {
    return res.status(401).send("You are not an admin");
  }
  return res.status(200).json(req.user)
});


require('dotenv').config();
const dbConnData = {
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT || 6666,
  database: process.env.PGDATABASE || 'bets',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'tajne'
};

const { Client } = require('pg');
const { query } = require('express');
const client = new Client(dbConnData);
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