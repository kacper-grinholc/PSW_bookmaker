const auth = require("../auth");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // jsonwebtoken

module.exports = function (app, client) {

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
}