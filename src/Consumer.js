const { Kafka } = require('kafkajs')
const env = require('dotenv')
const driver = require('./Driver'); 
const config = require('../config/dev');
const utils = require('./Utils'); 
const http = require('./DriverHttpRequest')

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
    var currentUser = new utils.OwnerBlock(config.bigchaindb.userPublicKey, config.bigchaindb.userPrivateKey)
    console.log("...Starting consumer...");

    await consumer.connect();
	await consumer.subscribe({ topic, fromBeginning: false })
	await consumer.run({
        eachMessage: async ({ message }) => {
            var arrIotRowData = new utils.fromJson(message.value.toString())
            
            var iotDevice = new driver.IotDevice();
          
            arrIotRowData.forEach(
             dt => {
                
                http.GetAsset(dt.type).then(async (result) => {

                    if(result.length == 0)
                    {
                        console.log("CREATE asset..");
                        iotDevice.createAsset(dt.type, dt.unit, dt.value, dt.timestamp, currentUser.publicKey, currentUser.privateKey)
                        .catch((err) => { console.error("...Error in CREATE asset...", err)});
                    }
                    else if(result.length > 0)
                    {
                        console.log("TRANSFER asset..");

                        http.GetAsset(dt.type)
                        .then((res) => {
                            var lastTx = res.pop().id;
                            iotDevice.updateAsset(lastTx, dt.value, dt.timestamp, dt.um, currentUser.publicKey, currentUser.privateKey);
                            
                        }).catch((err) => {  console.error("...Error in GET LAST TRANSFER TX asset...", err)});
                    }else{
                        console.log("...Something wrong happened...");
                    }
                }).catch((err) => { console.error("...Error in Bigchaindb...", err)})
            })
        },
    })
}

module.exports = consume;

