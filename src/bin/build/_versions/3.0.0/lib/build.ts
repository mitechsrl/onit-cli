/*
Copyright (c) 2021 Mitech S.R.L.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

import { logger } from '../../../../../lib/logger';
import { getConfigFileBackendEngine, getConfigFileFrontendEngine } from '../../../../../lib/onitConfigFileEngines';
import { GenericObject, OnitConfigFile, OnitConfigFileBuildTarget, OnitConfigFileEngineBackend, OnitConfigFileEngineFrontend } from '../../../../../types';
import { runClean } from '../../2.0.0/lib/clean';
import { runTsc } from '../../2.0.0/lib/tsc';
import { runWebpack } from '../../2.0.0/lib/webpack';
import { nextJsBuild } from './nextjs';

/**
 * Main build runner method. This entry point call all the others needed method
 * 
 * NOTE: V3 build is the same as V2 build for "onit-webpack"+"lb4" engine, it just add the support to "nextjs" engine(on frontend)
 * 
 * @param cwdPackageJson Package.json at rocess.cwd path 
 * @param buildTarget Build target config
 * @param onitConfigFile Full onit config file
 * 
 */
export async function runBuild(
    cwdPackageJson: GenericObject, 
    buildTarget: OnitConfigFileBuildTarget, 
    onitConfigFile: OnitConfigFile) {

    // select build mode
    let buildMode = '';
    if (['production', 'uat'].includes(buildTarget.mode??'')) {
        buildMode = 'production';
    } else {
        buildMode = 'development';
    }

    logger.log(`:hammer: Running build in ${buildMode} mode`);
    
    // clean the build directory
    await runClean(onitConfigFile, cwdPackageJson);

    // launch frontend build. We need to select the correct engine based on project config
    // Eventually multiple engines are launched
    const frontendEngines = getConfigFileFrontendEngine(onitConfigFile);

    for (const _key of Object.keys(frontendEngines)){

        const key = _key as keyof OnitConfigFileEngineFrontend;
        if (!frontendEngines[key]) continue;

        switch(key){
        case 'nextjs': {
            //launch nextjs build
            await nextJsBuild(onitConfigFile, cwdPackageJson, buildMode);
            break;
        }
        case 'onit-webpack': {
            // launch webpack build
            await runWebpack('./dist-fe', onitConfigFile, buildMode);
            break;
        }
        }
    }

    // launch backend server build. We need to selectthe correct engine based on project config
    const backendEngines = getConfigFileBackendEngine(onitConfigFile);
    for (const _key of Object.keys(backendEngines)){

        const key = _key as keyof OnitConfigFileEngineBackend;
        if (!backendEngines[key]) continue;

        switch(key){
        case 'lb4': {
            await runTsc(onitConfigFile, cwdPackageJson);
            break;
        }
        }
    }

    logger.info(':muscle: Build completed');
}
