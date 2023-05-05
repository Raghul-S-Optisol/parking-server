
import {Application} from "express";
import express from "express";
import bodyParser from "body-parser";
import usersRouter from "./router/users";
import adminRouter from "./router/admin"
import cron from 'node-cron';
import cors from 'cors';
import { Db }  from 'mongodb';
import { MongoClient } from 'mongodb';


const client: MongoClient = new MongoClient('mongodb://localhost:27017/logindb', { });
client.connect();

const app:Application = express();
const db:Db = client.db('logindb');
const currentDate = new Date();

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", usersRouter);
app.use("/", adminRouter);


cron.schedule('* * * * *', () => {
  const collection = db.collection('locations');
  const currentTime = new Date();
  const query2 = { endTime: { $lt: currentTime } };
  const update2 = { $set: { 
    startTime:currentDate,
    endTime:currentDate,
    availability:1
  } };
  collection.updateMany(query2, update2)
    .then((result) => {
      console.log('Updated ',result.modifiedCount,' slots');  
    })
    .catch((err) => {
      console.error(err);
    });
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export {app}