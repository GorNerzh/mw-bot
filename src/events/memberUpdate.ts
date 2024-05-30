import { Collection, Events, Guild, GuildMember, Role } from 'discord.js'
import CategoryRoleData from '../db-objects/data/category-roles';
import ChallengeRolesData from '../db-objects/data/challenge-roles-data';
import ChallengeLevelData from '../db-objects/data/challenge-levels-data';
import RoleUtils from '../utils/role-utils';

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember: GuildMember, newMember: GuildMember) {

        const rolesAdded = getAddedRoles(oldMember, newMember);
        const rolesRemoved = getRemovedRoles(oldMember, newMember);

        if (rolesRemoved.size > 0) {
            await manageCategoryRoleRemoval(rolesRemoved, newMember)
        }
        if (rolesAdded.size > 0) {
            await manageCategoryRoleAddition(rolesAdded, newMember)
        }

        if (rolesRemoved.size > 0 || rolesAdded.size > 0) {
            await manageChallengeRoleLeveling(rolesAdded, rolesRemoved, newMember)
        }
    },
};

function getAddedRoles(oldMember: GuildMember, newMember: GuildMember): Collection<string, Role> {
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    return newRoles.filter((roleId, key) => !oldRoles.has(key));
}
function getRemovedRoles(oldMember: GuildMember, newMember: GuildMember): Collection<string, Role> {
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    return oldRoles.filter((roleId, key) => !newRoles.has(key))
}

//#region Category role management

async function manageCategoryRoleRemoval(rolesRemoved: Collection<string, Role>, member: GuildMember) {
    const data = new CategoryRoleData(member.guild.id)
    await data.loadAsync()

    if (data.categoryRoleIds.length == 0) {
        return
    }

    const categoryRoles = getCategoryRoles(rolesRemoved, data, member.guild)

    const categoryRolesToRemove = new Array<Role>()

    categoryRoles.forEach(categoryRole => {
        const childrenRoles = getCategoryRoleChildren(categoryRole, data, member.guild)

        if (!member.roles.cache.some(role => childrenRoles.has(role.id))) {
            categoryRolesToRemove.push(categoryRole)
        }
    })

    if (categoryRolesToRemove.length > 0) {
        await member.roles.remove(categoryRolesToRemove)
    }
}

async function manageCategoryRoleAddition(rolesAdded: Collection<string, Role>, member: GuildMember) {
    const data = new CategoryRoleData(member.guild.id)
    await data.loadAsync()

    if (data.categoryRoleIds.length == 0) {
        return
    }

    const categoryRolesToAdd = getCategoryRoles(rolesAdded, data, member.guild)
        .filter(r => !data.ghostRoleIds.includes(r.id))

    if (categoryRolesToAdd.length > 0) {
        await member.roles.add(categoryRolesToAdd)
    }
}

function getCategoryRoles(roles: Collection<string, Role>, data: CategoryRoleData, guild: Guild): Role[] {
    const categoryRoles = new Array<Role>()

    roles.forEach(role => {
        // return if the role added is a category role
        if (data.categoryRoleIds.includes(role.id, 0)) {
            return
        }

        const categoryRole = guild.roles.cache
            .filter(r => r.position > role.position // Select the roles above the one added
                && data.categoryRoleIds.includes(r.id, 0)) // Select the category roles
            .sort((r1, r2) => r1.position - r2.position) // Get the lowest
            .first()

        if (categoryRole && !categoryRoles.some(c => c.id == categoryRole.id)) {
            categoryRoles.push(categoryRole)
        }
    });

    return categoryRoles
}

function getCategoryRoleChildren(categoryRole: Role, data: CategoryRoleData, guild: Guild) {
    if (!data.categoryRoleIds.includes(categoryRole.id)) {
        return
    }

    const nextCategoryRole = guild.roles.cache
        .filter(r => r.position < categoryRole.position
            && data.categoryRoleIds.includes(r.id)
        )
        .sort((r1, r2) => r1.position - r2.position)
        .first()

    if (nextCategoryRole) {
        return guild.roles.cache
            .filter(r => r.position < categoryRole.position
                && r.position > nextCategoryRole.position)
    }
    else {
        return guild.roles.cache
            .filter(r => r.position < categoryRole.position
                && r.id < guild.id // removes @everyone role
            )
    }
}

//#endregion

//#region Challenge role management

async function manageChallengeRoleLeveling(rolesAdded: Collection<string, Role>, rolesRemoved: Collection<string, Role>, member: GuildMember) {
    const challengeData = new ChallengeRolesData(member.guild.id)
    const levelData = new ChallengeLevelData(member.guild.id)
    await challengeData.loadAsync()
    await levelData.loadAsync()

    if (challengeData.challengeRoleIds.length == 0
        || levelData.challengeLevelIds.length == 0
    ) {
        return
    }

    if (!rolesAdded.some(r => challengeData.challengeRoleIds.includes(r.id))
        && !rolesRemoved.some(r => challengeData.challengeRoleIds.includes(r.id))) {
        return
    }

    const roleUtils = new RoleUtils()

    const memberChallengeRolesCount = member.roles.cache.filter(r => challengeData.challengeRoleIds.includes(r.id)).size
    const memberLevelRoles = member.roles.cache.filter(r => levelData.challengeLevelIds.some(l => l.roleId == r.id))
    const correctLevelRoleId = roleUtils.getCorrectLevelRoleId(memberChallengeRolesCount, levelData)

    if (memberLevelRoles.size == 1 && memberLevelRoles.first().id == correctLevelRoleId) {
        return
    }
    // Update level roles
    if (memberLevelRoles.size > 0) {
        await member.roles.remove(memberLevelRoles)
    }

    if (correctLevelRoleId != null) {
        const correctLevelRole = member.guild.roles.cache.find(r => r.id == correctLevelRoleId)
        await member.roles.add(correctLevelRole)
    }
}

//#endregion