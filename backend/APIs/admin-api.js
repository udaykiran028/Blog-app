//creating admin api app
const exp = require('express')
const adminApp = exp.Router()


adminApp.get('/test-admin',(req,res,)=>{
    res.send({message:"This is from admin api"})
})




//exporting authorApp
module.exports = adminApp