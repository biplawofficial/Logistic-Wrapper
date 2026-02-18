import { NextFunction, Request, Response } from "express"

import User from "../models/userModel"

export function Authorize(Role:string[]){
    return async function(req:Request, res:Response, next:NextFunction){
        try{
            const user = req.user
            const dbuser = await User.findById(user.id);

            if (!dbuser) {
                return res.status(401).json({ message: "User not found" })
            }
            if(!Role.includes(dbuser?.role)){
                console.log("Error:Unauthorized Access!")
                return res.status(403).json({message:"Unauthorized Access!"})
            }
            next()

        }catch(error){
            console.log("Error:Unauthorized", error)
            return res.status(403).json({message:"Unauthorized!"})
        }
    }
}