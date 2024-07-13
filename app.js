const express = require('express')
const app = express()
// require('dotenv').config({path:'./config/.env'})
require('dotenv').config({path:'./.env'})
const path = require('path')
const nocache = require('nocache')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')


// loggin the requests 
// app.use(morgan('tiny'))

// creating request objects from req url
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

// connecting to db
require('./config/db')

// deleting cache
app.use(nocache())

// setting view engine
app.set('views','./views')
app.set('view engine','ejs')

app.use(session({
    secret: process.env.SESSION_KEY,
    name: 'SURUCHI-Session',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false, sameSite: 'strict' }
}));


// serving the static files 
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'))
const utilsPath = path.join(__dirname,'/utils')
app.use(express.static(utilsPath))

// routing to admin router
const adminRouter = require('./routes/admin')
app.use('/admin',adminRouter)

// routing to user router
const userRouter = require('./routes/user')
app.use('/',userRouter)


// rendering for 404 page
app.all('*',(req,res)=>{
    res.status(404).render('index/partials/404')
})

PORT = process.env.PORT
app.listen(PORT,(error)=> {
    if(error) throw error
    console.log(`Server is runnig on http://localhost:${PORT}`);
})


