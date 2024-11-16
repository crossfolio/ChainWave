import Alarm from '../models/Alarm'

export class AlarmService {
  public async getDistinctSymbols() {
    try {
      const symbols = await Alarm.distinct('symbol')
      return symbols
    } catch (err) {
      console.error('Error fetching distinct symbols:', err)
      throw err
    }
  }
}

export const alarmService = new AlarmService()
