
const consume = require('./src/Consumer')

consume().catch((err) => { console.error("...Error in consuming...", err)})

