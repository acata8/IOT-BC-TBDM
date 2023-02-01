const { Kafka } = require('kafkajs')
const driver = require('./Driver');
const server = require('../Index');
const config = require('../config/dev');

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
    console.log('...starting Consumer');
    await consumer.connect();
	await consumer.subscribe({ topic, fromBeginning: false })
	await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            var parsedData = IotRowData.fromJson(message.value.toString())
            console.log(parsedData)
        },
    })
}

consume().catch((err) => { console.log("...error in consuming...")})

function IotRowData(unit, value, type, timestamp){
    this.unit_measure = unit,
    this.value = value,
    this.name = type, //Asset name
    this.timestamp = timestamp
}

IotRowData.fromJson = function (json){

    var PulledData = []

    var obj = JSON.parse(json);
    var arr = obj.m;

    arr.forEach(element => PulledData.push(new IotRowData(element.u, element.v, element.k, element.tz)));
    return PulledData;
};

module.exports = consume;




