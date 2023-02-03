"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yourScriptHasBeenTerminated = exports.isNerd = void 0;
/**
 * Nerd flag.
 * This is undocumented.
 *
 * Particularly nerd developers can use this flag as condition to run extremely verbose code or
 * simply to output stupid jokes.
 */
exports.isNerd = process.argv.find((p) => p == '--nerd');
/**
 *
 */
function yourScriptHasBeenTerminated() {
    console.log('  ');
    console.log('                   <((((((\\\\');
    console.log('                   /       . }\\');
    console.log('                   ;--..--.__|}');
    console.log('(\\                 \'--/\\--\'   )');
    console.log(' \\\\                | \'-\'   :\'|');
    console.log('  \\\\               . -==-  .-|');
    console.log('   \\\\               \\.___.\'   \\--._');
    console.log('   [\\\\          __.--|       //  _/\'--.');
    console.log('   \\ \\\\       .\'-._ (\'-----\'/ __/      \\');
    console.log('    \\ \\\\     /   __>|      | \'--.       |');
    console.log('     \\ \\\\   |   \\   |     /    /       /');
    console.log('      \\ \'\\ /     \\  |     |  _/       /');
    console.log('       \\  \\       \\ |     | /        /');
    console.log('        \\  \\      \\        /        /');
    console.log('       YOUR SCRIPT HAS BEEN TERMINATED');
    console.log('  ');
}
exports.yourScriptHasBeenTerminated = yourScriptHasBeenTerminated;
//# sourceMappingURL=nerd.js.map