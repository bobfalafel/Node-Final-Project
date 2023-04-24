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
  name: Joi.string().required().min(2).max(70),
  email: Joi.string().required().email(),
  phone: Joi.number().integer().min(9),
  submit: Joi.string()
});

const cardSchema = mongoose.Schema({
  title: String,
  article: String,
  price: Number,
  tags: [ String ],
  isPublish: Boolean,
  createdAt: { type: Date, default: Date.now }
});
 
const Product = mongoose.model('Product', productSchema);
 
const product = new Product({
  title: 'Dell xxy 5 flat',
  article: 'My text demo article for dell',
  price: 45,
  tags: ['computer', 'laptop'],
  isPublish: true
});
 
product.save().then( (result) => console.log(result) );

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home', { title: 'Home Page' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});


app.post('/contact', (req, res) => {
  const { error, value } = contactSchema.validate(req.body);
  if (error) {
    res.render('contact-fail', { title: 'Contact Us' });
  } else {
    res.redirect('/thanks');
  }
});

app.get('/thanks', (req, res) => {
  res.render('thanks', { title: 'Thanks Page' });
});

app.listen(3000, () => console.log('server run!'));