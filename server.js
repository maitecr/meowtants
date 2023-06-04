const express = require('express')
const app = express()

var path = require('path')

app.listen(3000)
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))


app.get('/', function (req, res){
    res.render('index.ejs')
})

app.get('/join', function (req, res) {
    res.render('join.ejs')
})

app.get('/nursery', function (req, res) {
    res.render('baby_nursery.ejs')
})

app.get('/hatch', function (req, res){
    res.render('create_meowtant.ejs')
})


