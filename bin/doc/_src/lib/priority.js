module.exports.priorityConverter = (p) => {
    // this convert strings like "10.1" in a number to be easily sorted
    const value = p.split('.').reverse().map(v => Math.min(9990, parseInt(v)));
    return value.map((v, index) => (1 + v) * (index * 1000000 + 1)).reduce((a, n) => a + n, 0);
};
