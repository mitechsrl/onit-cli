['-exit'].forEach(c => {
    process.argv.forEach((p,index)=> {
        if (p === c ) process.argv[index] = '-'+process.argv[index];
    });
});

export function getParams(){
    return process.argv
} 