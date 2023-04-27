const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const auth = require('./middleware/auth');
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
  ownerEmail: String,
  id: {type: Number, unique: true}
});

const userSchema = mongoose.Schema({
  username: String,
  email: {type: String, unique: true},
  password: String,
  business: Boolean
});
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({email: this.email }, 'tokenMaster');
  return token;
}

const Card = mongoose.model('Card', cardSchema);
const User = mongoose.model('User', userSchema);

app.use(express.json());
app.engine('handlebars', exphbs({ defaultLayout: 'unlogged' }));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
  let token = null;
  try{
  token = req.headers.cookie.split(';').find(cookie=>cookie.startsWith(' jwtoken='));
  }
  catch{
   token = null;
  }
  if (!token){
    res.render('home', { title: 'Home Page' });
  }
  else{
    try {
      token = token.split('=')[1];
      const decoded = jwt.verify(token, 'tokenMaster');
      req.user = decoded;
      const loggedUser = await User.findOne({ email: req.user.email });
      res.render('loggedhome', {layout: 'logged', title: 'Home Page',username: loggedUser.username, email: req.user.email});
    }
    catch (ex) {
      res.status(400).send('Invalid token.');
    }
  }
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
        res.status(200).redirect('/thanks');
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
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const validPass = await bcrypt.compare(req.body.password, user.password)
      if(validPass) {
        const tokentosend = user.generateAuthToken()
        res.status(200).cookie( 'jwtoken', tokentosend)//.redirect('/');
        res.redirect('/');
      } else {
        res.status(401).render('login-fail', { title: 'Sign Up' });;
        console.log("bad");
      }
    } else {
      res.status(401).render('login-fail', { title: 'Sign Up' });;
      console.log("bad");
    }
  } catch (err) {
    console.log(err);
    res.status(422)//.send({ error: err.message });
  }
});

app.get('/thanks', (req, res) => {
  res.render('thanks', { title: 'Thank You' });
});

app.get('/my-cards', auth, async (req, res) => {
  const loggedUser = await User.findOne({ email: req.user.email });
  const userCards = Card.find({ownerEmail:loggedUser.email})
  if(userCards.length==0){
    res.render('my-cards',{layout:'logged', title: 'your cards',cards:userCards,h1:'Here are your cards:'});
  }
  else{
    res.render('my-cards',{layout:'logged', title: 'your cards',h1:'Your have no cards!'});
  }
});







app.use((req, res) => {
  let token = req.headers.cookie.split(';').find(cookie=>cookie.startsWith(' jwtoken='));
  if (!token){
    res.status(404);
    res.render('page-404',{title: '404'});
  }
  else{
    res.status(404);
    res.render('page-404',{layout:'logged', title: '404'});
  }
});
app.listen(3000, () => console.log('server run!'));