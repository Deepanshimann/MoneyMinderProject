require('dotenv').config();
const mongoose=require("mongoose");
const mongoUrl = process.env.MONGODB_URL;

mongoose.connect(mongoUrl);
const db=mongoose.connection;
db.on("error",function(err){
    console.log(err);
})
db.on("open",function(){
    console.log("connected to the database");
})
module.exports=db;
