const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const app = express();
const http = require('http').Server(app);
const mongoose = require('mongoose');

mongoose.set("strictQuery", false);

mongoose.connect('mongodb://127.0.0.1:27017/cardproject')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

const userValSchema = Joi.object({
  username: Joi.string().required().min(6).max(70),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(18),
  submit: Joi.string()
});

const cardValSchema = Joi.object({
    bname: Joi.string().min(2).max(255).required(),
    desc: Joi.string().min(2).max(1024).required(),
    address: Joi.string().min(2).max(400).required(),
    phone: Joi.string().min(9).max(10).required().regex(/^0[2-9]\d{7,8}$/),
    imgUrl: Joi.string().min(11).max(1024).required()
  });

const cardSchema = mongoose.Schema({
  bname: String,
  desc: String,
  address: String,
  phone: String,
  imgUrl: String,
  ownerId: Number,
  id: {type: Number, unique: true}
});

const userSchema = mongoose.Schema({
  username: String,
  email: {type: String, unique: true},
  password: String,
  business: Boolean
});


const Card = mongoose.model('Card', cardSchema);
const User = mongoose.model('User', userSchema);

app.use(express.json());
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
  const { error, value } = userValSchema.validate(req.body);
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
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        res.redirect('/thanks');
      }
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: err.message });
    }
  }
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, business: this.business }, 'tokenMaster');
  return token;
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const validPass = await bcrypt.compare(req.body.password, user.password)
      if(validPass) {
        res.json({ token: user.generateAuthToken() });
        res.redirect('/');
        console.log("great success");
      } else {
        res.render('login-fail', { title: 'Sign Up' });;
        console.log("bad");
      }
    } else {
      res.render('login-fail', { title: 'Sign Up' });;
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