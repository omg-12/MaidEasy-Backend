const express = require('express');
const Admin = require('../models/Admin');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "Omis&agood&boy";
const fetchUser = require('../middleware/fetchUser');


// ENDPOINT 1:  Add a Admin using : POST "/api/admin/addAdmin". No login required

router.post('/addAdmin', async (req, res) => {
    try {
        // Creating the Admin and save it in db
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        
        const admin = await Admin.create({
            name: req.body.name,
            email : req.body.email,
            password : secPass
        });

        return res.json({
            status : "SUCCESS",
            message : "Admin added successfully!"
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Admin not added, Retry again later!"
        });
    }
})

//ENDPOINT 4: Login an admin using : POST "/api/admin/login".

// in this route no login required, hence we donot use any middleware here for the authentication.
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password cannot be blank. ').exists(),
], async (req, res) => {

    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "FAILED",
            message: errors.array()
        });
    }

    const { email, password } = req.body;
    try {
        let user = await Admin.findOne({ email });

        // if no user exists then return error
        if (!user) {
            return res.status(400).json({
                status: "FAILED",
                message: "No Admin exists with such credentials."
            });
        }

        // if user with given email exists then match the corresponding password with entered one
        const passwordCompare = await bcrypt.compare(password, user.password);

        // if password doesnot match, return error
        if (!passwordCompare) {
            return res.status(400).json({
                status: "FAILED",
                message: "Invalid credentials."
            });
        }

        // if password matches, send the data        
        const data = {
            user: {
                id: user._id
            }
        }

        // generating auth token
        const authToken = jwt.sign(data, JWT_SECRET);

        // sending auth token of corresponding user as response
        res.json({
            status: "SUCCESS",
            authToken: authToken
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error"
        });
    }
});



module.exports = router;