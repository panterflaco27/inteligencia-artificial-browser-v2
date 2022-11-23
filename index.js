var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('views engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//Conexion base de datos neo4j
var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '123456'));
var session = driver.session();


//muestra pagina de inicio
app.get('/', function(req, res) {
    res.render('pages/principal.ejs')
});



//Registrar usuario
/*app.post('/register', function(req, res){
    var username = req.body.username;

    session
        .run('CREATE(n:Persona {username:$paramusername}) RETURN n.nombre', {paramusername:username})
        .then(function(result){
            session.close();
            res.status(200).send('USUSARIO REGISTRADO');
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send('ERROR AL REGISTAR AL USUARIO');
        });
})*/



//Autenticar Usuario
/*app.post('/authenticate', function(req,res){
    var buscador = req.body.buscador;
    

    res.render('pages/principal.ejs');
})*/

app.post('/create', function(req, res){
    var tipo = req.body.tipo;
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;

    session
        .run('CREATE (a:nodo {nombre:$paramnombre, descripcion:$paramdescripcion}) RETURN a',{$a:tipo,paramnombre:nombre,paramdescripcion:descripcion})
        .then(function(result){
            res.redirect('/views/pages/principal.ejs');
        })
        .catch(function(err){
            console.log(err);
            res.status(200).send('Archivo NO guardado hay un error.');
        });
})

app.get('/buscar', function(req,res){
    session
        .run('MATCH(n) RETURN n')
        .then(function(result){
            var datarray = [];
            result.records.forEach(function(record){
                console.log(record._fields[0].properties.descripcion);
                datarray.push({
                    nombre: record._fields[0].properties.nombre,
                    descripcion: record._fields[0].properties.descripcion,
                });
            });
            res.render('pages/result.ejs',{
                datos: datarray
            });
        })
        .catch(function(err){
            console.log(err);
        });
})

app.get('/views/pages/singup.ejs', function(req, res) {
    res.render('pages/singup.ejs')
});

app.get('/views/pages/index.ejs', function(req, res) {
    res.render('pages/index.ejs')
});

app.get('/views/pages/principal.ejs', function(req, res) {
    res.render('pages/principal.ejs')
});

app.get('/views/pages/result.ejs', function(req, res) {
    res.render('pages/result.ejs')
});

app.get('/views/pages/create.ejs', function(req, res) {
    res.render('pages/create.ejs')
});

app.get('/views/pages/alumno.ejs', function(req, res) {
    res.render('pages/alumno.ejs')
});

app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;