/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */
/**
  * Search for subdirectories of dir which contains a valid config.js.
  * The goal is to detect all these directories and load their config.js files into an array, which will
  * tipycally be used for a user selection list.
  *
  * @param {*} dir
  * @returns
  */
export declare function directoryConfigsScanner(dir: string): Promise<any[]>;
