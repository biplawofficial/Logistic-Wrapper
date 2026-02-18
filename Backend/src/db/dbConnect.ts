import mongoose from 'mongoose'
import { config } from "../utils/envConfig"
 
export async function dbConnect(){
    mongoose.connect(config.MONGO_URI || '').then(() =>{
        console.log("Connected to MongoDB")
    }).catch((err) => {
        console.error("Error connecting to MongoDB:", err)
    })
}