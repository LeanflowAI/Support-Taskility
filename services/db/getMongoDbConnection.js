// import { MongoClient } from 'mongodb'
import { ObjectId } from 'mongodb'
import { getNewId } from '../helpers/server'


const {MongoClient} = require('mongodb');

const pkFactory = () => {}
pkFactory.createPk = getNewId

const url = process.env.MONGO_URL || ''
const dbName = process.env.MONGO_DB || ''
const mongoClientOptions = {
  appname: 'Taskility',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // validateOptions: true,
  pkFactory: {createPk: () => ObjectId().toString()},
  w: 'majority',
  monitorCommands: true,
  loggerLevel: 'debug',
}

export const getMongoDbConnection = async () => {
  console.log('getMongoDbConnection reached')
  console.log(`got to gotMongoDbConnection URL: ${url}, dbName: ${dbName}, mongoClientOptions: ${mongoClientOptions}`)
  const client = await MongoClient.connect(url, mongoClientOptions)
  const db = client.db(dbName)
  const clientPromise = client.connect()
  const close = async () => {
    // if (client && client.isConnected()) await client.close()
    if (client) await client.close()
    console.log('close db is executed')
  }
  // console.log("client", client)

  return { client, db, close }
}
