//jshint esversion:6
require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const app = express()
const mongoose = require('mongoose');
var Schema = mongoose.Schema
var encrypt = require('mongoose-encryption');
// const bcrypt = require('bcrypt')
// const saltRounds = 10
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new Schema({
    email: String,
    password: String
})

//userSchema.plugin(encrypt, { secret: process.env.secrets, encryptedFields: ['password'] });


app.use(express.static("public"))
app.set("view engine", 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }))

  //khoi tao passport
app.use(passport.initialize())
app.use(passport.session())

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())

passport.deserializeUser(User.deserializeUser())

app.get("/", (req,res)=>{
    res.render("home")
})

app.get("/login", (req,res)=>{
    res.render("login")
})

app.get("/register", (req,res)=>{
    res.render("register")
})

app.post("/register", (req,res)=>{
    User.register({username: req.body.username}, req.body.password, (err,result)=>{
        if(err) {
            console.log(err);
            res.redirect("/register")
        }
        else {
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets")
            })
        }
    })
})

app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    } else{
        res.redirect("/login")
    }
})

app.post("/login",async (req,res)=>{

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err)=>{
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets")
            })
        }
    })

})


app.get("/logout", (req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

app.get("/submit", (req,res)=>{
    res.render("submit")
})


app.listen(3000, ()=>console.log("Server on 3000"))