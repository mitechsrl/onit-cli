const RelationGenerator = require('@loopback/cli/generators/relation/index');
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');
const { CustomBelongsToRelationGenerator } = require('./CustomBelongsToRelationGenerator');
const { CustomHasManyRelationGenerator } = require('./CustomHasManyRelationGenerator');
const { CustomHasManyThroughRelationGenerator } = require('./CustomHasManyThroughRelationGenerator');
const { CustomHasOneRelationGenerator } = require('./CustomHasOneRelationGenerator');

class CustomRelationGenerator extends RelationGenerator {
    async scaffold () {
        if (this.shouldExit()) return false;

        let relationGenerator;

        this.artifactInfo.name = this.artifactInfo.relationType;

        switch (this.artifactInfo.relationType) {
        case relationUtils.relationType.belongsTo:
            relationGenerator = new CustomBelongsToRelationGenerator(this.args, this.opts);
            break;
        case relationUtils.relationType.hasMany:
            relationGenerator = new CustomHasManyRelationGenerator(this.args, this.opts);
            break;
        case relationUtils.relationType.hasManyThrough:
            relationGenerator = new CustomHasManyThroughRelationGenerator(this.args, this.opts);
            break;
        case relationUtils.relationType.hasOne:
            relationGenerator = new CustomHasOneRelationGenerator(this.args, this.opts);
            break;
        }

        try {
            await relationGenerator.generateAll(this.artifactInfo);
        } catch (error) {
            /* istanbul ignore next */
            this.exit(error);
        }
    }
}

module.exports.CustomRelationGenerator = CustomRelationGenerator;
