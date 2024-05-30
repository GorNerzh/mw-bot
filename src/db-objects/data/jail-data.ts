import BaseData from '../base-data'
import DataKey from '../datakeys'

export default class JailData extends BaseData {
    jailChannelId: string
    jailRoleId: string
    roleToRemoveId: string

    constructor(guildId: string) {
        super(guildId, DataKey.jailSetup)
    }
}
