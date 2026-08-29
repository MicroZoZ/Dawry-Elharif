const express = require("express")
const {User} = require("../models/user.model")
const router = express.Router()
const generatetoken = require("../helpers/jwt")
const {handleValidationErors,registerValidation,loginValidation,userUpdateValidations} = require("../validators/user.validator")


router.post("/register",registerValidation,handleValidationErors,async (req,res) =>{
    const email = req.body.email
    const emailExistance = await User.findOne({email})
    const phoneNumber = req.body.phoneNumber
    if(emailExistance) return res.status(400).send({message:"email alread existed please chose another email"})
    if(!(phoneNumber[0]==="+"&&phoneNumber[1]==="2")) return ress.status(400).json({success:false,message:"please enter valid phone number",success:false})
        try{    
        const user = await User.create(
    {userName:req.body.userName,
        phone:phoneNumber,
        email: req.body.email,
        password: req.body.password ,
        studyYear:req.body.studyYear
    }
)
    if(!user) return res.status(400).json({success:false,message:"failed to create user"})
    return res.status(201).json({
        success:true,
        message:"user created sucessfully",
        data: user.toJSON(),
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
    const id = req.auth.id
    const user = await User.findOne({_id:req.auth.id}).populate("studyYear")
    if(!user) return res.status(400).json({message:"invalid User"})
    return res.json({success:true , data:user})
}

catch(err){
    return res.status(400).json({message:err.msg})
}
})
router.put("/profile", userUpdateValidations,handleValidationErors,async (req,res) => {
    try{
    const {password,retypedPassword} = req.body
    const updateData = {};

    if(password&&(password === retypedPassword)) updateData.password = password
    else{return res.json({success:false,message:"password doesnt match please type it again"})}
    
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