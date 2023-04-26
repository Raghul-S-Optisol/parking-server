const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const cron = require('node-cron');

const url = 'mongodb://localhost:27017/logindb';
const MongoClient = require('mongodb').MongoClient;

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
    slot:Number,
    vehicle:String,
    amount:Number,
    availability:Number,
    start_time:Date,
    end_time:Date
  });
  const currentDate = new Date();


// ***********************************************************************************//
// It adds the data's to the users collection


const User = mongoose.model('User',Schema,'users');
  
app.post('/users', async  (req, res) => {
  const { name, email } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
      return res.send('User already exist')
    //return res.status(409).json({ error: 'Email already exists' });
  }
  const user = new User({ name, email });
  user.save()
    .then(() => res.json({ message: 'User saved successfully.' }))
    .catch(err => res.send(err));
});



// ***********************************************************************************//
// It adds the documents to locations collection and update the location collection
app.post('/newlocation', async  (req, res) => {
    const location=req.body.location;
    const slot =req.body.slot
    db.collection('location').insertOne({location:location,slot:slot})
    .then(() => {
      res.status(200).json({ message: 'Slot Successfully Created' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error updating document' });
    });
    for (let i = 1; i <= slot; i++) {
      db.collection('locations').insertOne({location:location,slot:i, availability:1,start_time:currentDate,end_time:currentDate}, function(err, result) {
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
  app.post('/display/related/location', async  (req, res) => {
    const location = req.body.location;
    try {
        const users = await User1.find({location:location});
        res.json(users);
      } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
      }
  });


  // ***********************************************************************************//
  // It stores the data's into the storage collection and update the data's in locations collection

  app.put('/storage/update', async  (req, res) => {
    const name=req.body.name;
    const email=req.body.email;
    const location=req.body.location;
    const slot =req.body.slot
    const amount=req.body.amount;
    const vehicle=req.body.vehicle;
    const start_time= new Date(req.body.start_time);
    const end_time=new Date(req.body.end_time);
    //step1
    // values stored into storage collection
    db.collection('storage').insertOne({name:name,email:email,location:location,slot:slot,vehicle:vehicle,amount:amount,start_time:start_time,end_time:end_time})
    .then(() => {
      res.status(200).json({ message: 'Slot Successfully Booked' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error updating document' });
    });

    //step2
    // values updated into locations collection
    const query = { location: location , slot:slot};

    const update = { $set: { 
      start_time:start_time,
      end_time:end_time,
      availability:0 
    } };
  
    // Updating the document
    db.collection('locations').updateOne(query, update)
    .then(() => {
      res.status(200).json({ message: 'Slot Successfully Booked' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error updating document' });
    });
/*  
    //step3
    // values updated into location collection
    const query1 = { location: location };
    const update1 =  { $inc: { slot: -1 } };
  
    // Updating the document
    db.collection('location').updateOne(query1, update1, function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      //res.json(result);
      console.log(result.modifiedCount);
    }); 
*/
  });  
      


  // ***********************************************************************************//
  // It displays the all history to admin
  const User3 = mongoose.model('User3',Schema,'storage');
  app.post('/imadmin', async  (req, res) => {
    const location = req.body.location;
    try {
        const users = await User3.find({});
        res.json(users);
      } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
      }
  });



  // ***********************************************************************************//
  // It displays his/her own history
  const User4 = mongoose.model('User',Schema,'storage');
  app.post('/imuser', async  (req, res) => {
    const email = req.body.email;
    try {
        const users = await User4.find({email:email});
        res.json(users);
      } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
      }
  });


// ***********************************************************************************//
// to delete all the specified document in location and locations collection

app.delete('/delete/location', (req, res) => {
  const loc = req.body.location;
 /* db.collection('location').deleteMany({ location: loc })
  .then(() => {
    res.status(200).json({ message: 'Slot Successfully Deleted' });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Error updating document' });
  }); */

  db.collection('locations').deleteMany({ location: loc })
  .then(() => {
    res.status(200).json({ message: 'Slots Successfully Deleted' });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Error while deletion' });
  });
  
});


// ***********************************************************************************//
// to edit/delete operation of particular slot

//update
app.put('/users/slot/update', (req, res) => {
  const location=req.body.location;
  const slot =req.body.slot;
  const availability =req.body.availability;
  const amount=req.body.amount;
  const vehicle=req.body.vehicle;
  const start_time= new Date(req.body.start_time);
  const end_time=new Date(req.body.end_time);

  const query3 = { location: location , slot:slot};

    const update3 = { $set: { 
      start_time:start_time,
      end_time:end_time,
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

    const query4 = { location: location };
      const update4 =  { $inc: { slot: 1 } };
    
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
app.delete('/users/slot/delete', function(req, res) {
  const location = req.body.location;
  const slot = req.body.slot;

  db.collection('locations').deleteOne({ location: location , slot:slot})
  .then(() => {
    res.status(200).json({ message: 'Admin - Slot Successfully Deleted ' });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Error while delete a Slot' });
  });
  /*const query4 = { location: location };
  const update4 =  { $inc: { slot: -1 } };
  db.collection('location').updateOne(query4, update4, function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    //res.json(result);
    console.log(result.modifiedCount);
  }); */

});


  // ***********************************************************************************//
  // auto check for expired time and change the availability status

  cron.schedule('* * * * *', () => {
    const collection = db.collection('locations');
    const currentTime = new Date();
    const query2 = { end_time: { $lt: currentTime } };
    const update2 = { $set: { 
      start_time:currentDate,
      end_time:currentDate,
      availability:1
    } };
    collection.updateMany(query2, update2)
      .then((result) => {
        console.log('Updated ',result.modifiedCount,' documents');  
      })
      .catch((err) => {
        console.error(err);
      });
  });
//

// ***********************************************************************************//
// stripe payment 

  app.post('/create-payment-intent', async (req, res) => {
     const { amount } = req.body;
     const paymentIntent = await stripe.paymentIntents.create({
       amount,
       currency: 'inr'
     });
     res.send({
       clientSecret: paymentIntent.client_secret
     });
  });



// ***********************************************************************************//
//

app.listen(8080,()=>{
    console.log('listening to port',8080);
})





/*
  // ***********************************************************************************
  // It displays the document of mentioned location with slot available
  const User2 = mongoose.model('User',Schema,'location');
  app.post('/display/location', async  (req, res) => {
    try {
        const users = await User2.find({});
        res.json(users);
      } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
      }

  });
*/