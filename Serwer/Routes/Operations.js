const auth = require("../auth");

module.exports = function(app, client){

    app.post('/operations', auth, async (req, res) => {
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
      
      app.get('/transactions/:id', auth, async (req, res) => {
        let id = req.params.id;
        client.query('SELECT * FROM operations WHERE userid = $1;', [id], (err, result) => {
          if (err) {
            console.log(err.stack)
          } else {
            return res.send(result.rows);
          }
        })
      });
}