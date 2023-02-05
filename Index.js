
const consume = require('./src/Consumer')

consume().catch((err) => {  console.log(">>> [CREATE TX]", err);})

