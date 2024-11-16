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
  public status?: Status

  @Example(true)
  public isSwap?: boolean

  public srcChain?: string

  public dstChain?: string

  public _id?: string | null
}
