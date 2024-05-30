import { QuickDB } from 'quick.db'
;(async () => {
    const db = new QuickDB()
    await db.init()
})()
