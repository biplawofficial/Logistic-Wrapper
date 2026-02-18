import dotenv from 'dotenv';

if (dotenv.config().error) {
  console.error("Error loading .env file");
  throw new Error("Error loading .env file");
}

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
if (!process.env.GSTIN_VERIFY_API_KEY) throw new Error("GSTIN key missing");

if (!process.env.GMAIL_API) throw new Error("GMAIL_API missing");
if (!process.env.EMAIL_ID) throw new Error("EMAIL_ID missing");

export const config = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'asldkjfasljkf3983433',
  GSTIN_VERIFY_API_KEY: process.env.GSTIN_VERIFY_API_KEY,
  GMAIL_API: process.env.GMAIL_API,
  EMAIL_ID: process.env.EMAIL_ID,
};