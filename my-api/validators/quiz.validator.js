const {body , validationResult} = require("express-validator")
const quizpublishValidator = [
    body("state").isIn(["in-progress","expired"]).withMessage("state must be in-progress or expired")
]

 const handleValidationErors = (req,res,next)=>{
    const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next()
}

module.exports = {handleValidationErors,quizpublishValidator}