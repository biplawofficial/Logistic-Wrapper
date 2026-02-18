import { Server, Socket } from "socket.io";
import { DriverDetails } from "../models/detailsModel";

export function registerDriverLocationSocket(io: Server) {
    io.on("connection", (socket: Socket)=>{
        console.log("Socket connected: ", socket.id);

        socket.on("driver:location:set", async (data, callback) => {
            try {
                const { userId, latitude, longitude } = data;

                if (!userId || latitude === undefined || longitude === undefined) {
                return callback?.({
                    success: false,
                    message: "Driver ID, Latitude and Longitude are required!"
                });
                }

                const driver = await DriverDetails.findOneAndUpdate(
                { userId },
                { latitude, longitude, updatedAt: new Date() },
                { new: true }
                );

                if (!driver) {
                return callback?.({
                    success: false,
                    message: "Driver not found!"
                });
                }

                socket.broadcast.emit("driver:location:update", {
                userId,
                latitude,
                longitude
                });
                console.log(`Driver location updated via socket for userId: ${userId}`);
                callback?.({
                success: true,
                message: "Driver location updated successfully!",
                driver
                });
                
            } 
            catch(error){
                console.log("Error updating driver location via socket: ", error);
                return callback?.({
                    success: false,
                    message: "Internal Server Error!"
                });
            }
        })
        socket.on("driver:location:get", async (data, callback) => {
            try {
                const { userId } = data;

                if (!userId) {
                return callback?.({
                    success: false,
                    message: "Driver ID is required!"
                });
                }

                const drivers = await DriverDetails.find(
                { userId },
                { latitude: 1, longitude: 1 }
                );

                callback?.({
                success: true,
                message: "Driver locations fetched successfully!",
                drivers
                });

            } catch (error) {
                console.error("Socket Error (get location):", error);
                callback?.({
                success: false,
                message: "Internal Server Error!"
                });
            }
            });

            socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
            });

        });
        }