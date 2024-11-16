import { Example } from 'tsoa'
import { BaseDTO } from './BaseDTO'
import { Condition, Status } from '../models/Alarm'

export class AlarmDTO extends BaseDTO {
  @Example('BTC')
  public symbol!: string

  @Example('less than')
  public condition!: Condition

  @Example(10000)
  public price!: number

  @Example('active')
  public status!: Status

  @Example(true)
  public isSwap?: boolean

  @Example('ETH')
  public srcChain?: string

  @Example('ARB')
  public dstChain?: string

  @Example('UNI')
  public srcToken?: string

  @Example('LINK')
  public destToken?: string

  public _id?: string | null
}
