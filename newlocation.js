const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');
app.use(cors());

const mongodb = require('mongodb');
const url = 'mongodb://localhost:27017/logindb';
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

//app.use(express.static('public'));
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const stripe = require('stripe')('YOUR_SECRET_KEY');


mongoose.connect(url, { useNewUrlParser: true });
const client = new MongoClient(url, { useUnifiedTopology: true, useUnifiedTopology: true });

const db = client.db('logindb');

client.connect(function(err) {
    if (err) throw err;
    else{console.log('Connected to database');}   
  });


const Schema = new mongoose.Schema({
    name: String,
    email: String,
    location: String,
    slotNumber:Number,
    vehicleNo:String,
    price:Number,
    availability:Number,
    startTime:Date,
    endTime:Date
  });
  const currentDate = new Date();


// ***********************************************************************************//
// It adds the data's to the users collection


const User = mongoose.model('User',Schema,'users');
  
app.post('/park/signin', async  (req, res) => {
  const { name, email } = req.body;
  const existingUser = await User.findOne({ email });

  const user = new User({ name, email });
  user.save()
    .then(() => res.json(user))
    .catch(err => res.send(err));
});



// ***********************************************************************************//
// It adds the documents to locations collection and update the location collection
app.post('/admin/add_location', async  (req, res) => {
    const location_name=req.body.location;
    const slots =req.body.slotNumber
    db.collection('location').insertOne({location_name:location_name,slots:slots})
    .then(() => {
      res.status(200).json({ message: 'Slot Successfully Created' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error updating document' });
    });
    for (let i = 1; i <= slots; i++) {
      db.collection('locations').insertOne({location_name:location_name,slot_number:i, availability:1,start_date:currentDate,end_date:currentDate}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          //res.json({ message: 'Data inserted successfully.' });
          console.log('Slot',i,'created successfully');
        }

      });
    }
    
  });

  // ***********************************************************************************//
  // It gives the data's of matched location
  const User1 = mongoose.model('User',Schema,'locations');
  app.post('/user/select_location', async  (req, res) => {
    const location_name = req.body.location;
    try {
        const users = await User1.find({location_name:location_name});
        res.json(users);
      } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
      }
  });


  // ***********************************************************************************//
  // It stores the data's into the storage collection and update the data's in locations collection

  app.post('/booked', async  (req, res) => {
    const name=req.body.name;
    const email=req.body.email;
    const location=req.body.location;
    const slotNumber=req.body.slotNumber;
    const price=req.body.price;
    const vehicleNo=req.body.vehicleNo;
    const startTime= new Date(req.body.startTime);
    const endTime=new Date(req.body.endTime);
    //step1
    // values stored into storage collection
    db.collection('vehicle').insertOne({name:name,email:email,location:location,slot_number:slotNumber,vehicle_number:vehicleNo,price:price,start_date:startTime,end_date:endTime})
    .then(() => {
      res.status(200).json({ message: 'Slot Successfully Booked' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error updating document' });
    });

    //step2
    // values updated into locations collection
    const query = { location_name: location , slot_number:slotNumber};

    const update = { $set: { 
      start_date:startTime,
      end_date:endTime,
      availability:0 
    } };
  
    // Updating the document
    db.collection('locations').updateOne(query, update)
    .then(() => {
     // res.status(200).json({ message: 'Slot Successfully Booked' });
    })
    .catch((err) => {
      console.error(err);
     // res.status(500).json({ message: 'Error updating document' });
    });
 
    //step3
    // values updated into location collection
    const query1 = { location_name: location };
    const update1 =  { $inc: { slots: -1 } };
  
    // Updating the document
    db.collection('location').updateOne(query1, update1, function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      //res.json(result);
      console.log(result.modifiedCount);
    }); 

  });  
      


  // ***********************************************************************************//
  // It displays the all history to admin
  const User3 = mongoose.model('User3',Schema,'vehicle');
  app.get('/admin/history', async  (req, res) => {
    try {
        const users = await User3.find({});
        res.json(users);
      } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
      }
  });


  // ***********************************************************************************//
  // It displays the  location table
  const locationSchema = new mongoose.Schema({
    location: String,
    slotNumber: Number,
  });
  const loc = mongoose.model('loc', locationSchema,'location');
  app.get('/user/select_all', async (req, res) => {
    try {
      // Use the find method to retrieve all documents
      const loct = await loc.find({});
      res.status(200).json(loct);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  




  // ***********************************************************************************//
  // It displays his/her own history
  const User4 = mongoose.model('User4',Schema,'vehicle');
  app.get('/user/history', async  (req, res) => {
    const email = req.query.email;
    try {
        const users = await User4.find({email:email});
        res.json(users);
      } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
      }
  });



// ***********************************************************************************//
// to edit/delete operation of particular slot

//update
app.put('/admin/update_slots', (req, res) => {
  const location=req.body.location;
  const slotNumber =req.body.slotNumber;
  const availability =req.body.availability;
  const startTime= currentDate;
  const endTime=currentDate;

  const query3 = { location_name: location , slot_number:slotNumber};

    const update3 = { $set: { 
      start_date:startTime,
      end_date:endTime,
      availability:availability
    } };

  db.collection('locations').updateOne(query3, update3)
  .then(() => {
    res.status(200).json({ message: 'Admin - Slot Successfully Edited ' });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Error while editing Slot' });
  });
  // it change slot availabilty by increment 1
  if(availability==1){

    const query4 = { location_name: location };
      const update4 =  { $inc: { slots: 1 } };
    
      // Updating the document
      db.collection('location').updateOne(query4, update4, function(err, result) {
        if (err) {
          console.log(err);
          return;
        }
        //res.json(result);
        console.log(result.modifiedCount);
      });
   }
});
 

//delete
app.delete('/admin/delete_slots', function(req, res) {
  //const location = req.body.location;
  const _id = req.body._id;
  const slot_number = req.body.slotNumber;

  db.collection('locations').deleteOne({ _id: new ObjectId(_id) })
  .then(() => {
    res.status(200).json({ message: 'Admin - Slot Successfully Deleted ' });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Error while delete a Slot' });
  });

});


  // ***********************************************************************************//
  // auto check for expired time and change the availability status

  cron.schedule('* * * * *', () => {
    const collection = db.collection('locations');
    const currentTime = new Date();
    const query2 = { end_date: { $lt: currentTime } };
    const update2 = { $set: { 
      start_date:currentDate,
      end_date:currentDate,
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
//

// ***********************************************************************************//
// stripe payment 

  app.post('/payment', async (req, res) => {
     const amount = req.body.price;
     const email=req.body.email;
     const paymentIntent = await stripe.paymentIntents.create({
       amount,
       currency: 'INR'
     });
     res.send({
       clientSecret: paymentIntent.client_secret
     });
  });



// ***********************************************************************************//
//port working defined

app.listen(8080,()=>{
    console.log('listening to port',8080);
})







/*

  // ***********************************************************************************
  // It displays the document of mentioned location with slot available
  const User2 = mongoose.model('User2',Schema,'location');
  app.get('http://localhost:8080/user/select_all', async  (req, res) => {
    try {
        const users = await User2.find({});
        res.json(users);
      } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
      }

  });



// ***********************************************************************************
// to delete all the specified document in location and locations collection

app.delete('/delete/location', (req, res) => {
  const loc = req.body.location;
  db.collection('location').deleteMany({ location: loc })
  .then(() => {
    res.status(200).json({ message: 'Slot Successfully Deleted' });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Error updating document' });
  }); 

  db.collection('locations').deleteMany({ location: loc })
  .then(() => {
    res.status(200).json({ message: 'Slots Successfully Deleted' });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Error while deletion' });
  });
  
});

*/