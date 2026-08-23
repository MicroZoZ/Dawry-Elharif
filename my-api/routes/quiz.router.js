const express = require('express')
const router = express.Router()
const {admin,superAdmin} = require("../middlewares/roleAuth") 
const quiz = require("../models/quiz.model")
const {studyYear} = require("../models/studyYear.model")
const Question = require("../models/question.model")

router.get("/" ,admin, async(req,res)=>{
    try{
        const quizLists = await quiz.find({ state: 'draft' }).populate('studyYear');
        const grouped = quizLists.reduce((acc, quiz) => {
            const key = quiz.studyYear._id.toString();
            if (!acc[key]) acc[key] = { studyYear: quiz.studyYear, quizzes: [] };
            acc[key].quizzes.push(quiz);
            return acc;
        }, {});

        return res.status(200).json({success:true,data:grouped})
    }
    catch(err){
        return res.status(400).json({success:false,message:err.message})
    }
})
router.get("/curently" ,admin, async(req,res)=>{
    try{
        const quizLists = await quiz.find({ state: 'in-progress' }).populate('studyYear');
        const grouped = quizLists.reduce((acc, quiz) => {
            const key = quiz.studyYear._id.toString();
            if (!acc[key]) acc[key] = { studyYear: quiz.studyYear, quizzes: [] };
            acc[key].quizzes.push(quiz);
            return acc;
        }, {});

        return res.status(200).json({success:true,data:grouped})
    }
    catch(err){
        return res.status(400).json({success:false,message:err.message})
    }
})
router.get("/expired" ,admin, async(req,res)=>{
    try{
        const quizLists = await quiz.find({ state: 'expired' }).populate('studyYear');
        const grouped = quizLists.reduce((acc, quiz) => {
            const key = quiz.studyYear._id.toString();
            if (!acc[key]) acc[key] = { studyYear: quiz.studyYear, quizzes: [] };
            acc[key].quizzes.push(quiz);
            return acc;
        }, {});

        return res.status(200).json({success:true,data:grouped})
    }
    catch(err){
        return res.status(400).json({success:false,message:err.message})
    }
})
router.get("/quiz/:id",async(req,res)=>{
    try{
    const quizId = req.params.id
    const Quiz = await quiz.findById(quizId)
    if(!Quiz) return res.status(400).json("there is no quiz with that ID")
    const questionLists = await Question.find({quizId})
    if(!questionLists || questionLists.length === 0 ){
        return res.json({message:"this quiz has no questions yet",quiz:Quiz,data:questionLists})
    }
    return res.json({success:true,quiz:Quiz,data:questionLists})}
    catch(err){
        return res.status(400).json({success:false,message:err.message})
    }
})
router.post("/:yearId" ,admin, async(req,res)=>{
    try{
        const {name,totalTimeByMinutes} = req.body
        const studyYearId = req.params.yearId
        if(!name || !totalTimeByMinutes || !studyYearId) return res.status(400).json({success:false,message:"all fields are required"})
        const StudyYear = await studyYear.findById(studyYearId)
    console.log(totalTimeByMinutes)
    if(!StudyYear) return res.status(400).json({success:false, messgae:"there is no study year with that ID"})
        const newquiz = await quiz.create({
        name: name,
        totalTimeByMinutes: totalTimeByMinutes,
        studyYear: studyYearId
    })
            

    return res.status(201).json({success:true,message:"quiz created successfully",data:newquiz})
}
    catch(err){
        return res.status(400).json({success:false,message:err.message})
    }
})

router.post("/quiz/:id",admin,async (req,res)=>{
    try{
        const quizId = req.params.id
            if(!quizId) return res.status(400).json({success:false,message:"quizID is missing"})
        
        const questionText = req.body.questionText
            if(!questionText||questionText.length===0) return res.status(400).json({success:false,message:"Question is missing"})
        const correctAnswer = req.body.correctAnswer
            if(!correctAnswer) return res.status(400).json({success:false,message:"correctAnswer is missing"})
        const options = req.body.options
            if(!options||options.length!=4) return res.status(400).json({success:false,message:"options must be 3 wrong 1 right"})
        if(!options.includes(correctAnswer)) return res.status(400).json({sucess:false,message:"correct answer has to be one of the options"})
        const Quiz = await quiz.findById(quizId)
            if(!Quiz) return res.json({success:false,message:"there is no quiz with that id"})
        if(!(Quiz.state==="draft")) return  res.json({success:false,message:"this quiz cant be edited"})
        const question = await Question.create({
            quizId: quizId,
            questionText : questionText,
            correctAnswer : correctAnswer,
            options: options,
        })
        return res.status(201).json({success:true,message:"question created successfully",data:question})
            }
        catch(err){
            return res.status(400).json({message:err.message})
        }    

    })
router.put("/publish/:id",superAdmin,async(req,res)=>{
        try{
        const quizId = req.params.id
            if(!quizId) return res.status(400).json({success:false,message:"quizID is missing"})
        const Quiz = await quiz.findById(quizId)
        if(!Quiz) return res.json({success:false,message:"there is no quizz with that id"})
        if(!(Quiz.state === "draft"))return res.json({success:false,message:`this exam is ${Quiz.state}` })
        const questionLists = await Question.find({quizId})
        if(!questionLists || questionLists.length <= 1 ){
            return res.json({success:false,message:`quiz has to have +3 questions` })
    }
        const inProgressQuiz = await quiz.findOne({ state: 'in-progress', studyYear:Quiz.studyYear });
        if(inProgressQuiz) return res.status(400).json({success:false,message:`quiz ${inProgressQuiz.name}: with an ID : ${inProgressQuiz._id} is already in progress please finish it first`})
        Quiz.state = "in-progress"
        await Quiz.save()
        return res.status(201).json({success:true,message:"quiz published successfully",data:Quiz})
            }
        catch(err){
            return res.status(400).json(err.message)
        }
})

router.put("/end-quiz/:id",superAdmin,async(req,res)=>{
        try{
        const quizId = req.params.id
            if(!quizId) return res.status(400).json({success:false,message:"quizID is missing"})
        const Quiz = await quiz.findById(quizId)
        if(!(Quiz.state === "in-progress"))return res.json({success:false,message:`this exam is ${Quiz.state}` })
        Quiz.state = "expired"
        await Quiz.save()
            return res.status(201).json({success:true,message:"quiz finshed successfully",data:Quiz})
        } catch(err){
            return res.status(400).json(err.message)
        }})

    module.exports = router