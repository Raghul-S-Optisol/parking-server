"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const schema_1 = require("../Schemas/schema");
const mongoose_1 = __importStar(require("mongoose"));
const mongodb_1 = require("mongodb");
const stripe = require('stripe')('YOUR_SECRET_KEY');
const client = new mongodb_1.MongoClient('mongodb://localhost:27017/logindb', {});
client.connect();
const db = client.db('logindb');
const User1 = (0, mongoose_1.model)('User1', schema_1.userSchema, 'locations');
router.get('/user/select_location', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const location = req.query.location;
    try {
        const users = yield User1.find({ location });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
}));
router.post('/booked', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, location, slotNumber, price, vehicleNo } = req.body;
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    // Step 2: Update values in locations collection
    const query = { location, slotNumber };
    const update = {
        $set: {
            startTime,
            endTime,
            availability: 0,
        },
    };
    try {
        db.collection('locations').updateOne(query, update);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating document' });
        return;
    }
    // Step 3: Update values in location collection
    const query2 = { location };
    const update1 = { $inc: { slotNumber: -1 } };
    try {
        const result = db.collection('location').updateOne(query2, update1);
        console.log(`${(yield result).modifiedCount} slot updated successfull`);
    }
    catch (err) {
        console.log(err);
        return;
    }
    // Step 1: Store values in storage collection
    try {
        yield mongoose_1.default.connection.collection('vehicle').insertOne({ name, email, location, slotNumber, vehicleNo, price, startTime, endTime });
        res.status(200).json({ status: 200, message: 'Slot Successfully Booked' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating document' });
    }
}));
const loc = mongoose_1.default.model('loc', schema_1.locationSchema, 'location');
router.get('/user/select_all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use the find method to retrieve all documents
        const loct = yield loc.find({});
        res.status(200).json(loct);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
const User3 = mongoose_1.default.model('User4', schema_1.userSchema, 'vehicle');
router.get('/user/history', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.query.email;
    try {
        const users = yield User3.find({ email: email });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
}));
router.post('/payment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount } = req.body;
        const payment = yield stripe.paymentIntents.create({
            amount,
            currency: 'INR',
            description: 'Example charge',
            confirm: true,
        });
        console.log('Payment successful', payment);
        res.json({
            message: 'Payment successful',
            success: true,
        });
    }
    catch (error) {
        console.log('Error', error);
        res.json({
            message: 'Payment failed',
            success: false,
        });
    }
}));
exports.default = router;
