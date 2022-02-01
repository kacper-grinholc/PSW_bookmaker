const auth = require("../auth");
const mqttService = require("../mqttService");

module.exports = function (app, client) {

    async function calculateBets() {
        const query = `SELECT eventid, betteam, SUM(betamount) FROM bets GROUP BY eventid, betteam;`
        return await client.query(query, [])
    }

    async function finishEvent(ID, winner) {
        const query = `SELECT betAmount, odd, userid FROM bets WHERE eventId = $1 AND betTeam = $2;`
        return await client.query(query, [ID, winner])
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
        if (req.user.access_level !== "admin") {
            return res.status(403).send("You are not an admin");
        }
        client.query('INSERT INTO events(kind, team1, team2, winner, eventStatus) VALUES($1, $2, $3, $4, $5) RETURNING *',
            [req.body.kind, req.body.team1, req.body.team2, req.body.winner, req.body.eventStatus], (err, result) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    client.query('INSERT INTO bets(userid, eventId, betTeam, betAmount, odd) VALUES(0, $1, $2, 10, 2.00), (0, $1, $3, 10, 2.00)', [result.rows[0].id, result.rows[0].team1, result.rows[0].team2]).then(r2 => {
                        console.log(r2.rows)
                        mqttMsg = {
                            "eventType": "EVENT_ADDED",
                            "value": {
                                "id": result.rows[0].id,
                                "kind": result.rows[0].kind,
                                "team1": result.rows[0].team1,
                                "team2": result.rows[0].team2,
                                "winner": result.rows[0].winner,
                                "eventstatus": result.rows[0].eventstatus,
                                "creationdate": result.rows[0].creationdate,
                                "bett1": req.body.bett1,
                                "bett2": req.body.bett2
                            }
                        }
                        mqttService.eventMessage(JSON.stringify(mqttMsg))
                        console.log(result.rows[0])
                        return res.send(result.rows);
                    })
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
                    "eventType": "EVENT_DELETED",
                    "value": {
                        "id": id
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
            [req.body.kind, req.body.team1, req.body.team2, req.body.winner, req.body.eventStatus, id], async (err, result) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    const betsDB = await finishEvent(result.rows[0].id, result.rows[0].winner)
                    console.log(betsDB.rows)
                    var query = "INSERT INTO operations (operationType, Amount, userid) VALUES"
                    for (const bet of betsDB.rows) {
                        console.log(bet.betamount, typeof (bet.betamount), bet.odd, typeof (bet.odd))
                        query += `('wygrana', ${bet.betamount * bet.odd}, ${bet.userid}),`
                    }
                    query = query.slice(0, -1) + " RETURNING *;"
                    client.query(query, []).then(r2 => {
                        console.log(r2.rows)
                        mqttMsg = {
                            "eventType": "EVENT_EDITED",
                            "value": {
                                "id": result.rows[0].id,
                                "kind": result.rows[0].kind,
                                "team1": result.rows[0].team1,
                                "team2": result.rows[0].team2,
                                "winner": result.rows[0].winner,
                                "eventstatus": result.rows[0].eventstatus,
                                "creationdate": result.rows[0].creationdate,
                                "bett1": req.body.bett1,
                                "bett2": req.body.bett2
                            }
                        }
                        mqttService.eventMessage(JSON.stringify(mqttMsg))
                        return res.send(result.rows[0]);
                    })
                }
            })
    });
}