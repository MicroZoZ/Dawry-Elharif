const mongoose = require("mongoose")
const answerRecordSchema = mongoose.Schema({
    questionId:{type:mongoose.Schema.Types.ObjectId,ref:"Question",required:true},
    selectedAnswer:{type:String,default:null},
    isCorrect:{type:Boolean,default:null},
    isTimedOut:{type:Boolean,default:null},
    AnsweredAt:{type:Date,required:true},
},{_id:false})
const StudentAttemptSchema = mongoose.Schema({
    student: {type: mongoose.Schema.Types.ObjectId, ref:"user",required:true},
    quiz:{type: mongoose.Schema.Types.ObjectId, ref:"Quiz",required:true},
    completed:{type: Boolean , default:false},
    currentQuestionIndex:{type:Number,default:0},
    //currentQuestionStartedAt:{type:Date,required:true}, 
    answers:{type:[answerRecordSchema]},
    score:{type:Number,default:0},
    startedAt:{type:Date, default:Date.now},
    completedAt:{type:Date,default:null},
})
StudentAttemptSchema.index({ student: 1, quiz: 1 }, { unique: true });

StudentAttemptSchema.pre("save",async function(){
    const correctCount = this.answers.filter(a => a.isCorrect).length;
    this.score = correctCount
})
module.exports = mongoose.model("StudentAttempt",StudentAttemptSchema)