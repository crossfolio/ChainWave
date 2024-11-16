import { Example } from 'tsoa'

export class DestinationUsdcDTO {
  @Example('0x123456')
  public txHash!: string

  @Example('ETH')
  public departureChain!: string

  @Example('ARB')
  public destinationChain!: string

  @Example('0x123456')
  public userWallet!: string
}

export class DestinationUsdcAndSwapDTO {
  @Example('0x123456')
  public txHash!: string

  @Example('ETH')
  public departureChain!: string

  @Example('ARB')
  public destinationChain!: string

  @Example('0x123456')
  public userWallet!: string

  @Example('0x123456')
  public token0!: string

  @Example('0x123456')
  public token1!: string

  @Example('3000')
  public fee!: number

  @Example('60')
  public tickSpacing!: number

  @Example('0x123456')
  public hookAddr!: string

  @Example('true')
  public zeroForOne!: boolean

  @Example('0x')
  public hookData!: string
}
