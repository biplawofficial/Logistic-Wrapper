import axios from 'axios';
import { config } from "../utils/envConfig"

const apiKey = config.GSTIN_VERIFY_API_KEY;

export async function verifyGstin(gstin:string) {
    try {
        if (!gstin) {
            console.log("GSTIN is required!");
            return { message: "GSTIN is required!", flag: "false" };
        }
        const response = await axios.get(`http://sheet.gstincheck.co.in/check/${apiKey}/${gstin}`)

        if (response.data.flag == true) {
            console.log(`GSTIN ${gstin} is valid.`);
            return {
                message: "GSTIN is valid",
                flag: "true",
                data: response.data
            };
        } else {
            console.log(`GSTIN ${gstin} is invalid.`);
            return {
                message:"Invalid GSTIN",
                data: response.data 
            };
        }
    } catch (error) {
        console.log("Error verifying GSTIN:", error);
        return ({
            message: "Error verifying GSTIN.",
            error: error instanceof Error ? error.message : error
        });
    }
}