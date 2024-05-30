import { QuickDB } from 'quick.db'
import DataKey from './datakeys'

abstract class BaseData {
    protected _key: string

    async loadAsync() {
        const db = new QuickDB()
        const json = await db.get(this._key)
        Object.assign(this, json)
    }

    async saveAsync() {
        const db = new QuickDB()
        const key = this._key
        delete this._key
        await db.set(key, this)
    }

    constructor(guildId: string, key: string | DataKey) {
        if (typeof key !== 'string') {
            this._key = guildId.concat('.', DataKey[key])
        } else {
            this._key = guildId.concat('.', key)
        }
    }
}

export default BaseData
