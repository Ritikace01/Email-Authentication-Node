// Validation
const Joi = require('@hapi/joi');

// only email validation
const emailValidate = (body) => {
    const schema = Joi.object({
        email: Joi.string().required().max(255).email(),
        OTP: Joi.string().required(),
    });
    return schema.validate(body);
}

// register validation
const registerValidate = (body) => {
    const schema = Joi.object({
        firstName: Joi.string().required().max(10),
        lastName: Joi.string(),
        email: Joi.string().required().max(255).email(),
        password: Joi.string().required().max(1024).min(6),
    });
    return schema.validate(body);
}

const loginValidate = (body) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6)
    })
    return schema.validate(body);
}

const forgotValidate = (body) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
    });
    return schema.validate(body);
}

const passwordValidate = (body) => {
    const schema = Joi.object({
        password1: Joi.string().required().min(6).max(20),
        password2: Joi.string().valid(Joi.ref('password1')).required(),
    });
    return schema.validate(body);
}

module.exports.registerValidate = registerValidate;
module.exports.loginValidate = loginValidate;
module.exports.emailValidate = emailValidate;
module.exports.forgotValidate = forgotValidate;
module.exports.passwordValidate = passwordValidate;