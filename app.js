require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const port = 5000 || process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static Files
app.use(express.static('public'));

// Templating Engine
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    const locals = {
        title: "NodeJs Notes",
        description: "Free NodeJs Notes App"
    }
    res.render('index', locals);
});

app.listen(port, () => {
    console.log(`App Listening on port ${port}`);
})