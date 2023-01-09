import { createDbMigration } from './migrations'
import { getMongoDbConnection } from './getMongoDbConnection'

const testMigration = {
  name: 'test migration',
  runOnlyOnce: false,
  up: async db => {
    await db.collection('migrationTestsCollection').updateMany({ id: { $in: [1, 3, 4] } }, { $set: { new: true } })
    return { updatedIds: [1, 3] }
  },
  down: async (db, migrationResultData) => {
    const { updatedIds } = migrationResultData
    await db.collection('migrationTestsCollection').updateMany({ id: { $in: updatedIds } }, { $unset: { new: null } })
  },
}

describe('Database migrations', () => {
  beforeEach(async () => {
    const { db, close } = await getMongoDbConnection()
    await db.collection('migrationTestsCollection').deleteMany({})
    await db.collection('migrationTestsCollection').insertMany([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 5 }])
    await close()
  })

  test('Basic migration up', async () => {
    const { db, close } = await getMongoDbConnection()
    const { migrateUp } = createDbMigration({ db })
    expect(typeof migrateUp).toBe('function')

    await migrateUp(testMigration)

    const results = await db.collection('migrationTestsCollection').find({}).project({ _id: 0, id: 1, new: 1 }).toArray()
    await close()
    expect(results).toHaveLength(4)
    expect(results).toEqual([{ id: 1, new: true }, { id: 2 }, { id: 3, new: true }, { id: 5 }])
  })

  test('Basic migration down', async () => {
    const { db, close } = await getMongoDbConnection()
    const { migrateDown } = createDbMigration({ db })
    expect(typeof migrateDown).toBe('function')

    await migrateDown(testMigration)

    const results = await db.collection('migrationTestsCollection').find({}).project({ _id: 0, id: 1, new: 1 }).toArray()
    await close()
    expect(results).toHaveLength(4)
    expect(results).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 5 }])
  })
})
