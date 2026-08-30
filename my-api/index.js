const express = require("express")
const mongoose = require('mongoose');
require("dotenv").config()
const app = express()
const api = process.env.API
const port = process.env.PORT
const connectiostring = process.env.CONNECTIONSTRING
const cors = require('cors')
const studyYearRouter = require("./routes/studyYear.route")
const userRouter = require("./routes/user.router")
const adminRouter = require("./routes/admin.router")
const quizRouter = require("./routes/quiz.router")
const questionRouter = require("./routes/question.router")
const studentAttempt = require("./routes/studentAttempt.router")
const student = require("./routes/student.route")

const {admin} = require("./middlewares/roleAuth") 

const morgan = require('morgan')
const authMiddleWare = require("./middlewares/auth.middleware")

app.use(cors({
    origin: '*',
    methods:["GET" , "POST" , "PUT" , "DELETE"],
    credentials: true,
    allowedHeaders:["Content-Type" , "Authorization" , "Accept-Language"]
}))
app.use(authMiddleWare)
app.use(morgan("tiny"))
app.use(express.json())

app.use(`${api}/studyYear`,admin,studyYearRouter)
app.use(`${api}/admin`,adminRouter)
app.use(`${api}/auth`,userRouter)
app.use(`${api}/quizes`,quizRouter)
app.use(`${api}/question`,questionRouter)
app.use(`${api}/QuizAttempt`,studentAttempt)
app.use(`${api}/student`,student)



app.get(`${api}/home` , (req,res)=>{
    res.send("hello world")
})
app.listen(port,() =>{
    console.log(`listening on https://localhost:${port}`)
})
mongoose.connect(connectiostring)
.then(()=>{console.log("Connected to mongodb sucessfully")})
.catch((e)=>(console.log(e)))


module.exports = app;