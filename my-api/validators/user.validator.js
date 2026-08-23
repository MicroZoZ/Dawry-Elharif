const {body , validationResult} = require("express-validator")

 const registerValidation = [
    body("email").isEmail().withMessage("please enter valid email"),
    body("password").isLength({min:6}).withMessage("password must be more than 6 digets"),
    body("userName").notEmpty().withMessage("please enter username")
]

const loginValidation =[
    body("email").isEmail().withMessage("please enter valid email"),
    body("password").isLength({min:6}).withMessage("password must be more than 6 digets"),

]
 const handleValidationErors = (req,res,next)=>{
    const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next()
}
const userUpdateValidations = [
    body("email").isEmail().withMessage("please enter valid email"),
    body("password").isLength({min:6}).withMessage("password must be more than 6 digets"),
]
const changePasswordValidator = [
    body("password").notEmpty().isLength({min:6}).withMessage("password must be more than 6 digets"),
]

const changeRole = [
    body("role").notEmpty().isIn(["admin","student"]).withMessage("role must be admin or student"),
]
module.exports = {handleValidationErors,changeRole,changePasswordValidator,registerValidation,loginValidation,userUpdateValidations}