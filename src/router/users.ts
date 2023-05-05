import { Router } from "express";
const router = Router();
import { Request, Response } from "express";
import { IUser } from "../Interface/interface";
import { userSchema,locationSchema } from "../Schemas/schema";
import mongoose,{model} from "mongoose";
import { Db }  from 'mongodb';
import { MongoClient } from 'mongodb';


const stripe = require('stripe')('YOUR_SECRET_KEY');
const client: MongoClient = new MongoClient('mongodb://localhost:27017/logindb', { });
client.connect();

const db:Db = client.db('logindb');

const User1 = model<IUser>('User1', userSchema, 'locations');
router.get('/user/select_location', async (req: Request, res: Response) => {
  const location = req.query.location;
  try {
    const users = await User1.find({ location });
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});



router.post('/booked', async (req: Request, res: Response) => {
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
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating document' });
      return;
    }
  
    // Step 3: Update values in location collection
    const query2 = { location };
    const update1 = { $inc: { slotNumber: -1 } };
    try {
      const result =  db.collection('location').updateOne(query2, update1);
      console.log(`${(await result).modifiedCount} slot updated successfull`);
    } catch (err) {
      console.log(err);
      return;
    }
  
    // Step 1: Store values in storage collection
    try {
      await mongoose.connection.collection('vehicle').insertOne({ name, email, location, slotNumber, vehicleNo, price, startTime, endTime });
      res.status(200).json({ status:200,message: 'Slot Successfully Booked' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating document' });
    }
  });



const loc = mongoose.model<IUser>('loc', locationSchema,'location');
router.get('/user/select_all', async (req:Request, res:Response) => {
  try {
    // Use the find method to retrieve all documents
    const loct = await loc.find({});
    res.status(200).json(loct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



const User3 = mongoose.model<IUser>('User4',userSchema,'vehicle');
  router.get('/user/history', async  (req:Request, res:Response) => {
    const email = req.query.email;
    try {
        const users = await User3.find({email:email});
        res.json(users);
      } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
      }
});



router.post('/payment', async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
  
      const payment = await stripe.paymentIntents.create({
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
    } catch (error) {
      console.log('Error', error);
      res.json({
        message: 'Payment failed',
        success: false,
      });
    }
  });




export default router;