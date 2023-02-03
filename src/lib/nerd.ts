/**
 * Nerd flag.
 * This is undocumented.
 * 
 * Particularly nerd developers can use this flag as condition to run extremely verbose code or 
 * simply to output stupid jokes.
 */
export const isNerd = process.argv.find((p:string) => p == '--nerd');


/**
 * 
 */
export function yourScriptHasBeenTerminated(){
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