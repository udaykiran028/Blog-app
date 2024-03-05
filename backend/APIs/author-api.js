//creating author api app
const exp = require('express')
const authorApp = exp.Router()
const bcryptjs = require('bcryptjs')
const expressAsyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const verifyToken = require('../Middlewares/verifyToken')
require('dotenv').config()


let authorscollection
let articlescollection
//get author collection
authorApp.use((req,res,next)=>{
    authorscollection = req.app.get('authorscollection')
    articlescollection = req.app.get('articlescollection')
    next()
})

//author registration route
authorApp.post('/author',expressAsyncHandler(async(req,res)=>{
    //get author resource from client
    const newAuthor = req.body
    //check for duplicate user based on username
    const dbuser = await authorscollection.findOne({username:newAuthor.username})
    //if author found
    if(dbuser !== null ){
        res.send({message:'Author existed'})
    }else{
        //hash the password
        const hashedPassword = await bcryptjs.hash(newAuthor.password,6)
        //replace the plain pw with hashed pw
        newAuthor.password = hashedPassword
        //create user
        await authorscollection.insertOne(newAuthor)
        //send the res
        res.send({message:'Author created'})
    }
}))

//author login
authorApp.post('/login',expressAsyncHandler(async(req,res)=>{
    //get cred obj
    const authorCred = req.body
    //check for username
    const dbuser = await authorscollection.findOne({username:authorCred.username})
    if(dbuser === null){
        res.send({message:"Invlid username"})
    }else{
    //check for password
    const status = bcryptjs.compare(authorCred.password,dbuser.password)
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
 
//adding new article by author
authorApp.post('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get new article from client
    const newArticle = req.body
    //post to article collection
    await articlescollection.insertOne(newArticle)
    //send res
    res.send({message:"New Article is created"})
}))

//modify article by author
authorApp.put('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get modified article from client
    const modifiedArticle = req.body
    //udate by aricle id
    const result= await articlescollection.updateOne({articleId:modifiedArticle.articleId},{$set:modifiedArticle})
    //send res
    res.send({message:"Article modified"})
}))

//delete the article by article id
authorApp.put('/article/:articleId',verifyToken,expressAsyncHandler(async (req,res)=>{
    //get article id from url
    const articleIdFromUrl = req.params.articleId;
    //get article
    const articleToDelete = req.body
    //update the status of the article to delete
    await articlescollection.updateOne({articleId:articleIdFromUrl},{$set:{...articleToDelete,status:false}})
    res.send({message:"Article removed"})
}));

//read articles of author
authorApp.get('/articles/:username',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get author username from url
    const authorName = req.params.username
    //get articles whose status is true
    const articleList = await articlescollection.find({status:true,username:authorName}).toArray()
    //send response with list of articles
    res.send({message:"List of articles",payload:articleList})
}))

//exporting authorApp
module.exports = authorApp