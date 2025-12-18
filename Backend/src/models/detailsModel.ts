import mongoose from "mongoose"

const userDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true,
        unique: true
    },
    contactNumber: {
        type: String
    },
    age: {
        type: Number
    },
    companyDetails: {
        companyName: {
            type: String
        },
        gstin: {
            type: String
        },
        address: {
            type: String
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const UserDetails = mongoose.model("USER_DETAILS", userDetailsSchema)

const logisticDetailsSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    companyName: {
        type: String
    },

    gstin: {
        type: String
    },

    address: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const LogisticDetails = mongoose.model("LOGISTIC_DETAILS", logisticDetailsSchema)

const adminDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    contactNumber: {
        type: String
    },
    age:{
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const AdminDetails = mongoose.model("ADMIN_DETAILS", adminDetailsSchema)

const driverDetailsSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true,
        unique: true
    },
    logisticClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LOGISTIC_DETAILS",
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    latitude:{
        type: Number,
        default: null
    },
    longitude:{
        type: Number,
        default: null
    },
    contactNumber: {
        type: Number,
        required: true,
        unique: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    vehicleNumber: {
        type: String,
        required: true,
        unique: true
    },
    chasisNo: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["available", "unavailable", "on-duty"],
        default: "available"
    },
    currentOrders:{
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
})

const DriverDetails = mongoose.model("DRIVER_DETAILS", driverDetailsSchema)
export {
    UserDetails,
    LogisticDetails,
    AdminDetails,
    DriverDetails
}
