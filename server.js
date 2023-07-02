const express = require('express')
const app = express()

const session = require('express-session')
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
}));

const fs = require('fs')
const formidable = require('formidable')
const crypto = require('crypto')

var bcrypt = require("bcrypt")
var salts = 10

const mysql = require('mysql')
const conn = mysql.createConnection({ host: "localhost", user: "root", password: "", database: "meowtants"})

var path = require('path')

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))


conn.connect(function(err) { 
	if(err) throw err
    const create_database = "create database if not exists meowtants"
    const create_table_users = "create table if not exists users (id integer not null auto_increment, email varchar(100), pass varchar(100), primary key (id))"
    const create_table_meowtants = "create table if not exists meowtants(id integer not null auto_increment, name varchar(30), birth date, genes varchar(30), picture varchar(300), primary key (id))"

    conn.query(create_database)
    console.log("Database created")
    
    conn.query(create_table_users)
    console.log("Users table created")

    conn.query(create_table_meowtants)
    console.log("Meowtants table created")

    console.log("Connected to database")
});

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
    })
    res.redirect('/')
})

app.get('/', function (req, res){
    message = req.session.message
    req.session.message = null
    res.render('index.ejs', {message : message})
})

app.post('/', function (req, res) {
    var email = req.body['email']
    var pass = req.body['pass']

    var sql = "select * from users where email = ?"
    conn.query(sql, [email], function (err, result) {
        if (err) throw err

        if(result.length) {
            bcrypt.compare(pass, result[0]['pass'], function (err, results) {
                if (err) throw err

                if(results) {
                    req.session.logged = true
                    req.session.email = result[0]['email']
                    res.redirect('/nursery')
                } else {
                    res.render('index.ejs', {message: "Invalid e-mail or password"})
                }
            })
        } else {
            res.render('index.ejs', {message: "Invalid e-mail or password"})
        }
    })
})

app.get('/join', function (req, res) {
    res.render('join.ejs')
})

app.post('/join', function (req, res) {
    var email = req.body['email']
    var check_email = "select email from users where email = ?"
    console.log(email) 

        bcrypt.hash(req.body['pass'], salts, function (err, hash) {
            var sql = "insert into users (email, pass) values ?"
            var values = [[req.body['email'], hash]]
            console.log(values)
            conn.query(sql, [values], function(err, result){
                if (err) throw err
                console.log("Registers inserted: " + result.affectedRows)
            })
        })
    res.redirect('/')
})

app.get('/nursery', function (req, res) {
    var sql = "select * from meowtants"

    conn.query(sql, function (err, result, fields) {
        if (err) throw err
        res.render('baby_nursery.ejs', {data_record: result})
    })    
})

app.get('/hatch', function (req, res){
    if(req.session.logged) {
        res.render('create_meowtant.ejs')
    } else {
        req.session.message = "You must sign in"
        res.redirect('/')
    }
        
})

app.post('/hatch', function (req, res){
    var form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
        var previous_path = files.pic.filepath
        var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
        var pic_name = hash + '.' + files.pic.mimetype.split('/')[1]
        var new_path = path.join(__dirname, 'public/images/', pic_name)

        fs.rename(previous_path, new_path, function (err) {
            if (err) throw err;
        })

        var sql = "insert into meowtants (name, birth, genes, picture) values ? "
        var values = [[fields['cat-name'], fields['birth'], fields['genes'], pic_name]]
        conn.query(sql, [values], function (err, result){
            if (err) throw err
            console.log('Registers inserted: ' + result.affectedRows)
        })
    })
    res.redirect('/nursery')
})


app.get('/change/:id', function (req, res){
    if(req.session.logged) {
        var sql = "select * from meowtants where id = ?"
        var id = req.params.id

        conn.query(sql, id, function (err, result, fields) {
            if (err) throw err
            res.render('change_register.ejs', {data_record: result})
        })    
    } else {
        req.session.message = "You must sign up"
        res.redirect('/')
    }
})

app.post('/change/:id', function (req, res){ 
    var form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
        
        var previous_path = files.pic.filepath
        var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
        var pic_name = hash + '.' + files.pic.mimetype.split('/')[1]
        var new_path = path.join(__dirname, 'public/images/', pic_name)

        var id = req.params.id

        fs.rename(previous_path, new_path, function (err) {
            if (err) throw err;
        })

        var sql = "update meowtants set name = ?, birth = ?, genes = ?, picture = ? where id = ?"
        var values = [ [fields['cat-name']], [fields['birth']], [fields['genes']], [pic_name], [id] ]
        conn.query(sql, values, function (err, result){
            if (err) throw err
            console.log('Registers updated: ' + result.affectedRows)
        })
    })
    res.redirect('/nursery')
})


app.get('/delete/:id', function (req, res) {
    if(req.session.logged) {
        var id = req.params.id
        var sql = "select * from meowtants where id = ?"
        
        conn.query(sql, id, function (err, result, fields) {
            if (err) throw err
            const img = path.join(__dirname, 'public/images/', result[0]['picture'])
            fs.unlink(img, (err) => {
            })
        })
        var sql = "delete from meowtants where id = ?"
        conn.query(sql, id, function (err, result) {
            if (err) throw err
            console.log("Deleted registers: " + result.affectedRows)
        })
        res.redirect('/nursery')
    } else {
        req.session.message = "You must sign up"
        res.redirect('/')
    }

})

app.listen(3000)