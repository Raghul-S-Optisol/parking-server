"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const users_1 = __importDefault(require("./router/users"));
const admin_1 = __importDefault(require("./router/admin"));
const node_cron_1 = __importDefault(require("node-cron"));
const cors_1 = __importDefault(require("cors"));
const mongodb_1 = require("mongodb");
const client = new mongodb_1.MongoClient('mongodb://localhost:27017/logindb', {});
client.connect();
const app = (0, express_1.default)();
const db = client.db('logindb');
const currentDate = new Date();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use("/", users_1.default);
app.use("/", admin_1.default);
node_cron_1.default.schedule('* * * * *', () => {
    const collection = db.collection('locations');
    const currentTime = new Date();
    const query2 = { endTime: { $lt: currentTime } };
    const update2 = { $set: {
            startTime: currentDate,
            endTime: currentDate,
            availability: 1
        } };
    collection.updateMany(query2, update2)
        .then((result) => {
        console.log('Updated ', result.modifiedCount, ' slots');
    })
        .catch((err) => {
        console.error(err);
    });
});
const port = 8080;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
