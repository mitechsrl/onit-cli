/* eslint-disable quote-props */

module.exports = {

    // gitignore-style paths(or files) to be skipped. These files are not processed and they are not added to the
    // final markdown code
    ignore: [
        './extras/**/*',
    ],

    chapters: [
        {
            chapter: 'HOME',
            title: 'Home',
            children: [
                { chapter: 'GETTING_STARTED', title: 'Getting started' }
            ]
        }
    ]
};
