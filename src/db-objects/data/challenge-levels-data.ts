import BaseData from '../base-data'
import DataKey from '../datakeys'

export default class ChallengeLevelData extends BaseData {
    challengeLevelIds: Array<RoleData>

    constructor(guildId: string) {
        super(guildId, DataKey.challengeLevels)
        this.challengeLevelIds = new Array<RoleData>()
    }
}

export class RoleData {
    roleId: string
    level: number
}
