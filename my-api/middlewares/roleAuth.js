const { model } = require("mongoose");

const roleAuth = (allowedRoles)=>{
    return(req,res,next) =>{
    try{
        if(!req.auth){
            return res.status(401).json({
                success:false,
                message:"authorization required",})
        }
    if (allowedRoles.includes(req.auth.role)) return next()
        return res.status(401).json({
        success:false,
        message:"authorization failed",})

        
    }
    catch(e){

    }
}}


const admin = roleAuth(["admin","superAdmin"])
const superAdmin = roleAuth(["superAdmin"])

module.exports = {admin,superAdmin}