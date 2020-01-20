var express = require('express');
var bodyParser = require('body-parser'); 
const cors = require('cors'); 
const Pool = require('pg').Pool


var server = express();
server.use(bodyParser.urlencoded({    //obligatoire 
    limit: process.env.limit, extended: true
}));
server.use(express.json());
server.use(bodyParser.json({ limit: process.env.limit }));
server.use(cors());


const pool = new Pool({
    user: process.env.user,
    host:  process.env.user,
    database:  process.env.user,
    password:  process.env.user,
    port: 5432,
    sslmode: process.env.user,
    ssl: process.env.user,
    sslfactory: process.env.user
  });
















server.get('/', (request, response) => {

    pool.query('SELECT * FROM MATIERES', (error, results) => {
        if (error) {
          throw error
        }
        response.send(results.rows)
      })

})

















server.listen(2020,(err,res)=>{
    if(err){
        console.log(err)
    }else{
        console.log(process.env.Message)
    }
});