import { Request, Response } from "express"
import bcrypt from "bcrypt"

import User from "../../models/userModel"
import { UserDetails,  } from "../../models/detailsModel"
import { verifyGstin } from "../../services/gstinService"

interface Iregister {
    name:string,
    email:string,
    password:string
}
export async function UserRegister(req:Request,res:Response){
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
            pwdhash
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



interface Iupdate {
    name?:string,
    contactNumber?:string,
    age?:number,
    companyDetails?:{
        companyName?:string,
        address?:string,
        gstin?:string
    }
}

export async function UpdateUser(req:Request, res:Response){
    try{
        const userId = req.params.id
        const data: Iupdate = req.body
        if(data.companyDetails && data.companyDetails.gstin){
            const gstinVerificationResult = await verifyGstin(data.companyDetails.gstin)
            if(gstinVerificationResult.flag !== "true"){
                console.log("Invalid GSTIN provided.")
                return res.status(400).json({ message: "Invalid GSTIN provided." });
            }
        }

        const userExists = await User.findById(userId)
        if(!userExists){
            console.log("User Not Found!") 
            return res.status(404).json({
                message:"User Not Found!"
            })
        }   
        if(userExists.role !== "user"){
            console.log("This endpoint is only for users with role 'user'.")
            return res.status(403).json({
                message:"This endpoint is only for users wiOnly users with role 'user' can update user details.th role 'user'."
            })
        }

        const user = await UserDetails.findOneAndUpdate(
            { userId: userId },
            {$set: data},
            {new:true, runValidators:true, upsert:true}
        )

        console.log("User Details Updated Successfully!")
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
