const express = require('express')
const router = express.Router()
const {admin,superAdmin} = require("../middlewares/roleAuth") 
const quiz = require("../models/quiz.model")
const Question = require("../models/question.model")

router.put("/:id",admin,async (req,res)=>{
    try{
        const quizId = req.body.quizId
            if(!quizId) return res.status(400).json({success:false,message:"quizID is missing"})
        const questionText = req.body.questionText
            if(!questionText||questionText.length===0) return res.status(400).json({success:false,message:"Question is missing"})
        const correctAnswer = req.body.correctAnswer
            if(!correctAnswer) return res.status(400).json({success:false,message:"correctAnswer is missing"})
        const options = req.body.options
            if(!options||options.length!=4) return res.status(400).json({success:false,message:"options must be 4"})
        const questionId = req.params.id
            if(!questionId) return res.status(400).json({success:false,message:"questionId is missing"})
        const Quiz = await quiz.findById(quizId)
            if(!Quiz) return res.json({success:false,message:"there is no quiz with that id"})
        if(!(Quiz.state==="draft")) return  res.json({success:false,message:"this quiz cant be edited"})
        const question = await Question.findByIdAndUpdate(questionId,{
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
router.delete("/:id",admin,async (req,res)=>{
    console.log(req.body)
    try{

    const questionId = req.params.id
        if(!questionId) return res.status(400).json({success:false,message:"questionId is missing"})
    const quizId = req.body.quizId
        if(!quizId) return res.status(400).json({success:false,message:"quizID is missing"})
        const Quiz = await quiz.findById(quizId)
            if(!Quiz) return res.json({success:false,message:"there is no quiz with that id"})
        if(!(Quiz.state==="draft")) return  res.json({success:false,message:"this quiz cant be edited"})
    const question = await Question.findByIdAndDelete(questionId)
    if(!question) return res.status(400).json({success:false,message:"there is no question with that id"})
    return res.status(201).json({success:true,message:"question deleted successfully"})}
catch(err){
    return res.status(400).json(err.message)
}
})

module.exports = router