const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    email:{
        type:String ,
        required: true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    role:{
        type:String,
        enum:["admin","student","superAdmin"]
        ,default:"student"
    },
    userName:{
        type:String,
        required:true,
        trim:true,
    },    score:{
        type:Number,
        default:0,
    },
    examAttempted:{
        type:Number,
        default:0,
    },
    studyYear:{type:mongoose.Schema.Types.ObjectId,ref:'studyYear',required:true},

})
userSchema.pre("save" , async function(){
    if(this.isModified("password")) {
    try{
            const salt = await bcrypt.genSalt(10)
            this.password = await bcrypt.hash(this.password , salt)           
        }
        catch(err){
            return err.message
        }}
})

userSchema.methods.comparePassword = async function (candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password)
}
userSchema.methods.toJSON = function(){
    const user = this.toObject({virtuals:true})
    delete user.password
    return user
}

exports.User = mongoose.model("user",userSchema)

