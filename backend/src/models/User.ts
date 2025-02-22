import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  walletAddress: string
  name: string
  worldId: string
  alarms: Schema.Types.ObjectId[]
}

const UserSchema: Schema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    worldId: {
      type: String,
      required: true,
      unique: true,
    },
    alarms: [
      {
        ref: 'Alarm',
        type: Schema.Types.ObjectId,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

const User = mongoose.model<IUser>('User', UserSchema)

export default User
