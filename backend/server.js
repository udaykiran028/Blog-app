//creating exp appplication
const exp = require('express')
const app = exp()
require('dotenv').config()
const mongoClient = require('mongodb').MongoClient
const path = require('path')
const cors = require('cors')

//deploy react build in this server
//app.use(exp.static(path.join(__dirname,'../client/build')))

app.use(cors())
//to parse the body of req
app.use(exp.json())

//connect to database
mongoClient.connect(process.env.DB_URL)
.then(client=>{
    //get db obj
    const blogdb = client.db('blogdb')
    //get user collection obj
    const userscollection = blogdb.collection('userscollection')
    //get article collection obj
    const articlescollection = blogdb.collection('articlescollection')
    //get authors collection obj
    const authorscollection= blogdb.collection('authorscollection')

    //share user collection obj with express app
    app.set('userscollection',userscollection)
    //share article collectio obj
    app.set('articlescollection',articlescollection)
    //share  author collection obj
    app.set('authorscollection',authorscollection)
    
    //confirm db connection status
    console.log('DB connection success...')    
})
.catch(err=>console.log("Err in DB connection:",err))




//importing api Routes
const userApp = require('./APIs/user-api')
const authorApp = require('./APIs/author-api')
const adminApp = require('./APIs/admin-api')

//if path starts with user-api, send request to userApp
app.use('/user-api',userApp)
//if path starts with author-api, send request to authorApp
app.use('/author-api',authorApp)
//if path starts with user-api, send request to adminApp
app.use('/admin-api',adminApp)


//deals with page refresh
// app.use((req,res,next)=>{
//     res.sendFile(path.join(__dirname,'../client/build/index.html'))
// })



//express error handler
app.use((err,req,res,next)=>{
    res.send({message:"error:",payload:err.message})
})


//assigning port number
const port = process.env.PORT || 5000
app.listen(port,()=>console.log(`server is running on port ${port}`))