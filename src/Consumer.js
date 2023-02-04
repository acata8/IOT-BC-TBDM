const { Kafka } = require('kafkajs')
const driver = require('./Driver'); 
const config = require('../config/dev');
const env = require('dotenv')
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
class IotRowData {
    constructor(type, um , value, timestamp){
        this.type = type,
        this.um = um,
        this.value = value,
        this.timestamp = timestamp
    }
}

class OwnerBlock {
    constructor(publicKey, privateKey){
        this.publicKey = publicKey,
        this.privateKey = privateKey
    }
}

const consume = async () => {
    var currentUser = new OwnerBlock(process.env.USER_PUBLIC_KEY, process,env.USER_PRIVATE_KEY)
    await consumer.connect();
	await consumer.subscribe({ topic, fromBeginning: false })
	await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            var arrIotRowData = new fromJson(message.value.toString())
            
            arrIotRowData.forEach(
             dt => {
                 var iotDevice = new driver.IotDevice();
                 iotDevice.connection.searchAssets(dt.type).then((result) => {
                     if(result.length == 0)
                     {
                         console.log("CREATE asset..");
                         
                         iotDevice.createAsset(dt.type, dt.unit, dt.value, dt.timestamp, currentUser.publicKey, currentUser.privateKey)
                         .then((txPosted) => {
                             console.log(`${txPosted.id} successfully created`)
                         });
                     }
                     else if(result.length > 0)
                     {
                         console.log("TRANSFER asset..");
                         driver.connection.listTransactions(result[0].id, TransactionOperations.TRANSFER)
                         .then((transferTx) => {
                             var lastSignedTx = transferTx.pop();
                             iotDevice.updateAsset(lastSignedTx, dt.value, dt.timestamp, currentUser.publicKey, currentUser.privateKey);
                         });
                     }else{
                         console.log("...Something wrong happened...");
                     }
                 })
             })
        },
    })
}

consume().catch((err) => { console.log("...error in consuming...")})

/**
* Convert generic json object to IotRowData object
* @param {Json} jsonObject JsonObject retrieved from each consume row
* @returns Array of IotRowData 
*/
function fromJson(jsonObject){

    var PulledData = []
 
    var obj = JSON.parse(jsonObject);
    var arr = obj.m;
 
    arr.forEach(element => PulledData.push(new IotRowData(element.u, element.v, element.k, element.tz)));
    return PulledData;
 };

