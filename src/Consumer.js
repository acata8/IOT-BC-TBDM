const { Kafka } = require('kafkajs')
const driver = require('./Driver'); 
const config = require('../config/dev');
const utils = require('./Utils'); 

const host = config.ubuntu.host;
const clientId = config.kafka.clientId;
const brokers = [`${host}:9092`];
const topic =  config.kafka.topic;

const kafka = new Kafka({   
    brokers: brokers,
    clientId: clientId
})

const consumer = kafka.consumer({ 
    groupId: clientId,
})

const consume = async () => {
    console.log("[APACHE KAFKA] Consumer started");
    let BCHandler = new driver.BlockchainHandler();
    await consumer.connect();
	await consumer.subscribe({ topic, fromBeginning: false })
	await consumer.run({
        eachMessage: async ({ message }) => {
            var arrIotRowData = new utils.fromJson(message.value.toString())
            try {
                console.log('[Consumer] Message incoming')
                arrIotRowData.forEach(
                    iotMessage =>  {
                        BCHandler.createOrTransferAsset(iotMessage);
                    }
                )
            } catch (e) {
                if (e instanceof TooManyRequestsError) {
                    consumer.pause([{ topic }])
                    setTimeout(() => consumer.resume([{ topic }]), e.retryAfter * 1000)
                }
                throw e
            }
           
        },
    })
}

module.exports = consume;

