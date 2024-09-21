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
    });

    //authentication function
   function ensureAuthenticated(req, res, next) {
      if (req.session.user) {
          return next();
      }
      res.redirect('/users/login');
  }
  
//list of all expenses
app.get('/expenselog',ensureAuthenticated,async function(req,res){
try{
  const expenses= await Expense.find({userId:req.session.user.id}).sort({ createdAt: -1 });
  res.render('expenselog',{ expenses });
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
 const Expense = require('./models/expenseSchema');
app.post('/createhisaab', ensureAuthenticated, async (req, res) => {
  const { title, content, encrypted, passcode, shareable } = req.body;
    try {
        const newExpense = new Expense({
            userId: req.session.user.id,
            title: req.body.title,
            content: req.body.content,
            encrypted: encrypted === 'true', 
            passcode: encrypted === 'true' ? passcode : undefined, // Only set passcode if encrypted
            shareable: shareable === 'true' 
        });

        await newExpense.save();
        res.redirect('/expenselog');
    } catch (error) {
        console.error('Error saving expense:', error);
        res.status(500).send('Error saving expense');
    }
});

  
  //code for editing any list
  app.get("/edit/:id",ensureAuthenticated,async function(req,res){
try{
  const expense = await Expense.findById(req.params.id);
  if (!expense || expense.userId.toString() !== req.session.user.id) {
    return res.status(404).send("Expense not found or access denied");
}
res.render("edit", { filename: expense.title, filedata: expense.content, id: expense._id });
}catch(error){
  console.error("Error fetching expense:", error);
  res.status(500).send("Error fetching expense details");
}
  })

  //code for updating 
  app.post("/update/:id",ensureAuthenticated,async function(req,res){
    try{
      const { title, content } = req.body;
      const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, userId: req.session.user.id },
        { title, content },
        { new: true }
    );
    if (!expense) {
      return res.status(404).send("Expense not found or access denied");
  }
  res.redirect("/expenselog");
    }catch(error){
      console.error("Error updating expense:", error);
      res.status(500).send("Error updating expense");
    }
  })

  //code for + showing data
  app.get("/hisaab/:id", ensureAuthenticated, async function(req,res){
   try{
    const expense = await Expense.findById(req.params.id);
    if (expense.encrypted) {
      // Show a form to enter the passcode or handle this logic on the frontend
      return res.render('enterPasscode', { id: req.params.id });
    }
      // If not encrypted, or passcode is correct, show the expense
  res.render("hisaab", { 
    title: expense.title, 
    content: expense.content,
    id: expense._id ,
  });
   }catch(error){
    console.error("Error retrieving expense details:", error);
    res.status(500).send("Error retrieving expense details");
   }
  })


  app.get("/delete/:id", ensureAuthenticated,async function(req,res){
try{
  const result = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.session.user.id });
  if (!result) {
    return res.status(404).send("Expense not found or access denied");
}
res.redirect("/expenselog");
}catch(error){
  console.error("Error deleting expense:", error);
  res.status(500).send("Error deleting expense");
}
  })

// Post route to verify the passcode
app.post('/verifyPasscode/:id', async (req, res) => {
  try {
    const { passcode } = req.body;
    const expense = await Expense.findById(req.params.id);

    // Check if the expense exists and the passcode matches
    if (expense && expense.passcode === passcode) {
      // Respond with success status and redirect URL
      res.json({ success: true, url: `/hisaab/${expense._id}` });
    } else {
      // Respond with error status and message
      res.json({ success: false, message: 'Incorrect passcode. Please try again.' });
    }
  } catch (error) {
    // Respond with error status and message in case of an exception
    console.error('Error verifying passcode:', error);
    res.status(500).json({ success: false, message: 'An error occurred while verifying the passcode.' });
  }
});


  app.listen(3000)