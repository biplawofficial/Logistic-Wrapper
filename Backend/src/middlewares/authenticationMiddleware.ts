import { verify } from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"

import { config } from "../utils/envConfig"
import User from "../models/userModel"

const JWT_SECRET = config.JWT_SECRET

export async function Authenticate(req:Request, res:Response, next:NextFunction){
    const header = req.headers.authorization
    if(!header){
        console.log("Error:Authorization header missing!")
        return res.status(401).json({message:"Authorization header missing!"})
    }
    
    const token = header.split(" ")[1]
    if(!token){
        console.log("Error:Token missing!")
        return res.status(401).json({message:"Token missing!"})
    }

    try{
        const decoded = verify(token, JWT_SECRET!) as {id:string, role:string}
        const user = await User.findById(decoded.id).select("-pwdhash")
        req.user = user
        next()
    }catch(error){
        console.log("Error:Invalid Token!", error)
        return res.status(401).json({message:"Invalid Token!"})
    }
}