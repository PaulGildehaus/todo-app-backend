const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
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
        exposedHeaders: ['set-cookie'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));

app.options('*', cors());

app.set('trust proxy', 1);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app',
            ttl: 24 * 60 * 60,
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN_NAME : 'localhost',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
        }
    })
);


app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
        next();
        }
    });
}

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

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});