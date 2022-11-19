"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yeoman_assert_1 = __importDefault(require("yeoman-assert"));
const exec_1 = __importDefault(require("../../bin/doc/exec"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
function toYargsParam(obj) {
    return obj;
}
describe('Onit doc', function () {
    it('should reject for no config file', async () => {
        await yeoman_assert_1.default.rejects(async () => {
            return (0, exec_1.default)(toYargsParam({
                // this file does not exists
                p: __dirname
            }));
        });
    });
    it('should generate docs', async () => {
        await yeoman_assert_1.default.doesNotReject(async () => {
            return (0, exec_1.default)(toYargsParam({
                // this file does not exists
                p: path_1.default.join(__dirname, './example_project'),
                o: path_1.default.join(__dirname, './example_project/generated_docs/'),
            }));
        });
        yeoman_assert_1.default.file(path_1.default.join(__dirname, './example_project/generated_docs/HOME/index.md'));
        yeoman_assert_1.default.noFile(path_1.default.join(__dirname, './example_project/generated_docs/HOME/GETTING_STARTED/index.md'));
        yeoman_assert_1.default.fileContent(path_1.default.join(__dirname, './example_project/generated_docs/HOME/index.md'), 'Check this content');
        const f = path_1.default.join(__dirname, './example_project/generated_docs/HOME/GETTING_STARTED/index.md');
        if ((0, fs_1.existsSync)(f)) {
            yeoman_assert_1.default.noFileContent(f, 'You should not find this content');
        }
    });
});
//# sourceMappingURL=index.js.map