import BaseData from '../base-data'
import DataKey from '../datakeys'

export default class BotRoleData extends BaseData {
    roleId: string

    constructor(guildId: string) {
        super(guildId, DataKey.botRole)
    }
}