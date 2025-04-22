const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const bodyParser = require("body-parser")
require('dotenv').config();
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(
    {
        origin: [process.env.AMPLIFY_URI, 'http://localhost:3000'],
        credentials: true,
        exposedHeaders: ['set-cookie']
    }
));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: true,
            sameSite: 'none',
            domain: process.env.DOMAIN_NAME || 'localhost',
            maxAge: 1000 * 60 * 60 * 24,
        },
        proxy: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/api/auth', authRoutes);

const todoRoutes = require('./routes/todos');
app.use('/api/todos', todoRoutes);

app.get('/', (req, res) => {
    res.send('To-Do App Backend Connection Successful');
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
