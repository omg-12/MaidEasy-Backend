const express = require('express');
const Worker = require('../models/Worker');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "Omis&agood&boy";
const fetchUser = require('../middleware/fetchUser');


// ENDPOINT 1:  Register a worker using : POST "/api/worker/registerWorker". No login required

router.post('/registerWorker', [
    body('name', 'Name must consists of minimum 2 characters').isLength({ min: 2 }),
    body('contact', 'Contact Number must be valid 10 digit phone number').isLength({ min:10 , max:10 }),
    body('age', 'Minimum age requirement is 18').isNumeric({min:18}),
    body('city', 'Please Enter your city!').isLength({min:1}),
    body('state', 'Please Enter your state!').isLength({min:1}),
    body('state' , 'Please Enter your Occupation!').isLength({min:1}),
    body('gender', 'Please select a gender').isLength({min : 1})
], async (req, res) => {
    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(500).json({
            status: "FAILED",
            message: errors.array()[0].msg
        });
    }
    try {
        // Check whether worker with same contact exists already
        let worker = await Worker.findOne({ contact: req.body.contact });
        if (worker) {
            return res.status(400).json({
                status: "FAILED",
                message: "Sorry, A worker is already registered with this contact number. Try with other contact number."
            })
        }
        // if no worker with same contact exists then register worker with the given contact and details

        // Creating the worker and save it in db
        worker = await Worker.create({
            name: req.body.name,
            contact: req.body.contact,
            age: req.body.age,
            gender : req.body.gender,
            city : req.body.city,
            state : req.body.state,
            occupation : req.body.occupation,
            verified: false,
        });

        return res.json({
            status : "SUCCESS",
            message : "Registration done successfully!"
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Registration Unsuccessfull!"
        });
    }
})

// ENDPOINT : Get all verified Workers Details except contact 
router.get('/getVerifiedWorkers', async (req, res) => {
    try {
        // get the list of all verified users.
        const workers = await Worker.find({verified : true});
        res.json({
            status : "SUCCESS",
            workersList : workers
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status : "FAILED",
            message : "Internal Server Error, Failed to fetch Workers details!"
        })
    }
})

// ENDPOINT : Get unverified workers details 
router.get('/getUnverifiedWorkers', fetchUser , async (req, res) => {
    try {
        // get the list of all users.
        const workers = await Worker.find({verified : false});
        res.json({
            status : "SUCCESS",
            workersList : workers
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status : "FAILED",
            message : "Internal Server Error, Failed to fetch Workers details!"
        })
    }
})

// ENDPOINT : Verify a Worker by admin
router.post('/verifyWorker' , fetchUser , async(req , res) => {

    const {workerID} = req.body;
    try {
        const worker = await Worker.findByIdAndUpdate(workerID,{ verified : true });
        return res.json({
            status : "SUCCESS",
            message : "Worker Request verified successfully!"
        })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status : "FAILED",
            message : "Internal Server Error, Failed to verify the Workers!"
        })
    }
})

// ENDPOINT : Delete a worker's request.
router.delete('/deleteWorker' , fetchUser , async(req ,res) => {
    const {workerID} = req.body;
    try{
        const worker = await Worker.findByIdAndDelete(workerID);
        return res.json({
            status : "SUCCESS",
            message : "Worker details deleted successfully!"
        })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status : "FAILED",
            message : "Internal Server Error, Failed to delete the Worker!"
        })
    }
})

module.exports = router;