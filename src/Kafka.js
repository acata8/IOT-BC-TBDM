const { Kafka, logLevel } = require('kafkajs')
const driver = require('./Driver'); 
const utils = require('./Utils'); 
const config = require('config');


const host = config.get('ubuntu.host');
const brokerport = config.get('ubuntu.brokerport');
const clientId = config.get("kafka.clientId");
const brokers = [`${host}:${brokerport}`];
const topics =  config.get("kafka.topics");
const ACKTopic =  config.get("kafka.ACKTopic");

const kafka = new Kafka({  
    logLevel: logLevel.WARN, 
    brokers: brokers,
    clientId: clientId
})

const consumer = kafka.consumer({ 
    groupId: clientId,
})

const producer = kafka.producer()

const consume = async () => {
    console.log("[APACHE KAFKA] Consumer started");
    let BCHandler = new driver.BlockchainHandler();
    await producer.connect()
    topics.forEach(
        async topic =>  {
            console.log(`[CONSUMER] Topic ${topic}`)
            await consumer.connect();
            await consumer.subscribe({ topic, fromBeginning: false })
            await consumer.run({
                eachMessage: async ({ message }) => {
                    var arrIotRowData = new utils.fromJson(message.value.toString())
                    try {
                        console.log('[CONSUMER] Message incoming')
                        arrIotRowData.forEach(
                            async iotMessage =>  {
                                var BCAction = await BCHandler.createOrTransferAsset(iotMessage);

                                if(BCAction)
                                    await sendMessage(BCAction, iotMessage.type, iotMessage.um, iotMessage.value, iotMessage.timestamp)

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
    )
}

const sendMessage = (txId, asset, um, value, ts) => {

    var message = `[${new Date().toISOString()}] >>> [Asset: ${asset}, Value: ${value}, Unit measure: ${um}, Timestamp: ${ts}], [TX ID: ${txId}].`

    return producer
      .send({
        topic: ACKTopic,
        messages: Array(createMessage(txId,message))
      })
      .then(
        console.log(`PRODUCER SEND ${message} TO ${ACKTopic}`)
      )
      .catch(e => console.error(`[PRODUCER]`, e))
  }
  
  
  const createMessage = (txid, message) => ({
    key: `${txid}`,
    value: `${message}`,
  })


module.exports = consume;

