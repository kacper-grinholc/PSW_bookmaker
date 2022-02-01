const auth = require("../auth");
const mqttService = require("../mqttService");

module.exports = function (app, client) {

    async function getBalance(id) {
        return await client.query('SELECT SUM(Amount) as balance FROM operations WHERE userid = $1;', [id])
    }

    async function calculateBets() {
        const query = `SELECT eventid, betteam, SUM(betamount) FROM bets GROUP BY eventid, betteam;`
        return await client.query(query, [])
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


    app.post('/bets', auth, async (req, res) => {
        const balanceDbResult = await getBalance(req.body.userid)
        console.log(balanceDbResult.rows)
        const balance = balanceDbResult.rows[0].balance
        console.log(balance)
        if (req.body.userid !== 0) {
            if (balance - req.body.betAmount < 0) {
                console.log("not enough money")
                return res.status(400).send("not enough money");
            }
        }
        client.query('INSERT INTO bets(userid, eventId, betTeam, betAmount, odd) VALUES($1, $2, $3, $4, $5) RETURNING *',
            [req.body.userid, req.body.eventId, req.body.betTeam, req.body.betAmount, req.body.odd], async (err, result) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    const eventDb = await getEvent(req.body.eventId)
                    mqttMsg = {
                        "eventType": "EVENT_EDITED",
                        "value": eventDb[0]
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
}