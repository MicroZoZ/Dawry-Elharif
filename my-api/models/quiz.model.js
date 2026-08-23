const mongoose = require("mongoose")

const quizSchema = mongoose.Schema({
    name:{type:String,required:true},
    totalTimeByMinutes:{type:Number,required:true,min:1},
    studyYear:{type:mongoose.Schema.Types.ObjectId,ref:'studyYear',required:true},
    state:{
        type:String,
        enum:["draft","in-progress","expired"]
        ,default:"draft"
    },
})
module.exports = mongoose.model("Quiz",quizSchema)