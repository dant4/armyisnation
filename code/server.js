const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient  // MongoDB driver
const morgan = require('morgan');                   // Log HTTP request in the console
const User = require('./models/user');

// Options here 
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(express.static('assets'))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use(morgan('dev'));

// Start the server
var db

MongoClient.connect('mongodb://army_root:DSMjegBgSqUJcEYR@ds019996.mlab.com:19996/armyisnation', (err, database) => 
{
    if (err) return console.log(err)
    db = database
    app.listen(3000, () => 
    {
        console.log('listening on 3000')
    })
});


// Routes
app.get('/', (req, res) => 
{
  	db.collection('quotes').find().toArray((err, result) => 
	{
    		if (err) return console.log(err)
		// renders index.ejs
		res.render('index.ejs', {quotes: result})
  	})
})

app.post('/quotes', (req, res) => 
{
	db.collection('quotes').save(req.body, (err, result) => 
	{
		if (err) return console.log(err)

    		console.log('saved to database')
    		res.redirect('/')
  	})
})


app.put('/quotes', (req, res) => 
{
    db.collection('quotes').findOneAndUpdate({name: 'Yoda'}, 
    {
        $set: {
          name: req.body.name,
          quote: req.body.quote
        }
    }, 
    {
        sort: {_id: -1},
        upsert: true
    },
     (err, result) => 
    {
        if (err) return res.send(err)
    
        res.send(result)
    })
})


app.post('/user', (req, res) =>
{
    var password = req.body.password;
    var user = new User(req.body.username, password, req.body.email);
    console.log(user.toJSON());
    //res.end();
    db.collection('users').save(user.toJSON(), (err, result) =>
    {
        if (err) return console.log(err)

		console.log('saved to database')
		res.redirect('/')
    });
})


