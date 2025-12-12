import { timeStamp } from "console"
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    pwdhash:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:["user","admin","logistic","driver"],
        default:"user"
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
})

const User = mongoose.model("USER",userSchema)
export default User