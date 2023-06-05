const express = require('express')
const app = express()

const fs = require('fs')
const formidable = require('formidable')
const crypto = require('crypto')
const bcrypt = require("bcrypt")
//const bodyParser = require('body-parser')

const mysql = require('mysql')
const conn = mysql.createConnection({ host: "localhost", user: "root", password: "", database: "meowtants"})

var path = require('path')

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
//app.use(bodyParser.urlencoded({extended: true}))


conn.connect(function(err) { 
	if(err) throw err
    console.log("Conectado!")
	conn.end()
});

app.get('/', function (req, res){
    res.render('index.ejs')
})

app.get('/join', function (req, res) {
    res.render('join.ejs')
})

app.post('/join', function (req, res) {
    var sql = "insert into users (email, pass) values ?"
    var values = [
        [req.body['email'], req.body['pass']]
    ]
    console.log(values)
    conn.query(sql, [values], function(err, result){
        if (err) throw err
        console.log("Registros inseridos: " + result.affectedRows)
    }).end()
//    res.redirect('/')
})

app.get('/nursery', function (req, res) {
    res.render('baby_nursery.ejs')
})

app.get('/hatch', function (req, res){
    res.render('create_meowtant.ejs')
})


app.listen(3000)