import BaseData from '../base-data'
import DataKey from '../datakeys'

export default class ChallengeRolesData extends BaseData {
    challengeRoleIds: Array<string>

    constructor(guildId: string) {
        super(guildId, DataKey.challengeRoles)
        this.challengeRoleIds = new Array<string>()
    }
}
