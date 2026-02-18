import { Request, Response } from "express";
import { DriverDetails } from "../../models/detailsModel";
import { Shipment } from "../../models/shipmentModel";


export async function confirmShipment(req: Request, res: Response) {
    try {
        const authUser = req.user;
        const { driverId, shipmentId} = req.body;
        const logisticClientId = authUser?._id;
        console.log(logisticClientId)
        if( !driverId || !shipmentId){
            console.log("Driver ID and status are required!");
            return res.status(400).json({ message: "Driver ID and status are required!" });
        }

        const driver = await DriverDetails.findOne({ userId: driverId, logisticClientId });
        if (!driver) {
            console.log("Driver not found!");
            return res.status(404).json({ message: "Driver not found!" });
        }
        const shipment = await Shipment.findOne({ shipmentId: shipmentId });
        console.log(shipment);
        console.log(shipmentId);
        if (!shipment) {
            console.log("Shipment not found!");
            return res.status(404).json({ message: "Shipment not found!" });
        }

        shipment.status = "confirmed";
        shipment.DriverId = driver.userId;
        shipment.logisticClientId = logisticClientId;
        if(driver.status !== "on-duty")
        {
            driver.status = "on-duty";
        }
        driver.currentOrders += 1;

        await shipment.save();
        await driver.save();

        console.log("Shipment status updated successfully!");
        return res.status(200).json({ message: "Shipment status updated successfully!", shipment });
    } catch (error){
        console.log("Error: Internal Server Error!", error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
}


export async function scanShipment(req: Request, res: Response) {
    try{
        const { qrToken } = req.body;
        const authUser = req.user;
        if(!authUser){
            console.log("Unauthorized Access!");
            return res.status(401).json({ message: "Unauthorized Access!" });
        }

        const params = new URLSearchParams(qrToken);
        const shipmentId = params.get("sid");
        const Token = params.get("token");
        const driverId = authUser._id;
        if(!Token || !shipmentId){
            console.log("All fields are required!");
            return res.status(400).json({ message: "All fields are required!" });
        }

        const shipment = await Shipment.findOne({shipmentId: shipmentId,DriverId: driverId,})
        const driver = await DriverDetails.findOne({ userId: driverId });

        if(!driver){
            console.log("Driver not found!");
            return res.status(404).json({ message: "Driver not found!" });
        }

        if(!shipment){
            console.log("Shipment not found!");
            return res.status(404).json({ message: "Shipment not found!" });
        }
        
        if(Token !== shipment.pickupQrToken && Token !== shipment.deliveryQrToken){
            console.log("Token Missmatch!");
            return res.status(409).json({ message: "Token Missmatch!" });
        }

        if(Token.startsWith("DEL-")){
            if(shipment.status !== "in-transit"){
                console.log("Shipment not in transit!");
                return res.status(400).json({ message: "Shipment not in transit!" });
            }
            
            driver.currentOrders -= 1;
            if(driver.currentOrders === 0){
                driver.status = "available";
            }
            await driver.save();
            shipment.status = "delivered";
        }else if(Token.startsWith("PCK-")){
            if(shipment.status !== "confirmed"){
                console.log("Shipment not confirmed!");
                return res.status(400).json({ message: "Shipment not confirmed!" });
            }
            shipment.status = "in-transit";
        }else{
            console.log("Invalid QR Token!");
            return res.status(400).json({ message: "Invalid QR Token!" });
        }

        await shipment.save();
        console.log("Shipment scanned successfully!");
        return res.status(200).json({
            message: "Shipment scanned successfully!",
            shipment
        });
    }catch(error){
        console.log("Error:Internal Server Error!", error)
        return res.status(500).json({
            message:"Internal Server Error!",
            error
        })
    }
}