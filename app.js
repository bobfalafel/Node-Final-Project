const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const Joi = require('@hapi/joi');
const app = express();
const mongoose = require('mongoose');

mongoose.set("strictQuery", false);

mongoose.connect('mongodb://127.0.0.1:27017/cardproject')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

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

app.get('/login', (req, res) => {
  res.render('login', { title: 'Log In' });
});


app.post('/signup', async (req, res) => {
  const { error, value } = contactSchema.validate(req.body);
  if (error) {
    res.render('signup-fail', { title: 'Sign Up' });
  } else {
    const data = req.body;
    try {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        res.status(409).send({ error: 'Email already exists' });
      } else {
        const users = await User.find();
        const user = new User({
          username: data.username,
          email: data.email,
          password: data.password,
          id: users.length + 1
        });
        await user.save();
        res.redirect('/thanks');
      }
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: err.message });
    }
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.redirect('/');
      console.log("great success");
    } else {
      console.log("bad");
    }
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: err.message });
  }
});

app.get('/thanks', (req, res) => {
  res.render('thanks', { title: 'Thanks Page' });
});

app.listen(3000, () => console.log('server run!'));