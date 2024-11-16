import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IUser extends Document {
  walletAddress: string
  name: string
  worldId: string
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
  },
  {
    versionKey: false, // 禁用 __v 字段
    timestamps: true,
  },
)

const User = mongoose.model<IUser>('User', UserSchema)

export default User
