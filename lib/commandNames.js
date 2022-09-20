// windows being windows.. need a ".cmd" extension
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');
module.exports.npmExecutable = isWindows ? 'npm.cmd' : 'npm';

module.exports.onitExecutable = isWindows ? 'onit.cmd' : 'onit';
