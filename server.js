const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const app = express();

// Connect Database
connectDB();

app.get('/greeting', (req, res, next) => {
    res.send('Welcome to our API');
});

// Init Middleware
app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`App is listening on PORT: ${PORT}`));