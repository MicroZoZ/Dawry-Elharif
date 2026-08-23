const jsonwebtoken = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()

const generatetoken = (user)=>{
    return jsonwebtoken.sign({
        id: user._id,
        userName: user.userName,
        role:user.role,
        email:user.email,
        studyYear:user.studyYear
    }
,
    process.env.SECRET,
{expiresIn:"7d"})
}

module.exports = generatetoken