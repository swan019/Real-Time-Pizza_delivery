require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')
const Emitter = require('events')
const passport = require('passport')


//Database connection
const connect = () => {
    mongoose.connect("mongodb://localhost:27017/Pizzas", {
        useNewUrlParser: true,
        UseUnifiedTopology: true
    })
        .then(() => {
            console.log("DB Connected Successfully");
        })
        .catch((err) => {
            console.log("DB CONNECTION ISSUES");
            console.log(err);
            process.exit(1);
        });
}
connect();

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)


// Session store
let mongoStore = MongoDbStore.create({
    mongoUrl: 'mongodb://localhost:27017/Pizzas',
    collectionName: 'sessions'
});

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

//passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())


//assets
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})


// set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')


require('./routes/web.js')(app)



const server = app.listen(PORT, () => {
    console.log(`Listen at ${PORT}`);
})


// socket.io

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // Join
    socket.on('join', (orderId) => {
        console.log(orderId);
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})
