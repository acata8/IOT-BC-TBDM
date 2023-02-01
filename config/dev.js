const config = {};

config.ubuntu = {};
config.kafka = {};

config.ubuntu.host = "192.168.1.116";

config.kafka.clientId = "test-consumer-group";
config.kafka.topic = "Topic1";

module.exports = config;