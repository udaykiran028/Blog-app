//creating user api app
const exp = require('express')
const userApp = exp.Router()
const bcryptjs = require('bcryptjs')
const expressAsyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const verifyToken = require('../Middlewares/verifyToken')
require('dotenv').config()

let userscollection
let articlescollection
//get user collection
userApp.use((req,res,next)=>{
    userscollection = req.app.get('userscollection')
    articlescollection = req.app.get('articlescollection')
    next()
})

//user registration route
userApp.post('/user',expressAsyncHandler(async(req,res)=>{
    //get user resource from client
    const newUser = req.body
    //check for duplicate user based on username
    const dbuser = await userscollection.findOne({username:newUser.username})
    //if user found
    if(dbuser !== null ){
        res.send({message:'User existed'})
    }else{
        //hash the password
        const hashedPassword = await bcryptjs.hash(newUser.password,6)
        //replace the plain pw with hashed pw
        newUser.password = hashedPassword
        //create user
        await userscollection.insertOne(newUser)
        //send the res
        res.send({message:'user created'})
    }
}))

//user login
userApp.post('/login',expressAsyncHandler(async(req,res)=>{
    //get cred obj
    const userCred = req.body
    //check for username
    const dbuser = await userscollection.findOne({username:userCred.username})
    if(dbuser === null){
        return res.send({message:"Invlid username"})
    }else{
    //check for password
    const status = await bcryptjs.compare(userCred.password,dbuser.password)
    if(status === false){
        res.send({message:"Invalid password"})
    }else{
    //create jwt token
         const signedToken = jwt.sign({username:dbuser.username},process.env.SECRET_KEY,{expiresIn:20})
    //send res
         res.send({message:"login success",token:signedToken,user:dbuser})
    }
    }
}))

//get articles of all authors 
userApp.get('/articles',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get the articlescollection from express app
    const articlescollection = req.app.get('articlescollection')
    //get all articles
    const articlesList = await articlescollection.find({status:true}).toArray()
    //send res
    res.send({message:"articles",payload:articlesList})
}))

//post comments for an article by article id
userApp.post('/comment/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get user comment obj
    const userComment = req.body
    const articleIdFromUrl = req.params.articleId
    //insert userComment object to comments array of article by id
    let result = await articlescollection.updateOne({articleId:articleIdFromUrl},{$addToSet:{Comments:userComment}})
    console.log(result)
    res.send({message:'comment posted'})
}))

//exporting the userApp
module.exports = userApp