const mongoose = require("mongoose")
const studyYear = mongoose.Schema({
    name:{
    type : String,
    required: true,
    
}
})

exports.studyYear = mongoose.model("studyYear" , studyYear)