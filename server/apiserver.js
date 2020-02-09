var express = require('express');
var bodyParser = require('body-parser'); 
const cors = require('cors'); 
const Pool = require('pg').Pool
var url = require('url');

var server = express();
server.use(bodyParser.urlencoded({ 
    limit: process.env.limit, extended: true
}));
server.use(express.json());
server.use(bodyParser.json({ limit: process.env.limit }));
server.use(cors());

 
const pool = new Pool({
    user: process.env.user,
    host:  process.env.host,
    database:  process.env.database,
    password:  process.env.password,
    port: 5432,
    sslmode: process.env.sslmode,
    ssl: process.env.ssl,
    sslfactory: process.env.sslfactory
  });



//les APIS REST
//login
//Etudiants voir les compétences 
//clicker sur compétences pour faire une ligne dans cours
//cours d'un eleves 
//prof ses competences 
//prof les cours demandés click pour  modifier la demande
//Yo


server.get('/loginEtude/:mail', (request, response) => {

  pool.query("SELECT * FROM eleve where mailEleve='"+request.params.mail+"';", (error, results) => {
    if (error) {
      throw error
    }
    response.send({result:results.rows}) 
    response.end();
  })
})
server.get('/loginProf/:mail', (request, response) => {

  pool.query("SELECT * FROM PROF where mailProf='"+request.params.mail+"';", (error, results) => {
    if (error) {
      throw error
    }
    response.send({result:results.rows}) 
  })
})


server.get('/compt', (request, response) => {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.search;
  if (query === null) {
    pool.query('select f.*,m.libelle as matiere ,n.libelle as niveau from COMPETENCES c inner join Prof f on c.mailprof=f.mailProf inner join MATIERES m on c.id_mat = m.id_mat inner join NIVEAUX n on c.niveau_id=n.niveau_id', (error, results) => {
        if (error) {
          throw error
        }
        response.send({result:results.rows}) 
      });
    } else { 
      let { mailProf, idMatiere, idNiveau} = url_parts.query; 
      var check="";
      if(mailProf!==undefined){
        if(idNiveau===undefined && idMatiere===undefined){ 
          check="f.mailProf='"+mailProf+"'";
         }else{
          check="and f.mailProf='"+mailProf+"'";
         }  
      }
     console.log(idNiveau,idMatiere)
      pool.query("select f.*,m.libelle as matiere ,n.libelle as niveau from COMPETENCES c inner join Prof f on f.mailProf=f.mailProf inner join MATIERES m on c.id_mat = m.id_mat inner join NIVEAUX n on c.niveau_id=n.niveau_id where c.niveau_id="+idNiveau+"and c.id_mat="+idMatiere, (error, results) => {
        if (error) {
          throw error
        }
        response.send({result:results.rows}) 
      });


    }
})
server.get('/compt/:id', (request, response) => {
   pool.query('select f.*,m.libelle as matiere ,n.libelle as niveau from COMPETENCES c inner join Prof f on c.mailprof=f.mailProf inner join MATIERES m on c.id_mat = m.id_mat inner join NIVEAUX n on c.niveau_id=n.niveau_id where f.prof_id='+request.params.id, (error, results) => {
    if (error) {
      throw error
    }
    response.send({result:results.rows}) 
  });
})

server.get('/cours', (request, response) => {

    pool.query('SELECT * FROM COURS', (error, results) => {
        if (error) {
          throw error
        }
        response.send({result:results.rows}) 
      })

})

server.get('/eleves', (request, response) => {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.search;
  if (query === null) {
    pool.query('select e.*,n.libelle from eleve e inner join Niveaux n on n.niveau_id=e.idniveau', (error, results) => {
      if (error) {
        throw error
      }
      response.send({result:results.rows}) 
    });
  } else {
    //ELEVE(mailEleve, nom, prénom, adresse, idNiveau*)
    let { mailEleve, nom, prenom, adresse, idNiveau } = url_parts.query;
    pool.query(
      "INSERT INTO ELEVE(maileleve, nom, prenom, adresse, idNiveau) VALUES('"+mailEleve+"', '"+nom+"','"+prenom+"', '"+adresse+"',"+idNiveau+")",
      (err, res) => { 
        console.log(err,res)
        response.send(res);
        response.end();
      }
    );
  }

})


server.get('/niveaux', (request, response) => {

  pool.query('SELECT * FROM NIVEAUX', (error, results) => {
      if (error) {
        throw error
      }
      response.send({result:results.rows}) 
      response.end();
    })

})

server.get('/prof', (request, response) => {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.search;
  if (query === null) {
    pool.query('SELECT * FROM PROF', (error, results) => {
        if (error) {
          throw error
        }
        response.send({result:results.rows}) 
        response.end();
      });
    } else { 
      let { mailProf, nom, prenom, présentation} = url_parts.query;
      pool.query(
        "INSERT INTO PROF(mailProf, nom, prenom, presentation) VALUES('"+mailProf+"', '"+nom+"','"+prenom+"', '"+présentation+"')",
        (err, res) => { 
          console.log(err,res)
          response.send(res);
          response.end();
        }
      );
    }

})


server.get('/matieres', (request, response) => {

  var url_parts = url.parse(request.url, true);
  var query = url_parts.search;
   if(query===null){
      pool.query('SELECT * FROM MATIERES', (error, results) => {
          if (error) {
            throw error
          }
          response.send({result:results.rows}) 
        })
   }else{
       response.write("You want to add");
       response.end();
   }
})


server.get('/CoursDemande/:mail', (request, response) => {
  pool.query("select f.mailprof,CONCAT(f.nom,' ',f.prenom) as NOMComplet ,c.mailEleve,n.libelle as niveau , m.libelle as matiere,c.date,c.etat from COURS c inner join eleve e on e.mailEleve=c.maileleve inner join PROF f on f.mailProf=c.mailProf inner join NIVEAUX n on n.niveau_id=c.niveau_id inner join MATIERES m on m.id_mat=c.id_mat  where c.date>=current_date and etat='demande'  and c.maileleve='"+request.params.mail+"';", (error, results) => {
    if (error) {
      throw error
    }
    response.send({result:results.rows}) 
    response.end();
  });
})

server.get('/CoursProgramme/:mail', (request, response) => {
  pool.query("select f.mailprof,CONCAT(f.nom,' ',f.prenom) as NOMComplet ,c.mailEleve,n.libelle as niveau , m.libelle as matiere,c.date,c.etat from COURS c inner join eleve e on e.mailEleve=c.maileleve inner join PROF f on f.mailProf=c.mailProf inner join NIVEAUX n on n.niveau_id=c.niveau_id inner join MATIERES m on m.id_mat=c.id_mat  where c.date>=current_date and etat='accepté'  and c.maileleve='"+request.params.mail+"';", (error, results) => {
    if (error) {
      throw error
    }
    response.send({result:results.rows}) 
    response.end();
  });
})


server.get('/CoursRealise/:mail', (request, response) => {
  pool.query("select f.mailprof,CONCAT(f.nom,' ',f.prenom) as NOMComplet ,c.mailEleve,n.libelle as niveau , m.libelle as matiere,c.date,c.etat from COURS c inner join eleve e on e.mailEleve=c.maileleve inner join PROF f on f.mailProf=c.mailProf inner join NIVEAUX n on n.niveau_id=c.niveau_id inner join MATIERES m on m.id_mat=c.id_mat  where c.date<current_date  and c.maileleve='"+request.params.mail+"';", (error, results) => {
    if (error) {
      throw error
    }
    response.send({result:results.rows}) 
    response.end();
  });
})

server.get('/CoursMesDemande/:mail', (request, response) => {
  pool.query("select f.mailprof,CONCAT(e.nom,' ',e.prenom) as NOMCompletEtude ,c.mailEleve,n.libelle as niveau , m.libelle as matiere,c.date,c.etat,n.niveau_id,m.id_mat  from COURS c inner join eleve e on e.mailEleve=c.maileleve inner join PROF f on f.mailProf=c.mailProf inner join NIVEAUX n on n.niveau_id=c.niveau_id inner join MATIERES m on m.id_mat=c.id_mat  where etat='demande' and  c.mailProf='"+request.params.mail+"';", (error, results) => {
    if (error) {
      throw error
    }
    response.send({result:results.rows}) 
    response.end();
  });
});


server.get('/CoursEtats/', (request, response) => {
  //update 
  var url_parts = url.parse(request.url, true);
  let { mailProf, mailEleve, id_mat, idNiveau,dated,etat} = url_parts.query;
  pool.query(
    "UPDATE COURS c set etat='"+etat+"' where c.date='"+dated+"' and mailprof='"+mailProf+"' and maileleve='"+mailEleve+"' and niveau_id="+idNiveau+" and id_mat="+id_mat+";",
    (err, res) => { 
      console.log(err,res)
      response.send(res);
      response.end();
    }
  );   
});


server.get('/CoursDoDemande/', (request, response) => {
  //Insert into cours
  var url_parts = url.parse(request.url, true);
  let { mailProf, mailEleve, id_mat, idNiveau} = url_parts.query;
  let d=new Date();
  pool.query(
    "INSERT INTO COURS VALUES('"+mailProf+"','"+mailEleve+"',"+id_mat+","+idNiveau+",'"+d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+"','demande');",
    (err, res) => { 
      console.log(err,res)
      response.send(res);
      response.end();
    }
  );   
});


  
server.listen( process.env.PORT ||  2020 ,(err,res)=>{
    if(err){
        console.log(err)
    }else{
        console.log(process.env.Message)
    }
});



/* 

insert Liste 


      pool.query(
        "INSERT INTO COMPETENCES(mailProf, id_mat, niveau_id) VALUES('"+mailProf+"',"+idMatiere+","+idNiveau+")",
        (err, res) => { 
          console.log(err,res)
          response.send(res);
          response.end();
        }
      );



*/

 