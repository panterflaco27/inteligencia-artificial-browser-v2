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
var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
var session = driver.session();

//eliminar relaciones de nodos
app.post('/eliminarrelacion', function(req, res){
    var nombrea = req.body.nombrea;
    var nombreb = req.body.nombreb;
    session
        .run('MATCH (a {name:$nombrea}), (b {name:$nombreb}) MATCH (a)-[r:prueba]->(b) DELETE r', {nombrea:nombrea, nombreb:nombreb})
        .then(function(result){
            res.redirect('/views/pages/principal.ejs');
        })
        .catch(function(err){
            console.log(err);
            res.status(200).send('Relación no eliminada');
        })
})

//eliminar nodos
app.post('/eliminar', function(req, res){
    var nombre = req.body.nombre;

    session
        .run('MATCH (a {name: $nombre}) DETACH DELETE a', {nombre:nombre})
        .then(function(result){
            res.redirect('/views/pages/principal.ejs');
        })
        .catch(function(err){
            console.log(err);
            res.status(200).send('Error al eliminar el nodo!!');
            res.render('pages/principal.ejs');
        })
})

//crear nodos
app.post('/create', function(req, res){
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;
    session
        .run('CREATE (a:nodo {name:$paramnombre, descripcion:$paramdescripcion}) RETURN a',{paramnombre:nombre,paramdescripcion:descripcion})
        .then(function(result){
            res.redirect('/views/pages/principal.ejs');
        })
        .catch(function(err){
            console.log(err);
            res.status(200).send('Nodo NO guardado hay un error.');
        });
})

//crear nuevas relaciones
app.post('/relacion', function(req, res){
    var nom1 = req.body.nombre1;
    var nom2 = req.body.nombre2;

    session
        .run('MATCH (a {name: $nom1}), (b {name: $nom2}) CREATE (a)-[:prueba]->(b) RETURN a', {nom1: nom1, nom2: nom2})
        .then(function(result){

            res.render('pages/principal.ejs');
        })
        .catch(function(err){
            console.log(err);
            res.status(200).send('Relacion no creada');
        })
})


//modificar nombre de un nodo
app.post('/modnombre', function(req, res){
    var viejo = req.body.viejo;
    var nuevo = req.body.nuevo;

    session
        .run("MATCH (a {name: $viejo}) SET a.name = $nuevo RETURN a", {viejo: viejo, nuevo: nuevo})
        .then(function(result){
            res.render('pages/principal.ejs');
        })
        .catch(function(err){
            console.log(err);
            res.status(200).send('Nodo no encontrado!!!');
        })

})

//modificar descripcion de un nodo especifico
app.post('/moddesc', function(req, res){
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;

    session
        .run('MATCH (a {name: $nombre}) WHERE a.name = $nombre SET a.descripcion = $descripcion RETURN a',{nombre: nombre, descripcion: descripcion})
        .then(function(result){
            res.render('pages/principal.ejs');
        })
        .catch(function(err){
            console.log(err);
            res.status(200).send('Nodo no encontrado!!!');
        })
})

//mostrar los nodos de la base de conocimiento
app.get('/buscar', function(req,res){
    session
        .run('MATCH(n) RETURN n')
        .then(function(result){
            var datarray = [];
            result.records.forEach(function(record){
                console.log(record._fields[0].properties.descripcion);
                datarray.push({
                    nombre: record._fields[0].properties.name,
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

//mostrar la busqueda de un nodo especifico
app.get('/search', function(req,res){
    const query = req.body.nombre;

    session
        .run('match (a) \ where a.name = "$paramquery" \ return a', {paramquery:query})

        .then((result)=>{

            let results = [];
            result.records.forEach((record) => results.push(record.get('a')));
            console.log(results);
            console.log('busqueda...');
            res.render('pages/search.ejs', {
                results:results
            })
            return results;

        })

        .catch((err)=>{
            console.log(err);
            res.render('pages/search.ejs', { results});
        })
})

//muestra pagina de inicio
app.get('/', function(req, res) {
    res.render('pages/principal.ejs')
});

//pagina principal
app.get('/views/pages/principal.ejs', function(req, res) {
    res.render('pages/principal.ejs')
});

//pagina de resultados --> tabla con nodos y descripcion
app.get('/views/pages/result.ejs', function(req, res) {
    res.render('pages/result.ejs')
});

//pagina apara crear nodos y relaciones
app.get('/views/pages/create.ejs', function(req, res) {
    res.render('pages/create.ejs')
});

//pagina para eliminAR nodos y relaciones
app.get('/views/pages/eliminar.ejs', function(req, res){
    res.render('pages/eliminar.ejs')
});

//pagina para modificar nodos
app.get('/views/pages/modificar.ejs',function(req, res){
    res.render('pages/modificar.ejs')
});

//pagina de nodos buscados
app.get('/views/pages/search.ejs', function(req,res){
    res.render('pages/search.ejs')
})

app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;
