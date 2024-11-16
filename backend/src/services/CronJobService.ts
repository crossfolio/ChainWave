import axios from 'axios'
import Alarm, { IAlarm } from '../models/Alarm'
import { ObjectId } from 'mongoose'

export class CronJobService {
  public async sendNotification(
    symbol: string,
    price: number,
    userId: string,
    userDvp: any,
  ) {
    try {
      await userDvp.channel.send([userId], {
        notification: {
          title: `${symbol} Price Alert`,
          body: `${symbol} price already reached $${price}`,
        },
      })
      console.log(`Sent notification for ${symbol} at $${price}`)
    } catch (error) {
      console.error('cannot send notify:', error)
    }
  }

  public async fetchMarketData(symbol: string) {
    try {
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        {
          params: { symbol },
          headers: {
            'X-CMC_PRO_API_KEY':
              process.env.COINMARKETCAP_KEY || 'default_api_key',
          },
        },
      )

      return response.data
    } catch (error) {
      console.error(`cannot call ${symbol} coinmarketcap API:`, error)
      return null
    }
  }

  public async getAlarmsByPrice(
    symbol: string,
    currentPrice: number,
  ): Promise<IAlarm[] | void> {
    try {
      const alarms = await Alarm.find({
        symbol,
        status: 'active',
        $or: [
          { condition: 'less than', price: { $gt: currentPrice } },
          { condition: 'greater than', price: { $lt: currentPrice } },
        ],
      })
        .populate('users')
        .lean()

      if (alarms.length === 0) {
        console.log(
          `No alarms match the criteria for symbol ${symbol} at price ${currentPrice}`,
        )
      }

      return alarms as IAlarm[]
    } catch (error) {
      console.error('Error during notification process:', error)
    }
  }

  public async setAlarmInactive(id: ObjectId) {
    try {
      await Alarm.findByIdAndUpdate(id, { status: 'inactive' })
    } catch (error) {
      console.error('cannot set alarm to inactive:', error)
    }
  }
}

export const cronJobService = new CronJobService()
