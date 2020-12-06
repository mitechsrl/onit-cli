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


module.exports.replace = function (obj, vars) {
    const stringReplace = function (v) {
        while (true) {
            let found = false;
            Object.keys(vars).forEach(variable => {
                const _v = v.replace(variable, vars[variable]);
                found = found || _v !== v;
                v = _v;
            });
            if (!found) break;
        }
        return v;
    };

    const _replace = function (obj) {
        if (Array.isArray(obj)) obj.forEach(o => _replace(o));

        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(k => {
                if (typeof obj[k] === 'string') {
                    obj[k] = stringReplace(obj[k]);
                    return;
                }

                _replace(obj[k]);
            });
        }
    };

    _replace(obj);
    return obj;
}