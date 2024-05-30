import ChallengeLevelData from "../db-objects/data/challenge-levels-data";

export default class RoleUtils {
    getCorrectLevelRoleId(level: number, data: ChallengeLevelData): string | null {
        const exactMatch = data.challengeLevelIds.find(item => item.level === level);
        if (exactMatch) {
            return exactMatch.roleId;
        }
    
        const lowerMatches = data.challengeLevelIds.filter(item => item.level < level);
        if (lowerMatches.length === 0) {
            return null;
        }
    
        const closestMatch = lowerMatches
            .reduce((r1, r2) => r1.level > r2.level ? r1 : r2);
    
        return closestMatch.roleId;
    }
}
