//creating common api app
const exp = require('express')
const commonApp = exp.Router()


commonApp.get('/common',(req,res,)=>{
    res.send({message:"Reply from a common app"})
})


//exporting the commonApp
module.exports = commonApp