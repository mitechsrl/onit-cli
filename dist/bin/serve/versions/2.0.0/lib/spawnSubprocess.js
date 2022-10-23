"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawnSubprocess = void 0;
const child_process_1 = require("child_process");
const types_1 = require("../../../../../types");
function spawnSubprocess(config) {
    var _a;
    if (!config.cmd) {
        throw new types_1.StringError('onFirstTscCompilationSuccess missing cmd');
    }
    let proc = (0, child_process_1.spawn)(config.cmd, {
        stdio: [null, 'inherit', 'inherit'],
        shell: true,
        cwd: (_a = config.cwd) !== null && _a !== void 0 ? _a : process.cwd()
    });
    let killCb = null;
    proc.on('exit', (code) => {
        proc = null;
        if (killCb)
            killCb();
    });
    return {
        kill: (cb) => {
            if (proc) {
                killCb = cb;
                proc.kill();
            }
            else {
                cb();
            }
        }
    };
}
exports.spawnSubprocess = spawnSubprocess;
//# sourceMappingURL=spawnSubprocess.js.map