import { Router } from "express";
const router = Router();
import { Request, Response } from "express";
import { IUser } from "../Interface/interface";
import { userSchema } from "../Schemas/schema";
import mongoose,{model} from "mongoose";
import { Db }  from 'mongodb';
import mongodb, { MongoClient } from 'mongodb';


const client: MongoClient = new MongoClient('mongodb://localhost:27017/logindb', { });
client.connect();

const db:Db = client.db('logindb');
const currentDate = new Date();

import { ObjectId } from 'mongodb';

const User = model<IUser>('User', userSchema, 'users');
router.post('/park/signin', async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(200).json({status:200,Message:'Existing User'})
    } else {
    const user = new User({ name, email });
    user.save()
      .then(() => res.status(200).json(user))
      .catch(err => res.send(err));
    }
  });



router.post('/admin/add_location', async (req: Request, res: Response) => {
    const {  location, slotNumber } = req.body;
    db.collection('location').insertOne({location:location,slotNumber:slotNumber})
      .then(() => {
        res.status(200).json({ message: 'Slot Successfully Created' });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Error updating document' });
      });
      for (let i = 1; i <= slotNumber; i++) {
        db.collection('locations').insertOne({location:location,slotNumber:i, availability:1,startTime:currentDate,endTime:currentDate},{
        });
      }    
    });
  
 
const User2 = mongoose.model<IUser>('User2',userSchema,'vehicle');
router.get('/admin/history', async  (req:Request, res:Response) => {
  try {
      const users = await User2.find({});
      res.status(200).json({users});
    } catch (error) {
      console.log(error);
      res.status(500).send('Server Error');
    }
});



router.put('/admin/update_slots', async(req:Request, res:Response) => {
    const {location, slotNumber, availability} = req.body;
    const startTime= currentDate;
    const endTime=currentDate;
  
    const query3 = { location: location , slotNumber:slotNumber};
  
    const update3 = { $set: { 
        startTime:startTime,
        endTime:endTime,
        availability:availability
    } };
  
    db.collection('locations').updateOne(query3, update3)
    .then(() => {
      res.status(200).json({ status:200,message: 'Admin - Slot Successfully Edited ' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error while editing Slot' });
    });
    // it change slot availabilty by increment 1
    if(availability==1){
  
      const query4 = { location: location };
        const update4 =  { $inc: { slotNumber: 1 } };
      
        // Updating the document
        const result =db.collection('location').updateOne(query4, update4,{
        });
          console.log(`${(await result).modifiedCount} slot Modified`);
       
     }
});
  


router.delete('/admin/delete_slots', function(req:Request, res:Response) {
    //const location = req.body.location;
    const _id = req.body._id;
  
    const result=db.collection('locations').deleteOne({ _id: new ObjectId(_id) })
    .then(() => {
      res.status(200).json({status:200, message: 'Admin - Slot Successfully Deleted ' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error while delete a Slot' });
    });  
  
});
  





export default router;