const { Router } = require('express');
const User = require('../model/User');
const router = require('express').Router();
const { registerValidate, loginValidate, emailValidate, forgotValidate, passwordValidate } = require('./validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var nodemailer = require('nodemailer');

dotenv.config();

router.get('/', (req, res) => {
    res.send("Welcome to backend");
})

// api to send otp to the user - take only email
router.post('/sendOtp', async (req, res) => {
    const { error } = emailValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).send("Email already exists");

    // if the email is correct then we need to send otp on that mail
    var OTP = req.body.OTP;

    // output message for mail
    const output = `Hello, kindly use this OTP to create your account,
                    ${OTP}
                    thank you for choosing MyWays!`;

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ritikaperformer04@gmail.com',
            pass: `${process.env.PASSWORD}`
        }
    });

    var mailOptions = {
        from: 'ritikaperformer04@gmail.com',
        to: `${req.body.email}`,
        subject: 'Team MyWay',
        text: output,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent: ' + info.response);
        }
    });
})

router.post('/signUp', async (req, res) => {
    // validate data before making user
    const { error } = registerValidate(req.body);
    // console.log(error.details[0].message);
    if (error) return res.status(400).send(error.details[0].message);

    //check if user is already in db
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).send("Email already exists");

    // hash the password 
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // create new user
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPass,
    });
    // catch error
    try {
        const savedUser = await user.save();
        res.send(savedUser);
    } catch (err) {
        res.status(400).send(err);
    }
})

router.post('/login', async (req, res) => {
    const { error } = loginValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("User doesn't exist");

    const checkPass = await bcrypt.compare(req.body.password, user.password);
    if (!checkPass) return res.status(400).send("Email or Password is wrong");

    // create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
    //res.send("Logged In");
})

router.post('/forgotPassword', async (req, res) => {
    const { error } = forgotValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("User doesn't exist");

    res.send(user);

    // create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    // await res.header('reset-token', token).send(token);

    // output message for mail 
    const output = `Hello, use the following link to reset password,
    https://nifty-kalam-b4d153.netlify.app/resetPassword/${token}
                    thank you for choosing MyWays!`;

    // need to send message to the user with a link
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ritikaperformer04@gmail.com',
            pass: `${process.env.PASSWORD}`
        }
    });

    var mailOptions = {
        from: 'ritikaperformer04@gmail.com',
        to: `${req.body.email}`,
        subject: 'Team MyWay',
        text: output,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent: ' + info.response);
        }
    });
})

router.put('/resetPassword/:id', async (req, res) => {
    // first validate the req body
    const { error } = passwordValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // find the user with user id = req.params.id
    const user = await User.findById(req.params.id);
    console.log("User found", user);

    // hash the password1 field
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password1, salt);
    // update it in the user's password field - in DB
    user.password = hashedPass;
    try {
        const savedUser = await user.save();
        res.send(savedUser);
    } catch (err) {
        res.status(400).send(err);
    }
})

router.get('/:id', (req, res) => {
    User.findById(req.params.id)
        .then(doc => {
            if (!doc) { res.status(400).send("Can't find user"); }
            return res.status(200).json(doc);
        })
        .catch(err => {
            console.log(err);
        });
})

module.exports = router;