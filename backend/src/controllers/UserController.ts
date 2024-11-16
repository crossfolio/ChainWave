import {
  Controller,
  Route,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Path,
  Tags,
} from 'tsoa'
import { userService } from '../services/UserService'
import { UserDTO } from '../interfaces/UserDTO'
import { ResponseModel, sendError, sendOk } from '../utils/routeHelp'

@Route('users')
@Tags('User')
export class UserController extends Controller {
  @Post('/')
  public async createUser(
    @Body() data: Partial<UserDTO>,
  ): Promise<ResponseModel> {
    try {
      await userService.createUser(data)
    } catch (error) {
      console.log(error)
      this.setStatus(500)
      return sendError({
        code: 500,
        msg: 'createUser failed',
      })
    }
    return sendOk()
  }

  @Get('/')
  public async getUsers(): Promise<UserDTO[]> {
    return await userService.getUsers()
  }

  @Get('/{wallet_address}')
  public async getUserById(
    @Path() wallet_address: string,
  ): Promise<UserDTO | null> {
    return await userService.getUserByWalletAddress(wallet_address)
  }

  @Put('/{wallet_address}')
  public async updateUser(
    @Path() wallet_address: string,
    @Body() data: Partial<UserDTO>,
  ): Promise<ResponseModel> {
    try {
      await userService.updateUser(wallet_address, data)
    } catch (error) {
      console.log(error)
      this.setStatus(500)
      return sendError({
        code: 500,
        msg: 'updateUser failed',
      })
    }
    return sendOk()
  }

  @Delete('/{wallet_address}')
  public async deleteUser(
    @Path() wallet_address: string,
  ): Promise<ResponseModel> {
    try {
      await userService.deleteUser(wallet_address)
    } catch (error) {
      console.log(error)
      this.setStatus(500)
      return sendError({
        code: 500,
        msg: 'deleteUser failed',
      })
    }
    return sendOk()
  }
}
