// Database migration result fields
// {
//   _id: string
//   direction: string
//   name: string
//   started: Date
//   status: 'running' | 'completed' | 'error'
//   finished: Date
//   migrationResultData: any | null
// }

export const createDbMigration = ({ db }) => {
  const getMigrationLastCompletedRun = async (name, direction = { $in: ['up', 'down'] }) => {
    const selector = { direction, name, status: 'completed' }
    const options = { sort: { started: -1 } }
    const lastCompletedRun = await db.collection('databaseMigrations').findOne(selector, options)
    return lastCompletedRun
  }

  const migrate = direction => {
    if (direction !== 'up' && direction !== 'down') {
      return () => {}
    }

    return async migration => {
      const { up, down, name, runOnlyOnce = true } = migration
      const lastCompletedRun = await getMigrationLastCompletedRun(name)
      if (runOnlyOnce && lastCompletedRun && lastCompletedRun.direction === direction) {
        return
      }

      const lastCompletedUpRun = await getMigrationLastCompletedRun(name, 'up')
      if (direction === 'down' && !lastCompletedUpRun) {
        return // Can't go 'down' without a successful 'up'
      }

      const migrationLog = { direction, name, started: new Date(), status: 'running' }
      const { insertedId: migrationId } = await db.collection('databaseMigrations').insertOne(migrationLog)
      let modifier = {}

      try {
        if (direction === 'up') {
          const migrationResultData = await up(db)
          modifier = { $set: { status: 'completed', finished: new Date() } }
          if (migrationResultData) {
            modifier.$set.migrationResultData = migrationResultData
          }
        }
        if (direction === 'down') {
          const { migrationResultData } = lastCompletedUpRun
          await down(db, migrationResultData)
          modifier = { $set: { status: 'completed', finished: new Date() } }
        }
      } catch (error) {
        modifier = { $set: { status: 'error', error: error.message, finished: new Date() } }
      }

      await db.collection('databaseMigrations').updateOne({ _id: migrationId }, modifier)
    }
  }

  return {
    migrateUp: migrate('up'),
    migrateDown: migrate('down'),
  }
}
