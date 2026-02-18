import { Request, Response } from "express"
import bcrypt from "bcrypt"

import User from "../../models/userModel"
import { LogisticDetails,  } from "../../models/detailsModel"


interface Iregister {
    name:string,
    email:string,
    password:string
}

interface Iupdate {
    name?: string;
    companyName?: string;
    gstin?: string;
    address?: string;
}

export async function UpdateUser(req:Request, res:Response){
    try{
        const userId = req.params.id
        const data: Iupdate = req.body
        
        const userExists = await User.findById(userId)
        if(!userExists){
            console.log("User Not Found!") 
            return res.status(404).json({
                message:"User Not Found!"
            })
        }   
        if(userExists.role !== "logistic"){
            console.log("This endpoint is only for users with role 'logistic'.")
            return res.status(403).json({
                message:"This endpoint is only for users with role 'logistic'."
            })
        }

        const user = await LogisticDetails.findOneAndUpdate(
            { userId: userId },
            {$set: data},
            {new:true, runValidators:true, upsert:true}
        )

        console.log("User Details Updated Successfully!",user)
        return res.status(200).json({
            message:"User Details Updated Successfully!",
            user:user
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            message:"Internal Server Error!",
            error
        })
    }
}


export async function LogisticRegister(req: Request, res: Response){
    try{
        const {name, email, password}: Iregister = req.body
        if(!name || !email || !password){
            console.log("All fields are Required!")
            return res.status(400).json({ message: "All fields are required!" });
        }

        const user = await User.findOne({email:email})
        if(user){
            console.log("Error:User already exists!")
            return res.status(409).json({message:"User already exists with this email!"})
        }

        const saltRound = 10
        const pwdhash = await bcrypt.hash(password, saltRound)
        const newUser = new User({
            name,
            email,
            pwdhash,
            role: "logistic"
        })
        await newUser.save()
        const response = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt
        }
        console.log("User Registered Successfully!")
        return res.status(201).json({
            message:"User Registered Successfully!",
            response
        })
   
    }catch(error){
        console.log("Error:Internal Server Error!", error)
        return res.status(500).json({
            message:"Internal Server Error!",
            error
        })
    }
}


