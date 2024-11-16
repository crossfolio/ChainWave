import User from '../models/User'
import { UserDTO } from '../interfaces/UserDTO'

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
}

export const userService = new UserService()
