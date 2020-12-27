const { Router } = require('express');
const User = require('../model/User');
const router = require('express').Router();
const { registerValidate, loginValidate } = require('./validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

router.get('/', (req, res) => {
    res.send("Welcome to backend");
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

    // output message for mail
    const output = `
    <p>You have a contact reuqest</p>
    <p>Contact Details are : </p>
    <ul>
    <li>First Name : ${req.body.firstName}</li>
    <li>Last Name : ${req.body.lastName}</li>
    <li>Email : ${req.body.email}</li>
    <li>Password : ${req.body.password}</li>
    </ul>
    `;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'ritikaperformer04@gmail.com', // generated ethereal user
            pass: process.env.PASSWORD, // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false,
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Ritika Singh 👻" <ritikaperformer04@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "Team MyWay", // Subject line
        text: "Hello world?", // plain text body
        html: output, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    res.render('contact', { msg: 'EMAIL HAS BEEN SENT' });
})

router.post('/login', async (req, res) => {
    const { error } = loginValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Email doesn't exists");

    const checkPass = await bcrypt.compare(req.body.password, user.password);
    if (!checkPass) return res.status(400).send("Email or Password is wrong");

    // create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
    //res.send("Logged In");
})

router.post('/forgotPassword', (req, res) => {
    const { error } = loginValidate(req.body);
    if (error) return res.status(400).send(error.details[0].mes)
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