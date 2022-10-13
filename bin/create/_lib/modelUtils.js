const _ = require('lodash');

const toFileName = name => {
    return _.kebabCase(name).replace(/\-(\d+)$/g, '$1');
};

module.exports.modelToArtifactFileName = function (modelClass) {
    return toFileName(modelClass.replace('Model', '')) + '.model';
};
