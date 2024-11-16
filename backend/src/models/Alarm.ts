import mongoose, { Schema, Document } from 'mongoose'

export type Condition = 'less than' | 'greater than' | 'equal to'
export type Status = 'active' | 'inactive'

export interface IAlarm extends Document {
  symbol: string
  condition: Condition
  price: number
  users: Schema.Types.ObjectId[]
  status: Status
  isSwap: boolean
  srcChain?: string
  dstChain?: string
}

const AlarmSchema: Schema = new Schema<IAlarm>(
  {
    symbol: { type: String, required: true },
    condition: {
      type: String,
      enum: ['less than', 'greater than', 'equal to'],
      required: true,
    },
    price: { type: Number, required: true },
    users: [
      {
        ref: 'User',
        type: Schema.Types.ObjectId,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
    isSwap: {
      type: Boolean,
      default: false,
    },
    srcChain: { type: String },
    dstChain: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

const Alarm = mongoose.model<IAlarm>('Alarm', AlarmSchema)

export default Alarm
