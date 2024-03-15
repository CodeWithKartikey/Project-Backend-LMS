// Import necessary modules
import mongoose from 'mongoose';

// Schema and model objects from Mongoose for MongoDB interactions
import { Schema, model } from "mongoose";

/*
    Payment Schema definition
*/
const paymentSchema = new Schema(
    {   
        name: {
            type: 'String',
            required: [true, 'Name is required.'],
        },
        email: {
            type: 'String',
            required: [true, 'Email-ID is required.'],
        },
        mobile: {
            type: 'String',
            required: [true, 'Mobile number is required.'],
        },
        order_id: {
            type: 'String',
            required: [true, 'Order-ID is required.'],
        },
        payment_id: {
            type: 'String',
            required: [true, 'Payment-ID is required.'],
        },
        signature: {
            type: 'String',
            required: [true, 'Signature is required.'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required.'],
        },
        currency: {
            type: String,
            required: [true, 'Currency is required.'],
        },
        status: {
            type: String,
            default: 'pending'
        }
    }, { timestamps: true }
)

/*
    Payment Model definition
*/
const paymentProfile = model('Payment', paymentSchema)

// Exporting the course object as the default export.
export default paymentProfile