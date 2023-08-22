
const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const path = require('path');
const myApp = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/prog1935_inclass5' ,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error occurring while connecteing to MongoDB', err);
});

//Set up EJS view engine
myApp.set('view engine', 'ejs');
myApp.set('views', path.join(__dirname, 'View'));

// Serve static files from the "Public" directory
myApp.use(express.static(path.join(__dirname, 'Public')));

// Middleware
myApp.use(express.urlencoded({extended:true}));
myApp.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));

const Admin = mongoose.model('admins', {
    username : String,
    password : String
})

myApp.get('/', (req, res) => {
    res.redirect('/main');
});

// Define the route for the "/main" URL
myApp.get('/main', (req, res) => {
    res.render('main', { error: null });
});

 myApp.post('/main', (req, res) => {
    const { username, password } = req.body;
    
    Admin.findOne({ username, password })
        .then(admin => {
            if (admin) {
                req.session.user = admin;
                res.redirect('/secretpage');
            } else {
                // Render the main.ejs view with an error message
                res.render('main', { error: 'Invalid username or password' });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Render the main.ejs view with an error message
            res.render('main', { error: 'An error occurred' });
        });
});

myApp.get('/secretpage', (req, res) => {
    if (req.session.user) {
        res.render('secretpage', { user: req.session.user });
    } else {
        res.redirect('/');
    }
});

myApp.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/main'); 
    });
});

// Start the server
const PORT = process.env.PORT || 1506;
myApp.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}/`);
});
