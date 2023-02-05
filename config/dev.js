const config = {};

config.ubuntu = {};
config.kafka = {};
config.bigchaindb = {};

config.ubuntu.host = "192.168.1.116";

config.kafka.clientId = "test-consumer-group";
config.kafka.topic = "Topic1";

config.bigchaindb.apiPath= "192.168.1.130:9984/api/v1/";
config.bigchaindb.httpApiPath= "http://192.168.1.130:9984/api/v1/";
config.bigchaindb.userPublicKey = '8sVFshXJ8ZM9iKtN94sdrXqpoFW3SVsH3Zg5HeEsgtMX'
config.bigchaindb.userPrivateKey = 'H5u66H6rn2V4RdQocABGmQH7NHMXZSBAe47DcqHjuRhY'


module.exports = config;