import BaseData from '../base-data'
import DataKey from '../datakeys'

export default class ModCmdData extends BaseData {
    channelId: string

    constructor(guildId: string) {
        super(guildId, DataKey.modCmdSetup)
    }
}
