"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParams = void 0;
['-exit'].forEach(c => {
    process.argv.forEach((p, index) => {
        if (p === c)
            process.argv[index] = '-' + process.argv[index];
    });
});
function getParams() {
    return process.argv;
}
exports.getParams = getParams;
//# sourceMappingURL=compatibilityParams.js.map