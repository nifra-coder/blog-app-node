const express = require('express');
const User = require('../models/user'); // Import the User model
const router = express.Router();

router.get('/signin', (req, res) => {
    res.render('signin');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/');
})

router.post('/signin', async (req, res) => {
    try{
        const { email, password } = req.body;
        const token = await User.matchPasswordAndGenerateToken(email, password);
    
        return res.cookie('token',token).redirect('/');
    }
    catch(error){
        res.render('signin',{error:'Invalid email or password'});
    }
})


router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        console.log(req.body);
        // Create a new user
        const newUser = await User.create({
            fullName,
            email,
            password,
        });
        
        console.log("User created successfully:", newUser);

        // Redirect to home page after successful signup
        return res.redirect('/');
    } catch (err) {
        console.error("Error during user signup:", err.message);

        // Send an error response to the client
        res.status(500).send("Internal Server Error: " + err.message);
    }
});


module.exports = router;
