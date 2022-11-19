import assert from 'yeoman-assert';
import yargs from 'yargs';
import exec from '../../bin/doc/exec';
import { GenericObject } from '../../types';
import path from 'path';
import { existsSync } from 'fs';

function toYargsParam(obj: GenericObject){
    return obj as yargs.ArgumentsCamelCase<unknown>;
}

describe('Onit doc', function () {

    it('should reject for no config file', async () => {
        await assert.rejects(async ()=> {
            return exec(toYargsParam({
                // this file does not exists
                p: __dirname
            }));
        });    
    });

    it('should generate docs', async ()=> {
        await assert.doesNotReject(async () => {
            return exec(toYargsParam({
                // this file does not exists
                p: path.join(__dirname,'./example_project'),
                o: path.join(__dirname,'./example_project/generated_docs/'),
            }));
        });    

        assert.file(path.join(__dirname,'./example_project/generated_docs/HOME/index.md'));
        assert.noFile(path.join(__dirname,'./example_project/generated_docs/HOME/GETTING_STARTED/index.md'));
        assert.fileContent(path.join(__dirname,'./example_project/generated_docs/HOME/index.md'),'Check this content');
        const f = path.join(__dirname,'./example_project/generated_docs/HOME/GETTING_STARTED/index.md');
        if (existsSync(f)){
            assert.noFileContent(f,'You should not find this content');
        }
    });
});