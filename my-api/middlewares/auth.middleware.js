const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const allowedRoutes = [
    "POST:/API/V1/auth/login",
    "POST:/API/V1/auth/register",
]
const {User} = require("../models/user.model")


dotenv.config()
const authMiddleWare = async(req , res , next) => {
    const method = req.method
    const path = req.path
    const route = `${method}:${path}`
    if (allowedRoutes.some(allowedRoutes => route.includes(allowedRoutes))) {return next()}
    
    try{
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.json({success: false,message:"invalid token"})
        const decode = jwt.verify(token,process.env.SECRET)
        const user = await User.findById(decode.id)
        if(!user){ return res.status(401).json({message:"insufficent role please log out and log in again"})}
        if(!(user.role === decode.role)){return res.status(401).json({message:"insufficent role please log out and log in again"})}
        
        req.auth = {
            userName:decode.userName,
            id: decode.id,
            role:decode.role,
            email:decode.email,
            studyYear:decode.studyYear
        }
        next()
        
    }
    catch(e){
        return res.json({success:false,
            message:e.message   
        })
    }
}

module.exports = authMiddleWare