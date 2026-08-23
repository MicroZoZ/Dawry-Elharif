const mongoose = require("mongoose")
const questionSchema = mongoose.Schema({
    quizId:{type:mongoose.Schema.Types.ObjectId,ref:"Quiz",required:true},
    questionText:{type:String,required:true},
    correctAnswer:{type:String,required:true},
    options:{type:[String]}
})

module.exports = mongoose.model('Question',questionSchema)