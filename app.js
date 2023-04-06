//jshint esversion:6
require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const app = express()
const mongoose = require('mongoose');
var Schema = mongoose.Schema
var encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt')
const saltRounds = 10


mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new Schema({
    email: String,
    password: String
})

//userSchema.plugin(encrypt, { secret: process.env.secrets, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema)

app.use(express.static("public"))
app.set("view engine", 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))

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
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash
        })
    
        newUser.save()
        .then(result=>res.render("secrets"))
        .catch(console.log(err))
    });
    
})

app.post("/login",async (req,res)=>{
    const username = req.body.username
    const password = req.body.password

    const found = await User.findOne({email: username})
    if(found){
        bcrypt.compare(password, found.password, function(err, result) {
            if(result===true){
                res.render("secrets")
            } else {
                res.send("false")
            }
        });
    } else{
        console.log("err");
    }
})

app.get("/secrets", (req,res)=>{
    res.render("secrets")
})

app.get("/submit", (req,res)=>{
    res.render("submit")
})


app.listen(3000, ()=>console.log("Server on 3000"))