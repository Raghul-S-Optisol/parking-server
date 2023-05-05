import mongoose,{Schema,model,Document} from "mongoose";

interface IUser extends mongoose.Document {
    name: string;
    email: string;
    location: string;
    slotNumber: number;
    vehicleNo: string;
    price: number;
    availability: number;
    startTime: Date;
    endTime: Date;
  }

  export { IUser };