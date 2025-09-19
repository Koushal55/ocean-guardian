import mongoose, { Schema, Model } from 'mongoose';

// We define an interface for better TypeScript support
export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'citizen' | 'official';
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
  },
  role: {
    type: String,
    enum: ['citizen', 'official'],
    default: 'citizen',
  },
}, { timestamps: true });

// The key change is here:
// We check if the model is already defined before trying to define it again.
// Then we export the model, ensuring it's always the same one.
const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;