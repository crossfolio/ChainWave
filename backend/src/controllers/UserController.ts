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
import { AlarmDTO } from '../interfaces/AlarmDTO'
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

  @Post('{wallet_address}/alarms')
  public async addOrRemoveAlarms(
    @Path() wallet_address: string,
    @Body() alarmsData: AlarmDTO[],
  ): Promise<ResponseModel> {
    for (const alarm of alarmsData) {
      if (
        alarm.isSwap &&
        (!alarm.srcChain || !alarm.dstChain) &&
        (!alarm.srcToken || !alarm.destToken)
      ) {
        this.setStatus(400)
        return sendError({
          code: 400,
          msg: 'srcChain and dstChain are required for swap alarms',
        })
      }
    }
    try {
      const user = await userService.updateUserAlarms(
        wallet_address,
        alarmsData,
      )
      return sendOk()
    } catch (error) {
      console.log(error)
      this.setStatus(500)
      return sendError({
        code: 500,
        msg: 'addOrRemoveAlarms failed',
      })
    }
  }

  @Get('{wallet_address}/alarms')
  public async getUserWithAlarms(
    @Path() wallet_address: string,
  ): Promise<AlarmDTO[] | ResponseModel> {
    try {
      const user = await userService.getUserWithAlarms(wallet_address)
      return user.alarms || []
    } catch (error) {
      console.log(error)
      this.setStatus(500)
      return sendError({
        code: 500,
        msg: 'getUserWithAlarms failed',
      })
    }
  }
}
