import { Request, Response } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { Shipment } from "../../models/shipmentModel";
import { config } from "../../utils/envConfig";

function generateQrPayload(
    shipmentId: string,
    qrToken: string
): string{
    return `sid=${shipmentId}&token=${qrToken}`;
}

async function createQrBuffer(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 5,
  });
}

export async function BookShipments(req: Request, res: Response) {
    try{
        const user = req.user;
        const {
            pickupLocation: {
                longitude: pickupLongitude,
                latitude: pickupLatitude,
                email: pickupEmail,
                address: address,
                contactNumber: contactNumber
            },
            deliveryLocation: {
                longitude: deliveryLongitude,
                latitude: deliveryLatitude,
                email: deliveryEmail,
                address: deliveryAddress,
                contactNumber: deliveryContactNumber
            },
            size: {
                length,
                width,
                height
            },
            quantity,
            weight,
            netWeight,
            price
        } = req.body;

        if (
            pickupLongitude == null ||
            pickupLatitude == null ||
            !pickupEmail ||
            !address ||
            !contactNumber ||
            deliveryLongitude == null ||
            deliveryLatitude == null ||
            !deliveryEmail ||
            !deliveryAddress ||
            !deliveryContactNumber ||
            length == null ||
            width == null ||
            height == null ||
            quantity == null ||
            weight == null ||
            netWeight == null ||
            price == null
            ) {
            console.log("All fields are required!");
            return res.status(400).json({ message: "All fields are required!" });
        }

        // 1. Setup transporter and verify connection BEFORE any DB writes
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure:false,
            auth: {
                user: config.EMAIL_ID,
                pass: config.GMAIL_API
            }
        });

        try {
            await transporter.verify();
            console.log("Email connection verified.");
        } catch (emailError) {
            console.error("Email configuration error:", emailError);
            return res.status(500).json({
                message: "Email service unavailable. Cannot book shipment.",
                error: emailError instanceof Error ? emailError.message : "Unknown email error"
            });
        }

        // 2. Generate tokens and save shipment
        const pickupQrToken = `PCK-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
        const deliveryQrToken = `DEL-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
        const shipmentId = `FFR-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

        const newShipment = new Shipment({
            shipmentId,
            pickupQrToken,
            deliveryQrToken,
            userId: user?._id,
            pickupDetails: {
                longitude: pickupLongitude,
                latitude: pickupLatitude,
                email: pickupEmail,
                address: address,
                contactNumber: contactNumber
            },
            deliveryDetails: {
                longitude: deliveryLongitude,
                latitude: deliveryLatitude,
                email: deliveryEmail,
                address: deliveryAddress,
                contactNumber: deliveryContactNumber
            },
            size: {
                length,
                width,
                height
            },
            quantity,
            weight,
            netWeight,
            price,
            status: "pending"
        })
        await newShipment.save();

        // 3. Generate QR codes
        const qrPayloadpck = generateQrPayload(shipmentId, pickupQrToken);
        const qrbufferpck = await createQrBuffer(qrPayloadpck);
        const qrPayloaddel = generateQrPayload(shipmentId, deliveryQrToken);
        const qrbufferdel = await createQrBuffer(qrPayloaddel);

        const htmlpck = `
            <div style="font-family: sans-serif; text-align: center;">
                <h2>Shipment Pickup QR Code</h2>
                <p>Scan this QR code at the pickup point for shipment <strong>${shipmentId}</strong>.</p>
                <img src="cid:pickupqr@fastfare" alt="Pickup QR" style="max-width: 220px; border: 1px solid #ccc; padding: 4px;" />
            </div>
            `;

        const htmldel = `
            <div style="font-family: sans-serif; text-align: center;">
                <h2>Shipment Delivery QR Code</h2>
                <p>Scan this QR code at the delivery point for shipment <strong>${shipmentId}</strong>.</p>
                <img src="cid:deliveryqr@fastfare" alt="Delivery QR" style="max-width: 220px; border: 1px solid #ccc; padding: 4px;" />
            </div>
            `;

        const mailOptionsPCK = {
            from: config.EMAIL_ID,
            to: pickupEmail,
            subject: "Shipment Booking Confirmation - FastFare (Pickup QR)",
            html: htmlpck,
            attachments: [
                {
                    filename: "pickup-qr.png",
                    content: qrbufferpck,
                    cid: "pickupqr@fastfare",
                },
            ],
        };

        const mailOptionsDEL = {
            from: config.EMAIL_ID,
            to: deliveryEmail,
            subject: "Shipment Booking Confirmation - FastFare (Delivery QR)",
            html: htmldel,
            attachments: [
                {
                    filename: "delivery-qr.png",
                    content: qrbufferdel,
                    cid: "deliveryqr@fastfare",
                },
            ],
        };

        // 4. Send emails with fallback
        try {
            await transporter.sendMail(mailOptionsPCK);
            await transporter.sendMail(mailOptionsDEL);
            console.log(`Email sent to ${pickupEmail} and ${deliveryEmail} successfully!`);

            console.log("Shipment booked successfully!");
            return res.status(201).json({
                message: "Shipment booked successfully!",
                shipment: newShipment
            });
        } catch (sendError) {
            console.error("Shipment created but email failed:", sendError);
            return res.status(201).json({
                message: "Shipment booked, but failed to send QR emails.",
                warning: "Email delivery failed. QR tokens are stored in the shipment record.",
                shipment: newShipment
            });
        }

    }catch(error){
        console.log("Error:Internal Server Error!", error)
        return res.status(500).json({
            message:"Internal Server Error!",
            error
        })
    }
}


export async function GetShipments(req: Request, res: Response) {
    try{
        const user = req.user;
        const {shipmentId} = req.params;
        if (!shipmentId) {
            console.log("Shipment ID is required!");
            return res.status(400).json({ message: "Shipment ID is required!" });
        }
        const shipment = await Shipment.findOne({shipmentId, userId: user?._id});
        if(!shipment){
            console.log("Shipment not found!");
            return res.status(404).json({ message: "Shipment not found!" });
        }
        
        return res.status(200).json({
            message: "Shipment fetched!",
            shipment: shipment 
        });
        
    }catch(error){
        console.log("Error:Internal Server Error!", error)
        return res.status(500).json({
            message:"Internal Server Error!",
            error
        })
    }
}