const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let token = req.headers.cookie.split(';').find(cookie=>cookie.startsWith(' jwtoken='));
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    token = token.split('=')[1];
    const decoded = jwt.verify(token, 'tokenMaster');
    req.user = decoded;
    next();
  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
}