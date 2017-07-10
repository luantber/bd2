var express = require('express');
var mongo = require('mongodb');

var app = express();
var MongoClient = require('mongodb').MongoClient;

var bodyParser = require('body-parser');

var redisClient = require('redis').createClient;
var client = redisClient(6379, 'localhost');

/* .............. Configuracion .................. */

app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.set('views', './views');
app.set('view engine','pug');

var url = 'mongodb://myTester:xyz123@192.168.1.113:27017/test';

var collection;

MongoClient.connect(url, function(err, database) {
  if (err) console.log(err + "error");
  else{
    console.log("Conectado Con exito");
    collection = database.collection("usuarios");  
    //console.log(collection);
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

/* .............. Aplicacion  .................. */

//
app.get('/', function (req, res) {
  res.render('index');
});

//
app.get('/usuarios',function(req, res){
  //console.log(db.usuarios.find({}));
   collection.find().toArray(function(err,docs){
    console.log(docs);
    res.render('usuarios', {usuarios: docs });
  });

});

//
app.post('/usuario',function(req,resp){
  
  collection.insert(req.body,function(err, res){
    if(err) console.log("error" + err);
    else{
      console.log(res);  
      resp.send('Usuario Creado'  + JSON.stringify(req.body));
    }    
  });
  
});

//
app.get('/usuario/:id',function(req, res){

  var nombre = req.params.id.split("-");
  var json = {nombre:nombre[0], apellido:nombre[1]};
  var sjson = JSON.stringify(json);
  
  client.get(req.params.id, function(erroredis, reply) {
    // reply is null when the key is missing
    if(erroredis) console.log(erroredis+"erroredis");
    if(reply){
      //console.log(reply);
      //console.log(JSON.parse(reply));
      console.log("Cache: "+reply);
      res.render('usuario',{user:JSON.parse(reply)});
    }
    else{
      collection.findOne(json,function(err,item){
        if(item){
          console.log("Mongo: " + JSON.stringify(item) );
          res.render('usuario',{user:item});
          client.set(req.params.id,JSON.stringify(item));
        }
        else{
          res.render('usuario', {user:{data:"No existe el Usuario"}});
        }
      });
    }
  });



  
});