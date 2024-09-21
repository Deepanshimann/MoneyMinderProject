const express = require('express');
const session = require('express-session');
const app = express();
const path=require('path');
const fs=require("fs");
require('./config/mongoose');
const userRouter=require("./routes/user");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(session({
  secret: 'asdfghjkl12345',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if you are using HTTPS
}));

app.use("/users",userRouter);

app.get('/', function (req, res) {
       res.render("index",{ user: req.session.user });
    })

    function ensureAuthenticated(req, res, next) {
      if (req.session.user) {
          return next();
      }
      res.redirect('/users/login');
  }
  

  // app.get('/expenselog',ensureAuthenticated, function (req, res) {
  //   fs.readdir(`./hisaab`,function(err,files){   //created a folder name hisaab
  //     if(err) return res.status(500).send(err);
  //      res.render("expenselog",{files:files});
  //   })
  // })
//list of all expenses
app.get('/expenselog',ensureAuthenticated,async function(req,res){
try{
  const expenses= await Expense.find({userId:req.session.user.id});
  res.render('expenselog',{files:expenses});
}catch{
  console.error('Error retrieving expenses:', error);
  res.status(500).send('Error retrieving expenses');
}
})



  //takes to add expense page 
  app.get("/create",ensureAuthenticated,function(req,res){
    res.render("create");
  })

  //get Date
  var currentDate=new Date();
  var date=`${currentDate.getDate()}-${currentDate.getMonth()+1}-${currentDate.getFullYear()}`;
  
  //code for the page where user will be writing expenditure and submiting it.. 
  // app.post("/createhisaab",ensureAuthenticated,function(req,res){
  //   fs.writeFile(`./hisaab/${req.body.title+" "+date}.txt`,req.body.content,function(err){
  //     if(err) return res.status(500).send(err);
  //     res.redirect("/")
  //   })
  // })
 const Expense = require('./models/expenseSchema');
app.post('/createhisaab', ensureAuthenticated, async (req, res) => {
    try {
        const newExpense = new Expense({
            userId: req.session.user.id,
            title: req.body.title,
            content: req.body.content
        });

        await newExpense.save();
        res.redirect('/expenselog');
    } catch (error) {
        console.error('Error saving expense:', error);
        res.status(500).send('Error saving expense');
    }
});

  
  //code for editing any list
  app.get("/edit/:filename",ensureAuthenticated,function(req,res){
    fs.readFile(`./hisaab/${req.params.filename}`,"utf-8",function(err,filedata){
      if(err) return res.status(500).send(err);
      res.render("edit",{filedata,filename: req.params.filename});
    })
  })

  //code for updating 
  app.post("/update/:filename",ensureAuthenticated,function(req,res){
    fs.writeFile(`./hisaab/${req.params.filename}`,req.body.content,function(err){
      if(err) return res.status(500).send(err);
      res.redirect("/expenselog")
    })
  })

  //code for + showing data
  app.get("/hisaab/:filename",function(req,res){
    fs.readFile(`./hisaab/${req.params.filename}`,"utf-8",function(err,filedata){
      if(err)return res.status(500).send(err)
        res.render("hisaab",{filedata,filename:req.params.filename})
    })
  })
  app.get("/delete/:filename",function(req,res){
    fs.unlink(`./hisaab/${req.params.filename}`,function(err){
      if(err)return res.status(500).send(err)
        res.redirect("/expenselog")
    })
  })
  app.listen(3000)