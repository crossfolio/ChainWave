import { Example } from 'tsoa'

export class BaseDTO {
  @Example(new Date().toISOString())
  public createdAt?: Date

  @Example(new Date().toISOString())
  public updatedAt?: Date
}
