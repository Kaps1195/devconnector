const express = require('express');

const app = express();

app.get('/greeting', (req, res, next) => {
    console.log('Welcome to our API');
    res.send('Welcome to our API');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`App is listening on PORT: ${PORT}`));