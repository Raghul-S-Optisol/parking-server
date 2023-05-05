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
const client = new mongodb_1.MongoClient('mongodb://localhost:27017/logindb', {});
client.connect();
const db = client.db('logindb');
const currentDate = new Date();
const mongodb_2 = require("mongodb");
const User = (0, mongoose_1.model)('User', schema_1.userSchema, 'users');
router.post('/park/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    const existingUser = yield User.findOne({ email });
    if (existingUser) {
        res.status(200).json({ status: 200, Message: 'Existing User' });
    }
    else {
        const user = new User({ name, email });
        user.save()
            .then(() => res.status(200).json(user))
            .catch(err => res.send(err));
    }
}));
router.post('/admin/add_location', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { location, slotNumber } = req.body;
    db.collection('location').insertOne({ location: location, slotNumber: slotNumber })
        .then(() => {
        res.status(200).json({ message: 'Slot Successfully Created' });
    })
        .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Error updating document' });
    });
    for (let i = 1; i <= slotNumber; i++) {
        db.collection('locations').insertOne({ location: location, slotNumber: i, availability: 1, startTime: currentDate, endTime: currentDate }, {});
    }
}));
const User2 = mongoose_1.default.model('User2', schema_1.userSchema, 'vehicle');
router.get('/admin/history', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User2.find({});
        res.status(200).json({ users });
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
}));
router.put('/admin/update_slots', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { location, slotNumber, availability } = req.body;
    const startTime = currentDate;
    const endTime = currentDate;
    const query3 = { location: location, slotNumber: slotNumber };
    const update3 = { $set: {
            startTime: startTime,
            endTime: endTime,
            availability: availability
        } };
    db.collection('locations').updateOne(query3, update3)
        .then(() => {
        res.status(200).json({ status: 200, message: 'Admin - Slot Successfully Edited ' });
    })
        .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Error while editing Slot' });
    });
    // it change slot availabilty by increment 1
    if (availability == 1) {
        const query4 = { location: location };
        const update4 = { $inc: { slotNumber: 1 } };
        // Updating the document
        const result = db.collection('location').updateOne(query4, update4, {});
        console.log(`${(yield result).modifiedCount} slot Modified`);
    }
}));
router.delete('/admin/delete_slots', function (req, res) {
    //const location = req.body.location;
    const _id = req.body._id;
    const result = db.collection('locations').deleteOne({ _id: new mongodb_2.ObjectId(_id) })
        .then(() => {
        res.status(200).json({ status: 200, message: 'Admin - Slot Successfully Deleted ' });
    })
        .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Error while delete a Slot' });
    });
});
exports.default = router;
