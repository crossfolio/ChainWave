import mongoose from 'mongoose'

export const connectDatabase = async () => {
  try {
    mongoose.set('debug', process.env.NODE_ENV === 'development')
    await mongoose.connect(
      (process.env.MONGO_URI as string) + '?directConnection=true',
      {
        user: process.env.MONGO_USER || 'root',
        pass: process.env.MONGO_PASSWORD || 'password',
        dbName: process.env.MONGO_DB || 'test',
        family: 4,
      },
    )
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Could not connect to MongoDB', error)
    process.exit(1)
  }
}
