const express = require('express');
const Worker = require('../models/Worker');
const CookJob = require('../models/CookJob');
const BabysitterJob = require('../models/BabysitterJob');
const DriverJob = require('../models/DriverJob');
const HouseHelpJob = require('../models/HouseHelpJob');
const OfficeBoyJob = require('../models/OfficeBoyJob');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "Omis&agood&boy";
const fetchUser = require('../middleware/fetchUser');


// ENDPOINT 1:  Register a worker using : POST "/api/worker/registerWorker". No login required

router.post('/registerWorker', [
    body('name', 'Name must consists of minimum 2 characters').isLength({ min: 2 }),
    body('contact', 'Contact Number must be valid 10 digit phone number').isLength({ min: 10, max: 10 }),
    body('age', 'Minimum age requirement is 18').isNumeric({ min: 18 }),
    body('city', 'Please Enter your city!').isLength({ min: 1 }),
    body('state', 'Please Enter your state!').isLength({ min: 1 }),
    body('state', 'Please Enter your Occupation!').isLength({ min: 1 }),
    body('gender', 'Please select a gender').isLength({ min: 1 })
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
            gender: req.body.gender,
            city: req.body.city,
            state: req.body.state,
            occupation: req.body.occupation,
            expectedSalary: req.body.expectedSalary,
            verified: false,
        });

        return res.json({
            status: "SUCCESS",
            message: "Registration done successfully!"
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
        const workers = await Worker.find({ verified: true });
        res.json({
            status: "SUCCESS",
            workersList: workers
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to fetch Workers details!"
        })
    }
})

// ENDPOINT : Get unverified workers details 
router.get('/getUnverifiedWorkers', fetchUser, async (req, res) => {
    try {
        // get the list of all users.
        const workers = await Worker.find({ verified: false });
        res.json({
            status: "SUCCESS",
            workersList: workers
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to fetch Workers details!"
        })
    }
})

// ENDPOINT : Verify a Worker by admin
router.post('/verifyWorker', fetchUser, async (req, res) => {

    const { workerID } = req.body;
    try {
        const worker = await Worker.findByIdAndUpdate(workerID, { verified: true });
        return res.json({
            status: "SUCCESS",
            message: "Worker Request verified successfully!",
        })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to verify the Workers!"
        })
    }
})

// ENDPOINT : Get a workers details by id
router.post('/GetWorkerDetails/:id', fetchUser, async (req, res) => {

    const { workerID } = req.body;
    try {
        const worker = await Worker.findById(req.params.id);
        return res.json({
            status : "SUCCESS",
            details : worker
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to fetch workers details!"
        })
    }
})

// ENDPOINT : Delete a worker's request.
router.delete('/deleteWorker', fetchUser, async (req, res) => {
    const { workerID } = req.body;
    try {
        const worker = await Worker.findById(workerID);
        if (worker.occupation == "Babysitter") {
            const deljob = await BabysitterJob.findOneAndDelete({ workerID: workerID });
        }
        else if (worker.occupation == "Cook") {
            const deljob = await CookJob.findOneAndDelete({ workerID: workerID });
        }
        else if (worker.occupation == "Driver") {
            const deljob = await DriverJob.findOneAndDelete({ workerID: workerID });
        }
        else if (worker.occupation == "HouseHelp") {
            const deljob = await HouseHelpJob.findOneAndDelete({ workerID: workerID });
        }
        else if (worker.occupation == "OfficeBoy") {
            const deljob = await OfficeBoyJob.findOneAndDelete({ workerID: workerID });
        }
        const delworker = await Worker.findByIdAndDelete(workerID);
        return res.json({
            status: "SUCCESS",
            message: "Worker details deleted successfully!"
        })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to delete the Worker!"
        })
    }
})

// ENDPOINT : To check availability of User.
router.post('/CheckAvailability' , fetchUser , async(req , res) => {
    const {workerID , occupation} = req.body;
    try {
        if(occupation == "HouseHelp"){
            const EmployeeExists = await doesHouseHelpExist(workerID);
            if(EmployeeExists){
                return res.json({
                    status: "Not Available",
                    message: "This Employee is not available."
                })
            }
        }
        else if(occupation == "Babysitter"){
            const EmployeeExists = await doesBabysitterExist(workerID);
            if(EmployeeExists){
                return res.json({
                    status: "Not Available",
                    message: "This Employee is not available."
                })
            }
        }
        else if(occupation == "Cook"){
            const EmployeeExists = await doesCookExist(workerID);
            if(EmployeeExists){
                return res.json({
                    status: "Not Available",
                    message: "This Employee is not available."
                })
            }
        }
        else if(occupation == "Driver"){
            const EmployeeExists = await doesDriverExist(workerID);
            if(EmployeeExists){
                return res.json({
                    status: "Not Available",
                    message: "This Employee is not available."
                })
            }
        }
        else{
            const EmployeeExists = await doesOfficeBoyExist(workerID);
            if(EmployeeExists){
                return res.json({
                    status: "Not Available",
                    message: "This Employee is not available."
                })
            }
        }
        return res.json({
            status: "Available",
            message: "This Employee is available."
        })
    }
    catch{
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to check Availability of the Employee!"
        })
    }
})


// ENDPOINT : To book a HouseHelp
async function doesHouseHelpExist(workerID) {
    try {
        const worker = await HouseHelpJob.findOne({ workerID });
        return worker !== null;
    } catch (err) {
        return false;
    }
}

router.post('/BookHouseHelp', fetchUser, async (req, res) => {
    const { workerID, name, address, salary, startDate, houseSize } = req.body;
    try {
        const EmployeeExists = await doesHouseHelpExist(workerID);

        if (EmployeeExists) {
            return res.status(500).json({
                status: "FAILED",
                message: "This Employee is not available."
            })
        } else {
            const newjobdetails = HouseHelpJob.create({
                workerID: workerID,
                employerID: req.user.id,
                name: name,
                address: address,
                salary: salary,
                startDate: startDate,
                houseSize: houseSize
            })

            return res.json({
                status: "SUCCESS",
                message: "booking Done Successfully.",
            })
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to Book the Employee!"
        })
    }
})

// ENDPOINT : To book a Babysitter
async function doesBabysitterExist(workerID) {
    try {
        const worker = await BabysitterJob.findOne({ workerID });
        return worker !== null;
    } catch (err) {
        return false;
    }
}
router.post('/BookBabysitter', fetchUser, async (req, res) => {
    const { workerID, name, address, salary, startDate, babyAge, hoursPerDay } = req.body;
    try {
        const EmployeeExists = await doesBabysitterExist(workerID);

        if (EmployeeExists) {
            return res.status(500).json({
                status: "FAILED",
                message: "This Employee is not available."
            })
        } else {
            const newjobdetails = BabysitterJob.create({
                workerID: workerID,
                employerID: req.user.id,
                name: name,
                address: address,
                salary: salary,
                startDate: startDate,
                babyAge: babyAge,
                hoursPerDay: hoursPerDay
            })

            return res.json({
                status: "SUCCESS",
                message: "booking Done Successfully.",
            })
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to Book the Employee!"
        })
    }
})

// ENDPOINT : To book a Cook
async function doesCookExist(workerID) {
    try {
        const worker = await CookJob.findOne({ workerID });
        return worker !== null;
    } catch (err) {
        return false;
    }
}
router.post('/BookCook', fetchUser, async (req, res) => {
    const { workerID, name, address, salary, startDate, mealCount, headCount } = req.body;
    try {
        const EmployeeExists = await doesCookExist(workerID);

        if (EmployeeExists) {
            return res.status(500).json({
                status: "FAILED",
                message: "This Employee is not available."
            })
        } else {
            const newjobdetails = CookJob.create({
                workerID: workerID,
                employerID: req.user.id,
                name: name,
                address: address,
                salary: salary,
                startDate: startDate,
                mealCount: mealCount,
                headCount: headCount
            })

            return res.json({
                status: "SUCCESS",
                message: "Booking Done Successfully.",
            })
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to Book the Employee!"
        })
    }
})

// ENDPOINT : To book a Driver
async function doesDriverExist(workerID) {
    try {
        const worker = await DriverJob.findOne({ workerID });
        return worker !== null;
    } catch (err) {
        return false;
    }
}
router.post('/BookDriver', fetchUser, async (req, res) => {
    const { workerID, name, address, salary, startDate, hoursPerDay } = req.body;
    try {
        const EmployeeExists = await doesDriverExist(workerID);

        if (EmployeeExists) {
            return res.status(500).json({
                status: "FAILED",
                message: "This Employee is not available."
            })
        } else {
            const newjobdetails = DriverJob.create({
                workerID: workerID,
                employerID: req.user.id,
                name: name,
                address: address,
                salary: salary,
                startDate: startDate,
                hoursPerDay: hoursPerDay
            })

            return res.json({
                status: "SUCCESS",
                message: "Booking Done Successfully.",
            })
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to Book the Employee!"
        })
    }
})

// ENDPOINT : To book a Office Boy
async function doesOfficeBoyExist(workerID) {
    try {
        const worker = await OfficeBoyJob.findOne({ workerID });
        return worker !== null;
    } catch (err) {
        return false;
    }
}
router.post('/BookOfficeBoy', fetchUser, async (req, res) => {
    const { workerID, name, address, salary, startDate, hoursPerDay } = req.body;
    try {
        const EmployeeExists = await doesOfficeBoyExist(workerID);

        if (EmployeeExists) {
            return res.status(500).json({
                status: "FAILED",
                message: "This Employee is not available."
            })
        } else {
            const newjobdetails = OfficeBoyJob.create({
                workerID: workerID,
                employerID: req.user.id,
                name: name,
                address: address,
                salary: salary,
                startDate: startDate,
                hoursPerDay: hoursPerDay
            })

            return res.json({
                status: "SUCCESS",
                message: "Booking Done Successfully.",
            })
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error, Failed to Book the Employee!"
        })
    }
})

module.exports = router;