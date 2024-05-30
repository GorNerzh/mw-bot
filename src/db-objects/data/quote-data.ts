import BaseData from '../base-data'
import DataKey from '../datakeys'

export default class QuoteData extends BaseData {
    channelId: string

    constructor(guildId: string) {
        super(guildId, DataKey.quoteSetup)
    }
}
