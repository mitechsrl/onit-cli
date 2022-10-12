const path = require('path');
const fs = require('fs');
const { tsquery } = require('@phenomnomnominal/tsquery');
const _ = require('lodash');

const toFileName = name => {
    return _.kebabCase(name).replace(/\-(\d+)$/g, '$1');
};


module.exports.mixinToArtifactFileName = function (mixinClass) {
    return (
        toFileName(mixinClass.replace('Mixin', '')) + '.mixin'
    );
};
