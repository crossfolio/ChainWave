import cron from 'node-cron'
import 'dotenv/config'
import { alarmService } from '../services/AlarmService'
import { cronJobService } from '../services/CronJobService'
import { IUser } from '../models/User'
import { Schema } from 'mongoose'

async function main() {
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
              // TODO: swap
            }
          }
          for (const user of users) {
            // TODO: send notification
          }
          await cronJobService.setAlarmInactive(alarm._id as Schema.Types.ObjectId)
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