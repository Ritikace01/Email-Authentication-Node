const router = require('express').Router();
const verify = require('../jwtVerify');
const User = require('../../model/User');

router.get('/', verify, (req, res) => {
    res.send(req.user);
    // const obj = User.findOne({ _id: req.user });
})

module.exports = router;