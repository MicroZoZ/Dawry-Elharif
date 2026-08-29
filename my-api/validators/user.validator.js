const {body , validationResult} = require("express-validator")

 const registerValidation = [
    body("email").isEmail().withMessage("please enter valid email"),
    body("password").isLength({min:6}).withMessage("password must be more than 6 digits"),
    body("userName").notEmpty().withMessage("please enter username"),
    body("phoneNumber").notEmpty().withMessage("من فضلك ادخل رقم الهاتف ").isLength({min:13})
]

const loginValidation =[
    body("email").isEmail().withMessage("please enter valid email"),
    body("password").isLength({min:6}).withMessage("password must be more than 6 digits"),
]
 const handleValidationErors = (req,res,next)=>{
    const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next()
}
const userUpdateValidations = [
    body("password").isLength({min:6}).withMessage("برجاء ادخل رمز سري مكون من أكثر من 6 أحرف"),
]
const changePasswordValidator = [
    body("password").notEmpty().isLength({min:6}).withMessage("password must be more than 6 digets"),
]

const changeRole = [
    body("role").notEmpty().isIn(["admin","student"]).withMessage("role must be admin or student"),
]
module.exports = {handleValidationErors,changeRole,changePasswordValidator,registerValidation,loginValidation,userUpdateValidations}