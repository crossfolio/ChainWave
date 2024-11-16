import User from '../models/User'
import { UserDTO } from '../interfaces/UserDTO'
import Alarm, { Status } from '../models/Alarm'
import mongoose, { Schema } from 'mongoose'
import { AlarmDTO } from '../interfaces/AlarmDTO'

export class UserService {
  public async createUser(data: Partial<UserDTO>): Promise<UserDTO> {
    const user = new User(data)
    const savedUser = await user.save()
    return savedUser.toObject() as unknown as UserDTO
  }

  public async getUsers(): Promise<UserDTO[]> {
    return (await User.find().lean()) as unknown as UserDTO[]
  }

  public async getUserByWalletAddress(
    walletAddress: string,
  ): Promise<UserDTO | null> {
    return (await User.findOne({ walletAddress }).lean()) as UserDTO | null
  }

  public async updateUser(
    walletAddress: string,
    data: Partial<UserDTO>,
  ): Promise<UserDTO | null> {
    const user = await User.findOne({ walletAddress })
    if (!user) {
      throw new Error('User not found')
    }
    return (await User.findOneAndUpdate({ walletAddress }, data, {
      new: true,
    }).lean()) as UserDTO | null
  }

  public async deleteUser(walletAddress: string): Promise<UserDTO | null> {
    return (await User.findOneAndDelete({
      walletAddress,
    }).lean()) as UserDTO | null
  }

  async getUserWithAlarms(walletAddress: string): Promise<UserDTO> {
    const user = await User.findOne({ walletAddress }).populate('alarms')
    if (!user) {
      throw new Error('User not found')
    }
    return user as unknown as UserDTO
  }

  public async updateUserAlarms(walletAddress: string, alarmData: AlarmDTO[]) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const user = await User.findOne({ walletAddress })
      if (!user) {
        throw new Error('User not found')
      }

      for (const alarmInfo of alarmData) {
        let alarm = await Alarm.findOne({
          symbol: alarmInfo.symbol,
          condition: alarmInfo.condition,
          price: alarmInfo.price,
        })

        if (!alarm) {
          alarm = new Alarm({ ...alarmInfo, users: [user._id] })
          await alarm.save({ session })
        } else {
          alarm.condition = alarmInfo.condition
          alarm.price = alarmInfo.price
          alarm.status = alarmInfo.status as Status
          if (
            !alarm.users.includes(user._id as unknown as Schema.Types.ObjectId)
          ) {
            alarm.users.push(user._id as unknown as Schema.Types.ObjectId)
          }
          await alarm.save({ session })
        }
        alarmInfo._id = alarm._id?.toString() || ''
        if (!user.alarms.includes(alarm._id as Schema.Types.ObjectId)) {
          user.alarms.push(alarm._id as Schema.Types.ObjectId)
        }
      }

      const alarmDataSet = new Set(alarmData.map((alarm) => alarm._id))
      const alarmIdsToRemove = user.alarms.filter(
        (alarmId) => !alarmDataSet.has(alarmId.toString()),
      )

      for (const alarmId of alarmIdsToRemove) {
        await Alarm.updateOne(
          { _id: alarmId },
          { $pull: { users: user._id } },
          { session },
        )
      }

      user.alarms = alarmData.map(
        (alarm) => alarm._id as unknown as Schema.Types.ObjectId,
      )
      await user.save({ session })

      await session.commitTransaction()
      session.endSession()

      return user as unknown as UserDTO
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      throw new Error('Transaction failed: ' + error)
    }
  }
}

export const userService = new UserService()
