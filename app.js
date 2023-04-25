const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const Joi = require('@hapi/joi');
const app = express();
const mongoose = require('mongoose');
 
mongoose.connect('mongodb://localhost/datas')
.then( () => console.log('connecting to mongodb!') )
.catch( err => console.error('Could not connect to mongodb', err) );

const contactSchema = Joi.object({
  username: Joi.string().required().min(6).max(70),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(18),
  submit: Joi.string()
});

const cardSchema = mongoose.Schema({
  bname: String,
  desc: String,
  address: String,
  phone: String,
  imgUrl: String,
  ownerId: Number,
  id: Number
});

const userSchema = mongoose.Schema({
  id: Number,
  username: String,
  email: String,
  password: String,
  type: Boolean
});

const Card = mongoose.model('Card', cardSchema);
const User = mongoose.model('User', userSchema);

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home', { title: 'Home Page' });
});

app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});


app.post('/signup', (req, res) => {
  const { error, value } = contactSchema.validate(req.body);
  if (error) {
    res.render('signup-fail', { title: 'Sign Up' });
  } else {
    res.redirect('/thanks');
  }
});

app.get('/thanks', (req, res) => {
  res.render('thanks', { title: 'Thanks Page' });
});

app.listen(3000, () => console.log('server run!'));