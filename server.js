const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session')

app.use(express.json());

const users = [];

const initilaizeAunthentication = require('./passport-config.js');
initilaizeAunthentication(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: 'process.env.SESSION_SECRET',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())



app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        //   Boolean check = await bcrypt.hash(req.body.name, 10);
        res.redirect('login');
    } catch {
        res.redirect('register');
    }
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        next();
    }
}

app.listen(5000, () => console.log('server running....'))