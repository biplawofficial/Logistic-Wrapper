import { Request, Response } from "express";
import bcrypt from "bcrypt"
import { sign, verify } from "jsonwebtoken";

import { config } from "../utils/envConfig"
import User from "../models/userModel";
import { UserDetails, AdminDetails, LogisticDetails } from "../models/detailsModel";

const JWT_SECRET = config.JWT_SECRET;

interface Ilogin {
    email:string,
    password:string
}
export async function Login(req:Request, res:Response){
    try{
        const {email, password}: Ilogin = req.body
        if(!email || !password){
            console.log("All fields are Required!")
            return res.status(400).json({message:"All fields are Required!"})
        }

        const user = await User.findOne({email:email})
        if(!user){
            console.log("Error:User does not exist!")
            return res.status(401).json({message:"Invalid Email or Password!"})
        }
        
        const passwordMatch = await bcrypt.compare(password, user.pwdhash)
        if(!passwordMatch){const JWT_SECRET = config.JWT_SECRET;
            console.log("Invalid Credentials!")
            return res.status(401).json({message:"Invalid Email or Password!"})
        }

        const token = sign({id:user._id, email:user.email, role:user.role},JWT_SECRET,{expiresIn: "1h"})
        console.log("User Logged In Successfully!")
        return res.status(200).json({
            message:"User Logged In Successfully!",
             token 
        });
    }catch(error){
        console.log("Error:Internal Server Error!", error)
        return res.status(500).json({
            message:"Internal Server Error!",
            error
        })
    }
}

export async function fetchUserDetail(req: Request, res: Response){
    try{
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        const data = req.user as any;

        const Role = data.role;
        console.log("Fetching details for user:", data.id, "with role:", Role);
        const user = await User.findById(data.id).select("-pwdhash -__v")
        if(!user){
            console.log("User Not Found!") 
            return res.status(404).json({
                message:"User Not Found!"
            })
        }
        
        var details: any = null;
        if(Role == "admin"){
            details = await AdminDetails.findOne({userId: user._id}).select("-__v -userId");
        }else if(Role == "logistic"){
            details = await LogisticDetails.findOne({userId: user._id}).select("-__v -userId");
        }else if (Role == "user"){
            details = await UserDetails.findOne({userId: user._id}).select("-__v -userId");
        }else{
            console.log("Invalid User Role!")
            return res.status(400).json({
                message:"Invalid User Role!"
            })
        }

        console.log("User Details Fetched Successfully!")
        return res.status(200).json({
            message:"User Details Fetched Successfully!",
            user:user,
            details:details
        })
    }catch(error){
        console.log("Error:Internal Server Error!", error)
        return res.status(500).json({
            message:"Internal Server Error!"
        })
    }
}
        
