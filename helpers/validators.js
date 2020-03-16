const { body, validationResult } = require('express-validator')

const validationRules = () => {
    return [
        body('passCode').isLength({ min: 5 }),
        body('signupfName').isLength({ min: 5 }),
        body('passConfirm').custom((value, {req})=>{
            if (value !== req.body.passCode){
                throw new Error('Password Confirmation does not match');
            }
            return true
        })
    ]
}

const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        errs = errors.array().map(msg=> msg.msg)
        res.locals.errors = errs
    }
    return next()
  }
  
  module.exports = {
    validationRules,
    validate
  }