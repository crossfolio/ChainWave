import { ISuccessResult } from '@worldcoin/idkit-core/*'

export class VerifyDTO {
  public proof!: ISuccessResult

  public signal?: string | undefined
}
