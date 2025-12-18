
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

        const client = await LogisticDetails.findOne({userId:logisticClientId});
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

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.EMAIL_ID,
                pass: config.GMAIL_API
            }
        })

        const mailOptions = {
        from: config.EMAIL_ID,
        to: email,
        subject: "FastFare Driver Account Created",
        html: `
            <p>Your driver account has been created.</p>
            <p>Email: <strong>${email}</strong></p>
            <p>Temporary Password: <strong>${tempPassword}</strong></p>
        `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email} successfully!`);

        console.log("Driver added successfully!");
        return res.status(201).json({ message: "Driver added successfully!", driver: newDriver });
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

export async function setLocation(req: Request, res: Response) {
    try {
        const { userId, latitude, longitude } = req.body;

        if (!userId || latitude === undefined || longitude === undefined) {
            console.log("Driver ID, Latitude and Longitude are required!");
            return res.status(400).json({ message: "Driver ID, Latitude and Longitude are required!" });
        }

        const driver = await DriverDetails.findOneAndUpdate({ userId: userId },
            { latitude, longitude, updatedAt: new Date() },
            { new: true }
        );
        if (!driver) {
            console.log("Driver not found!");
            return res.status(404).json({ message: "Driver not found!" });
        }

        console.log("Driver location updated successfully!");
        return res.status(200).json({ message: "Driver location updated successfully!", driver });
    } catch (error) {
        console.log("Error: Internal Server Error!", error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
}



export async function getDriverLocation(req: Request, res: Response) {
    try {
        const drivers = await DriverDetails.find({ userId: req.user?._id },
            { Latitude: 1, Longitude: 1 }
        );
        console.log("Driver locations fetched successfully!");
        return res.status(200).json({ message: "Driver locations fetched successfully!", drivers });
    } catch (error) {
        console.log("Error: Internal Server Error!", error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
}
