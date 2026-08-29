const express = require('express')
const router = express.Router()
const {User} = require("../models/user.model")
const {studyYear} = require("../models/studyYear.model")
const quiz = require("../models/quiz.model")
const StudentAttempt = require("../models/studentAttempt.model")



router.get("/",async(req,res)=>{
    const students = await User.find({role: "student"}).sort({score: -1})
    if(!students || students.length===0) return res.json({message:"there is no student curently"})
    return res.json({success:true,data:students})        
})

router.get("/currentQuiz",async(req,res)=>{
    try{
    const studYearID = req.auth.studyYear
    const StudyYear = await studyYear.findOne({_id: studYearID,name: { $ne: "none" }})
    if (!StudyYear) return res.json({success:false,message:"you are not allowed to join exams"})
    const Quiz = await quiz.findOne({state: 'in-progress', studyYear: StudyYear._id})
    if(!Quiz) return res.json({success:false,message:"there is no quiz available right now"})
    return res.json({success:true,Quiz:Quiz})}
catch(err){
    return res.status(400).json({success:false,message:err.message})
}
})

router.get("/finishedQuizes",async(req,res)=>{
    try{
        const userId = req.auth.id
        const attemptedQuizLists = await StudentAttempt.find({student:userId}).select("-answers").populate("quiz")
        if(!attemptedQuizLists || (attemptedQuizLists.length===0)) return res.status(400).json({success:false,message:"there is no quiz attempted to that user yet"})
        return res.json({success:true,data:attemptedQuizLists})
    }
    catch(err){
     return res.status(400).json({success:false,message:err.message})
    }})
router.get("/finishedQuizes/:id",async(req,res)=>{
    try{
        const attemptId = req.params.id
        if(!attemptId) return res.json({success:false,message:"invalid attempt Id"})
        
        const attemptedQuiz = await StudentAttempt.findById(attemptId).populate("answers.questionId").populate("quiz")
        if(!attemptedQuiz) return res.json({success:false,message:"invalid attempt Id"})
        const userId = req.auth.id
        //const User
        //if(!((attemptedQuiz.student) === userId)) return res.json({success:false,message:"you are not allowed to see this attempt"})
        return res.json({success:true,data:attemptedQuiz})
    }
    catch(err){
     return res.status(400).json({success:false,message:err.message})
    }})
router.get("/honor-board",async(req,res)=>{
        try{
        const students = await User.find({role: "student"}).sort({score: -1})
        if(!students) return res.status(400).json({message:"invalid students"})
            return res.status(200).send(students)
    }
    
    catch(err){
        return res.status(400).json({message:err.msg})
    }
})
module.exports = router