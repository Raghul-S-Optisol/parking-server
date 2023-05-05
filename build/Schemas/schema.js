"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationSchema = exports.userSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect('mongodb://localhost:27017/logindb', {}).then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));
const userSchema = new mongoose_1.default.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
    },
    location: String,
    slotNumber: Number,
    vehicleNo: String,
    price: Number,
    availability: Number,
    startTime: Date,
    endTime: Date
});
exports.userSchema = userSchema;
const locationSchema = new mongoose_1.default.Schema({
    location: String,
    slotNumber: Number,
});
exports.locationSchema = locationSchema;
