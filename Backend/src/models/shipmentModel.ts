import mongoose from "mongoose"

const shipmentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true
    },
    logisticClientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LOGISTIC_DETAILS",
    },
    DriverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DRIVER_DETAILS",
    },
    shipmentId:{
        type: String,
        required: true,
        unique: true,  
    },
    pickupQrToken:{
        type: String,
        required: true,
        unique: true,
    },
    deliveryQrToken:{
        type: String,
        required: true,
        unique: true,
    },
    pickupDetails:{
        longitude:{
            type: Number,
            required: true
        },
        latitude:{
            type: Number,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        address:{
            type: String,
            required: true
        },
        contactNumber:{
            type: Number,
            required: true
        }
    },
    deliveryDetails:{
        longitude:{
            type: Number,
            required: true
        },
        latitude:{
            type: Number,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        address:{
            type: String,
            required: true
        },
        contactNumber:{
            type: Number,
            required: true
        }
    },
    size:{
        length:{
            type: Number,
            required: true
        },
        width:{
            type: Number,
            required: true
        },
        height:{
            type: Number,
            required: true
        }
    },
    quantity:{
        type: Number,
        required: true
    },
    weight:{
        type: Number,
        required: true
    },
    netWeight:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum: ["confirmed", "rejected", "pending", "in-transit", "delivered", "cancelled"],
        default: "pending"
    },
    price:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

const Shipment = mongoose.model("SHIPMENTS", shipmentSchema)
export { Shipment }