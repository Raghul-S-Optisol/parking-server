

import mongoose,{Schema,model,Document} from "mongoose";

mongoose.connect('mongodb://localhost:27017/logindb', { }).then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

const userSchema: Schema = new mongoose.Schema({
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



const locationSchema = new mongoose.Schema({
    location: String,
    slotNumber: Number,
  });

  export { userSchema,locationSchema };