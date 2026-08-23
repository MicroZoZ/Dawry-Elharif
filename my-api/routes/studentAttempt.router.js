const express = require('express')
const router = express.Router()
const StudentAttempt = require("../models/studentAttempt.model")
const quiz = require("../models/quiz.model")
const Question = require("../models/question.model")
const {User} = require("../models/user.model")

router.post("/:quizId", async(req,res)=>{
    try{
    const studentId = req.auth.id
    const student = await User.findById(studentId)
    if(!student) return res.json({success:false, message: "there is no student with that ID"})
    const {quizId} = req.params
    const Quiz = await quiz.findById(quizId)
    if(!Quiz) return res.status(400).json({success:false,message:"there is no quiz with that ID"})
    let attempt = await StudentAttempt.findOne({student:studentId,quiz:quizId})
    if (!(Quiz.state === "in-progress")){
        if(attempt&&!(attempt.completed)){
                attempt.completed = true
                attempt.expiresAt = expiresAt.getTime()
                student.score += attempt.score
                student.examAttempted += 1
                await attempt.save()
                await student.save()
                return res.json({success:false,message:"this exam time has been expired",
                    score:attempt.score,
                })}
        return res.status(400).json({success:false,message:"this quiz cant be solved right now"})}
    if(attempt){
        if(attempt.completed)return res.status(400).json({success:false,message:"you have already attempted that quiz",currentQuestionIndex:attempt.currentQuestionIndex,attempt:attempt})
        else{
            const startedAt = new Date(attempt.startedAt)
            const totalTimeByMinutes = Quiz.totalTimeByMinutes
            const expiresAt = new Date(startedAt.getTime()+(totalTimeByMinutes*60*1000))
            const isExpired = Date.now() > expiresAt.getTime()
            if(isExpired){
                attempt.completed = true
                attempt.expiresAt = expiresAt.getTime()
                student.score += attempt.score
                student.examAttempted += 1
                await attempt.save()
                await student.save()
                return res.json({success:false,message:"your exam time has been expired",
                    score:attempt.score,
                })}
        }    
    }
    else{
        attempt = await StudentAttempt.create({
            student:studentId,
            quiz:quizId,
            status:"in-progress",
            currentQuestionIndex:0})
        }
    const questions = await Question.find({ quizId }).select("-correctAnswer").sort({ createdAt: 1 });
    const startedAt = new Date(attempt.startedAt)
    const totalTimeByMinutes = Quiz.totalTimeByMinutes
    const expiresAt = new Date(startedAt.getTime()+(totalTimeByMinutes*60*1000))
    const remainingTime = expiresAt.getTime() - Date.now() 
        if(attempt.currentQuestionIndex >= questions.length) {
                attempt.completed = true
                attempt.expiresAt = expiresAt.getTime()
                await attempt.save()
                student.score += attempt.score
                student.examAttempted += 1
                await student.save()
                return res.json({success:false,message:"your exam time has been Finished",score:attempt.score})}
    const CurrentQuestion = questions[attempt.currentQuestionIndex]
    console.log(CurrentQuestion,attempt.currentQuestionIndex,questions.length)
    return res.json({data:CurrentQuestion,
        remainingTime:remainingTime,
        currentQuestionIndex : attempt.currentQuestionIndex,
        questionsLength:questions.length
            })            
        }
catch(err){
    return res.json(err.message)
}})

router.post("/:quizId/answer",async(req,res)=>{
    try{
    const studentId = req.auth.id
    const student = await User.findById(studentId)
    if(!student) return res.json({success:false, message: "there is no student with that ID"})
    const {quizId} = req.params
    const {questionId,selectedAnswer} = req.body
    if(!questionId || !selectedAnswer) return res.status(400).json({success:false,message:"questionId and answer are required"})
    const Quiz = await quiz.findById(quizId)
    if(!Quiz) return res.status(400).json({success:false,message:"there is no quiz with that ID"})
    const attempt = await StudentAttempt.findOne({ student: studentId, quiz: quizId });
        if (!attempt) return res.status(404).json({ success: false, message: "no attempt found, start the quiz first" });
    if (attempt.completed) {
        return res.status(400).json({ success: false, message: "this quiz is already completed",score:attempt.score });
    }
    if (!(Quiz.state === "in-progress")){
        if(attempt&&!(attempt.completed)){
                attempt.completed = true
                attempt.expiresAt = expiresAt.getTime()
                student.score += attempt.score
                student.examAttempted += 1
                await attempt.save()
                await student.save()
                return res.json({success:false,message:"this exam time has been expired",
                    score:attempt.score,
                })}
        return res.status(400).json({success:false,message:"this quiz cant be solved right now"})}   
   

    const startedAt = new Date(attempt.startedAt)
    const totalTimeByMinutes = Quiz.totalTimeByMinutes
    const expiresAt = new Date(startedAt.getTime()+(totalTimeByMinutes*60*1000))
    const isExpired = Date.now() > expiresAt.getTime()
    if(isExpired){
        attempt.completed = true
        attempt.expiresAt = expiresAt.getTime()
        await attempt.save()
        student.score += attempt.score
        student.examAttempted += 1
        await student.save()
        return res.json({success:false,message:"your exam time has been expired",score:attempt.score})}
    const questions = await Question.find({ quizId }).sort({ createdAt: 1 });
    if(attempt.currentQuestionIndex >= questions.length) {
        attempt.completed = true
        attempt.expiresAt = expiresAt.getTime()
        await attempt.save()
        student.score += attempt.score
        student.examAttempted += 1
        await student.save()
        return res.json({success:false,message:"your exam has been Finished",score:attempt.score})
    }
    const CurrentQuestion = questions[attempt.currentQuestionIndex]
    console.log(CurrentQuestion)
    if((String(CurrentQuestion._id)!==String(questionId))) return res.status(400).json({success:false,message:"you are not on that question anymore"})
    const isCorrect = CurrentQuestion.correctAnswer === selectedAnswer;
            attempt.answers.push({
            questionId: CurrentQuestion._id,
            selectedAnswer,
            isCorrect,
            AnsweredAt: new Date()
        });
        attempt.currentQuestionIndex += 1;
    await attempt.save()
    return res.json({success:true,message:"your answer has been submited successfully"})
    }
    catch(err){
        return res.json(err.message)
    }
})

module.exports = router