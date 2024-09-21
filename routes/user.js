const express=require("express");
const router=express.Router();
const userModel=require("../models/user");
const bcrypt = require('bcryptjs');

router.get("/create",async function(req,res,){
    res.render("register_user");
})

router.post("/create", async function(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash password
        let createdUser = await userModel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword, 
        });
        console.log("User created", createdUser);
        res.redirect("/users/login");
    } catch (error) {
        console.log(error);
        res.render("register_user", {
            error: error.message,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
    }
});


router.get("/login",function(req,res){
    res.render("login_form",{ user: req.session.user });
})


router.post("/login", async function(req, res){
    try {
        let user = await userModel.findOne({ email: req.body.email });

        if (user) {
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (isMatch) {
                // Set user info in session
                req.session.user = { id: user._id, name: user.name, email: user.email };
                console.log("User logged in successfully:", req.session.user);
                res.redirect('/');
            } else {
                // Password does not match
                res.render("login_form", { error: "Invalid credentials." });
            }
        } else {
            // No user found with that email
            res.render("login_form", { error: "No user found with that email." });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).render("login_form", { error: "An error occurred while trying to login." });
    }
});



// in userRouter file
router.get('/logout', function(req, res) {
    // Assuming you're using session-based authentication
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send("Failed to logout");
        }
        res.redirect('/users/login');
    });
});



module.exports=router;
