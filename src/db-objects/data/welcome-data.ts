import BaseData from '../base-data'
import DataKey from '../datakeys'

export default class WelcomeData extends BaseData {
    message: string
    welcomeChannel: string

    constructor(guildId: string) {
        super(guildId, DataKey.welcomeMessageSetup)
    }
}
