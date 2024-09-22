require('dotenv').config();
const mongoose=require("mongoose");

const session = require('express-session');
const MongoStore=require('connect-mongo');

const mongoUrl = process.env.MONGODB_URL;
mongoose.connect(mongoUrl);
const db=mongoose.connection;
db.on("error",function(err){
    console.log(err);
})
db.on("open",function(){
    console.log("connected to the database");
})

const store=MongoStore.create({
    mongoUrl:mongoUrl ,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});
store.on("error",()=>{
    console.log("Error in mongo session store",err);
});

module.exports=db;
