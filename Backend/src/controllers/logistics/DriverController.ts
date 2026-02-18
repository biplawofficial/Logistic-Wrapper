
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcrypt";

import User from "../../models/userModel";
import { DriverDetails } from "../../models/detailsModel";
import { LogisticDetails } from "../../models/detailsModel";
import { config } from "../../utils/envConfig";

export async function addDriver(req: Request, res: Response) {
    try {
        const {
            logisticClientId,
            name,
            email,
            contactNumber,
            licenseNumber,
            vehicleNumber,
            chasisNo
        } = req.body;

        if (!logisticClientId ||
            !name ||
            !email ||
            !contactNumber ||
            !licenseNumber ||
            !vehicleNumber ||
            !chasisNo) {
            console.log("All fields are required!");
            return res.status(400).json({ message: "All fields are required!" });
        }

        const client = await LogisticDetails.findOne({ userId: logisticClientId });
        if (!client) {
            console.log("Logistic client not found!");
            return res.status(404).json({ message: "Logistic client not found!" });
        }

        const existingDriver = await DriverDetails.findOne({
            $or: [
                { email },
                { contactNumber },
                { licenseNumber },
                { vehicleNumber },
                { chasisNo }
            ]
        });

        const existingDriverUser = await User.findOne({ email: email });
        if (existingDriver || existingDriverUser) {
            console.log("Driver with provided details already exists!");
            return res.status(409).json({ message: "Driver with provided details already exists!" });
        }

        const saltRound = 10;
        const tempPassword = crypto.randomBytes(6).toString('hex');
        const pwdhash = await bcrypt.hash(tempPassword, saltRound);

        const newUser = new User({
            name,
            email,
            pwdhash,
            role: "driver"
        });

        const id = newUser._id;
        
        await newUser.save();

        const newDriver = new DriverDetails({
            userId: id,
            logisticClientId,
            name,
            email,
            contactNumber,
            licenseNumber,
            vehicleNumber,
            chasisNo
        });

        await newDriver.save();

        // Email logic commented out for development
        // TODO: Re-enable email sending in production
        /*
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: { user: config.EMAIL_ID, pass: config.GMAIL_API }
        });
        await transporter.verify();
        await transporter.sendMail({ ... });
        */

        console.log("Driver added successfully!");
        return res.status(201).json({ 
            message: "Driver added successfully!", 
            credentials: {
                email,
                tempPassword
            },
            driver: newDriver 
        });

    } catch (error) {
        console.log("Error: Internal Server Error!", error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
}

export async function getDrivers(req: Request, res: Response) {
    try {
        const drivers = await DriverDetails.find({ logisticClientId: req.user?._id });
        console.log("Drivers fetched successfully!");
        return res.status(200).json({ message: "Drivers fetched successfully!", drivers });
    } catch (error) {
        console.log("Error: Internal Server Error!", error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
}
