const express = require("express")
const {User} = require("../models/user.model")
const router = express.Router()
const generatetoken = require("../helpers/jwt")
const {handleValidationErors,registerValidation,loginValidation,userUpdateValidations} = require("../validators/user.validator")


router.post("/register",registerValidation,handleValidationErors,async (req,res) =>{
    const email = req.body.email
    const emailExistance = await User.findOne({email})
    if(emailExistance) return res.status(400).send({message:"email alread existed please chose another email"})
        try{
    const user = await User.create(
        {userName:req.body.userName,
            email: req.body.email,
            password: req.body.password ,
            studyYear:req.body.studyYear
        }
    )
    const token = generatetoken(user)
    return res.status(201).json({success:true,
        message:"user created sucessfully",
        data: user.toJSON(),
        token:token
    })
    }
    catch(e){
        return res.status(400).json({message:e.message})
    }
})

router.get("/", async(req,res) => {
    try{
    userList = await User.find()
        if(!userList|| userList.length===0) return res.json({message:`There Is no Users at the moment `})
        return res.status(200).json(userList)

}
    catch(e){
        return res.status(400).json({message:e.message})
    }
})

router.post("/login",loginValidation,handleValidationErors,async (req,res)=>{
    const {email} = req.body
    try{
    const UserData = await User.findOne({email})
    if (!UserData) return res.status(400).json({message:"user is not existed"})
    const isPasswordCorrect = await UserData.comparePassword(req.body.password)
    if(!isPasswordCorrect) return res.json({sucess:false,
        message: "password is not valid password"
    })
    if(isPasswordCorrect){
        const token = generatetoken(UserData)
        return res.status(200).json({message:"logged in succesfully",
            Data: {user: UserData.toJSON()},
            token: token
    })}
    }
    catch(err){
        res.status(400).json({message:err.message})
    }
})

router.get("/profile", async (req,res) => {
    try{
    const user = await User.findById(req.auth.id)
    if(!user) return res.status(400).json({message:"invalid User"})
        return res.status(200).send(user)
    return res.json({success:true , data:user})
}

catch(err){
    return res.status(400).json({message:err.msg})
}
})
router.put("/profile", userUpdateValidations,handleValidationErors,async (req,res) => {
    try{
    const {email,password,role,userName} = req.body
    const updateData = {};
    if(email){
        const emailExist = await User.findOne({email,_id:{$ne:req.auth.id}})
        if(emailExist) return res.json({success:false,message:"this email is already exist"})    
        updateData.email = email
        }
    if(userName) updateData.userName = userName
    if(password) updateData.password = password
    updateData.role = role
    
    const user = await User.findById(req.auth.id)
    Object.keys(updateData).forEach((key)=>{
        if(!user) return res.status(400).json({message:"invalid User"})
        user[key] = updateData[key];
    })
    await user.save()
    res.json(user)

}

catch(err){
    return res.status(400).json({message:err.msg})
}
})
module.exports = router