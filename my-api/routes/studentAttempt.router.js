const express = require('express')
const router = express.Router()
const StudentAttempt = require("../models/studentAttempt.model")
const quiz = require("../models/quiz.model")
const Question = require("../models/question.model")
const {User} = require("../models/user.model")

const finishQuiz = async(res,attempt,student,expiresAt,quizId,message)=>{
                attempt.completed = true
                attempt.expiresAt = expiresAt.getTime()
                student.score += attempt.score
                student.examAttempted += 1
            const questions = await Question.find({ quizId }).select("-correctAnswer").sort({ createdAt: 1 });
            while((attempt.currentQuestionIndex < questions.length)) {
                    const CurrentQuestion = questions[attempt.currentQuestionIndex]
                            attempt.answers.push({
                            questionId: CurrentQuestion._id,
                            selectedAnswer : "none",
                            isCorrect : false,
                            isTimedOut:true,
                            AnsweredAt: new Date()})
                            attempt.currentQuestionIndex += 1;
                            
                            await attempt.save()
                        }
                await attempt.save()
                await student.save()
                return res.json({success:false,message:message,
                    score:attempt.score,})
}

const attemptExpireCheck = async(res,Quiz,attempt,student)=>{
                const startedAt = new Date(attempt.startedAt)
                const totalTimeByMinutes = Quiz.totalTimeByMinutes
                const quizId = Quiz._id
                const expiresAt = new Date(startedAt.getTime()+(totalTimeByMinutes*60*1000))
                const isExpired = Date.now() > expiresAt.getTime()
                if(isExpired){
                    await finishQuiz(res,attempt,student,expiresAt,quizId,"your exam time has been expired");
                    return true;
                }
                return false;
}


const QuizOrAttemptExpired = async(res,Quiz,attempt,student)=>{

    return false ;
}

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
        if(attempt&&!(attempt.completed)){return finishQuiz(res,attempt,student,new Date(startedAt.getTime()+(20*60*1000)),quizId,"your exam time has been expired")}
        else{return res.status(400).json({success:false,message:"this quiz cant be solved right now"})}}
    if(attempt){
        if(attempt.completed){return res.status(400).json({success:false,message:"your have completed this quiz before"})}
        const attemptExpireCheckhandle = await attemptExpireCheck(res,Quiz,attempt,student)
        if(attemptExpireCheckhandle) return;
    }
    else{
            attempt = await StudentAttempt.create({
            student:studentId,
            quiz:quizId,
            status:"in-progress",
            currentQuestionIndex:0})
        }
    const questions = await Question.find({ quizId }).select("-correctAnswer").sort({ createdAt: 1 });
    if(attempt.currentQuestionIndex >= questions.length) {
            const message = "your exam time has been Finished"
            return await finishQuiz(res,attempt,student,new Date(startedAt.getTime()+(20*60*1000)),quizId,message);
        }
    const startedAt = new Date(attempt.startedAt)
    const totalTimeByMinutes = Quiz.totalTimeByMinutes
    const expiresAt = new Date(startedAt.getTime()+(totalTimeByMinutes*60*1000))
    const remainingTime = expiresAt.getTime() - Date.now() 
    const CurrentQuestion = questions[attempt.currentQuestionIndex]
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
    if(attempt){
        if(attempt.completed){return res.status(400).json({success:false,message:"your have completed this quiz before"})}
        const attemptExpireCheckhandle = await attemptExpireCheck(res,Quiz,attempt,student)
        if(attemptExpireCheckhandle) return;
    }
    else{return res.status(404).json({ success: false, message: "no attempt found, start the quiz first" });}

    if (!(Quiz.state === "in-progress")){
        if(attempt&&!(attempt.completed)){return finishQuiz(res,attempt,student,new Date(startedAt.getTime()+(20*60*1000)),quizId,"your exam time has been expired")}
        else{return res.status(400).json({success:false,message:"this quiz cant be solved right now"})}}

    const questions = await Question.find({ quizId }).sort({ createdAt: 1 });
    if(attempt.currentQuestionIndex >= questions.length) {
        attempt.completed = true
        attempt.expiresAt = Date.now()
        await attempt.save()
        student.score += attempt.score
        student.examAttempted += 1
        await student.save()
        return res.json({success:false,message:"your exam has been Finished",score:attempt.score})
    }
    const CurrentQuestion = questions[attempt.currentQuestionIndex]
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