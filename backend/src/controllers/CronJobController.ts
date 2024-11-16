import cron from 'node-cron'
import 'dotenv/config'
import { PushAPI, CONSTANTS } from '@pushprotocol/restapi'
import { ethers } from 'ethers'
import { alarmService } from '../services/AlarmService'
import { cronJobService } from '../services/CronJobService'
import { swapService } from '../services/SwapService'
import { IUser } from '../models/User'
import { Schema } from 'mongoose'

async function main() {
  // Initialize Push Protocol
  let dvp: ethers.Wallet
  let userDvp: PushAPI
  try {
    dvp = new ethers.Wallet(
      process.env.PUSH_USER_1_PRIVATE_KEY || 'default_private_key',
    )
    userDvp = await PushAPI.initialize(dvp, {
      env: CONSTANTS.ENV.PROD,
    })
    console.log('Push Protocol initialized')
  } catch (error) {
    console.error('cannot initialized Push Protocol:', error)
  }

  // Set Cron Job, every minute
  cron.schedule('* * * * *', async () => {
    console.log('Cron Job execution started')
    const symbols = await alarmService.getDistinctSymbols()
    for (const symbol of symbols) {
      const marketDataRes = await cronJobService.fetchMarketData(symbol)
      const cryptoData = marketDataRes.data[symbol]
      if (cryptoData && cryptoData.quote && cryptoData.quote.USD) {
        const currentPrice = cryptoData.quote.USD.price
        console.log(`Fetched data for ${symbol}: $${currentPrice}`)

        const alarms = await cronJobService.getAlarmsByPrice(
          symbol,
          currentPrice,
        )

        if (!alarms) {
          continue
        }
        for (const alarm of alarms) {
          const users = alarm.users as unknown as IUser[]
          if (alarm.isSwap) {
            for (const user of users) {
              console.log(`Swapping for ${user.walletAddress}`)
              await swapService.autoSwap(
                user.walletAddress,
                alarm.srcChain!,
                alarm.dstChain!,
                alarm.srcToken!,
                alarm.destToken!,
              )
            }
          }
          for (const user of users) {
            await cronJobService.sendNotification(
              symbol,
              currentPrice,
              user.walletAddress,
              userDvp,
            )
          }
          await cronJobService.setAlarmInactive(
            alarm._id as Schema.Types.ObjectId,
          )
        }
      } else {
        console.log(`No data found for ${symbol}`)
      }
    }
    console.log('Cron Job execution completed')
  })

  console.log('Cron Job started')
}

main().catch((error) => console.error('Main function error:', error))
