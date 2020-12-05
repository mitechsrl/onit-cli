
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