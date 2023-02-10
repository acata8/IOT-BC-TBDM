
const consume = require('./src/Kafka')

consume().catch((err) => {  console.log(">>> [STARTING KAFKA]", err);})

