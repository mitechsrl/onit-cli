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
import { GenericObject, OnitConfigFile, OnitConfigFileBuildTarget } from '../../../../../types';
import { runClean } from './clean';
import { runTsc } from './tsc';
import { runWebpack } from './webpack';

/**
 * Main build runner method. This entry point call all he others needed mthod
 * 
 * @param cwdPackageJson Package.json at rocess.cwd path 
 * @param buildTarget Build target config
 * @param onitConfigFile Full onit config file
 * 
 */
export async function runBuild(cwdPackageJson: GenericObject, buildTarget:OnitConfigFileBuildTarget, onitConfigFile:OnitConfigFile) {
    // Do a production build as default

    let buildMode = '';
    if (['production', 'uat'].includes(buildTarget.mode??'')) {
        buildMode = 'production';
    } else {
        buildMode = 'development';
    }

    logger.log(`:hammer: Running build in ${buildMode} mode`);
    
    // clean the build directory
    await runClean(onitConfigFile, cwdPackageJson);

    // launch webpack build
    await runWebpack('./dist-fe', onitConfigFile, buildMode);

    // launch typescript build
    await runTsc(onitConfigFile, cwdPackageJson);

    logger.info(':muscle: Build completed');

    return {};
}
