const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const usersData = require('./db/user.json');

const SECRET_KEY = 'your_secret_key';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

app.use(bodyParser.json());

function generateToken(email, secret, expiresIn) {
  return jwt.sign({ email: email }, secret, { expiresIn: expiresIn });
}

// Middleware to validate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log(authHeader);
  if (!authHeader) {
    console.log("No token provided");
    return res.status(403).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log("Incorrect token");
    return res.status(403).json({ success: false, message: 'Token format is incorrect' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log("Expired token");
      return res.status(401).json({ success: false, message: 'Failed to authenticate token' });
    }

    req.user = user;
    next();
  });
}

app.post('/authenticate', (req, res) => {
  let { email, password, rememberMe } = req.body;

  email = email.trim();
  password = password.trim();

  const user = usersData.find(user => user.email === email && user.password === password);

  console.log(email, password, rememberMe, user);

  let authentication ={};
  if (user) {
    authentication.Token = generateToken(email, SECRET_KEY, rememberMe ? '100day': '1min');
    console.log(authentication);
    res.json(authentication);
  } else {
    res.status(401).json({ success: false, message: 'Incorrect email or Password', email: email });
  }
});

app.get('/home-data', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Home data successful', data: {} });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
