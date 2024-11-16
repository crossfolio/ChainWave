import { Example } from 'tsoa'
import { BaseDTO } from './BaseDTO'

export class UserDTO extends BaseDTO {
  @Example('walletAddress')
  public walletAddress!: string

  @Example('John Doe')
  public name!: string

  @Example('worldId')
  public worldId!: string
}
