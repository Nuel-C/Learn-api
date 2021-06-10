const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const path = require('path')
const User = require('./models/user')

mongoose.connect('mongodb+srv://Nuel:chuks@cluster0.ldv66.mongodb.net/elearning?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})

app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'build')))

app.get('/', (req,res)=>{
    res.send('>>>loading')
})

app.post('/signup', (req, res)=>{
    User.findOne({username: req.body.username}, async (err, user)=>{
        if(err) throw err
        if(user){
            var c = {success:false, msg:"User already exists"}
            res.send(c)
        } 
        if(!user){
            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(req.body.password, salt);
            const newUser = new User({
                username: req.body.username,
                password: hash,
                email: req.body.email
            })
            await newUser.save((err, reg)=>{
                console.log(reg._id)
                var c = {
                    username:reg.username, 
                    msg:"Success", 
                    success: true, 
                    id: reg._id, 
                    email: reg.email }
                res.send(c)
            })  
        }
    })
})

app.post('/login', (req, res)=>{
    User.findOne({username: req.body.username}, (err, user)=>{
        if(err){
            var c = {
                success : false,
                message: "An unknown error occured",
            }
            res.send(c)
        }else if(!user) {
            var c = {
                success : false,
                message: "No User Found",
            }
            console.log(c)
            res.send(c)
        }else{
            password = user.password
            bcrypt.compare(req.body.password, password, (err, isMatch)=>{
                if(isMatch === true){
                    var c = {
                        success : true,
                        message: "Login Successful",
                        username: user.username,
                        id: user._id,
                        email: user.email
                    }
                    res.send(c) 
                }else{
                    var c = {
                        success : false,
                        message: "Incorrect Password",
                    }
                    res.send(c)
            }
            })
        }
    })
})

app.get('/logout', (req, res)=>{
    req.logout()
    res.send(true)
})

app.get('*', (req, res)=>{
    res.redirect('/')
})

app.listen(process.env.PORT || 5000, ()=>{
    console.log('Api Running')
})