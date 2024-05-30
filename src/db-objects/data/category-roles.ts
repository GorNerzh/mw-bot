import BaseData from '../base-data'
import DataKey from '../datakeys'

export default class CategoryRoleData extends BaseData {
    categoryRoleIds: Array<string>
    ghostRoleIds: Array<string>

    constructor(guildId: string) {
        super(guildId, DataKey.categoryRoles)
        this.categoryRoleIds = new Array<string>()
        this.ghostRoleIds = new Array<string>()
    }
}