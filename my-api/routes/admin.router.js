const express = require("express")
const {User} = require("../models/user.model")
const router = express.Router()
const generatetoken = require("../helpers/jwt")
const {admin,superAdmin} = require("../middlewares/roleAuth") 
const {handleValidationErors,changePasswordValidator,changeRole} = require("../validators/user.validator")


router.get("/",admin,async(req,res)=>{
    const admins = await User.find({role:{$in:["admin","superAdmin"]}})
    if(!admins || admins.length===0) return res.json({message:"there is no admin or super admins curently"})
    return res.json({success:true,data:admins})        
})

router.get("/student",admin,async(req,res)=>{
    const student = await User.find({role:{$in:["student"]}})
    if(!student || student.length===0) return res.json({message:"there is no student curently"})
    return res.json({success:true,data:student})        
})

router.get("/student/:id", async (req,res) => {
    try{
    const id = req.params.id
    if(!id) return res.status(400).json({message:"invalid id"})
    const user = await User.findById(id)
    if(!user) return res.status(400).json({message:"invalid User"})
    return res.status(200).send(user)
}

catch(err){
    return res.status(400).json({message:err.msg})
}
})
router.delete("/editStudent/:id",admin , async(req,res)=>{
        const id = req.params.id
        if(!student) return res.json({success:false,message:"there is no student with that id"})
        if(!(student.role === "student") && !(req.auth.role ==="superAdmin"))return res.json({success:false,message: "authorization failed you can only change student password"})
    try{
        const student = await User.findByIdAndDelete(id)
        if(!student){
            return res.json({message:`cant find student with an id ${id}`})
        }
        return res.json({message:"student deleted successfully"})
    }
    catch(err){
        return res.status(400).json({success:false,message:err.message})
    }
})
router.post("/editStudent/:id",admin,changePasswordValidator,handleValidationErors,async(req,res)=>{
    try{
        const newPassword = req.body.password
        const phone = req.body.phone
        const userName = req.body.userName
        const id = req.params.id
        const student = await User.findById(id)
        if(!student) return res.json({success:false,message:"there is no student with that id"})
        if(!(student.role === "student") && !(req.auth.role ==="superAdmin"))return res.json({success:false,message: "authorization failed you can only change student password"})
                
        if(newPassword) student.password = newPassword
        if(req.body.studyYear) {student.studyYear = req.body.studyYear}
        if(phone)student.phone = phone
        if(userName) student.userName = userName
        await student.save()
        return res.status(201).json({success:true,message:"student Changed Sucessfully"})
}
    catch(err){
        return res.status(500).json({success:false,message:err.message})
    }


    })
router.post("/edit-role/:id",superAdmin,changeRole,handleValidationErors,async(req,res)=>{
    try{
        const id = req.params.id
        const role = req.body.role
        if(!role)return res.json({success:false,message:"there is no role added"})
        const user = await User.findById(id)
        if(!user) return res.json({success:false,message:"there is no user with that id"})
        user.role = role
        await user.save()
        return res.json({success:true,message:"role has been updated"})
        }

    catch(err){
        return res.status(500).json({success:false,message:err.message})
    }
})

module.exports = router
