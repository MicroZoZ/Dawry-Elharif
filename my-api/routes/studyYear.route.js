const express = require("express")
const {studyYear} = require("../models/studyYear.model")
const router = express.Router()
const {admin} = require("../middlewares/roleAuth") 

router.post("/",admin,async (req,res)=>{
    try{
    const newYear = await studyYear.create({
        name : req.body.name})
        return res.status(201).send(newYear)
    }
    catch(e){
        return res.status(400).send( {message : e.message})
    }
})

router.get("/",async(req,res)=>{
    try{
        studyYearList = await studyYear.find()
        if(!studyYearList || studyYearList.length === 0){
            return res.json({message:`categories lists is empty `})
        }
        return res.send(studyYearList)
    }
    catch(e){
        return res.status(404).json({message:e.message})
    }
     
})
router.get("/:id",async(req,res)=>{
    const id = req.params.id
    try{
        studyYearObject = await studyYear.findById(id)
        if(!studyYearObject){
            return res.json({message:`cant find studyYear with an id ${id}`})
        }
        return res.send(studyYearObject)
    }
    catch(e){
        return res.status(404).json({message:e.message})
    }
     
})

router.delete("/:id",async(req,res)=>{
    const id = req.params.id
    try{
        studyYearObject = await studyYear.findByIdAndDelete(id)
        if(!studyYearObject){
            return res.json({message:`cant find studyYear with an id ${id}`})
        }
        return res.json({message:"studyYear deleted successfully"})
    }
    catch(e){
        return res.status(404).json({message:e.message})
    }
     
})

router.put("/:id" , async (req,res)=>{
    const id = req.params.id
    try{
        studyYearObject = await studyYear.findByIdAndUpdate(id , {
            name:req.body.name,
        },{new:true})
        if(studyYearObject){
            return res.json({message:`cant find any studyYear with an id ${id}`})
        }
        return res.send(studyYearObject)
    }
    catch(e){
        return res.status(404).json({message:e.message})
    }
})



module.exports = router