# IoT#BC

**The aim of the project is to define a prototype tool to store IoT data on a blockchain database based on  [BlockchainDB](https://www.bigchaindb.com/).** 

**In order to guarantee scalability and performance, the tool must also consider an additional message broker component based on [Apache Kafka](https://kafka.apache.org/) for reading  [IoT messages](https://github.com/massimocallisto/iot-simulator).**

The developed project takes charge of the goal of receiving a series of data in real-time from Apache Kafka and store them.
To develop the services to receive and send data to Apache Kafka has been used the [KafkaJs](https://github.com/tulios/kafkajs) library.
The [js-bigchaindb-driver](https://github.com/bigchaindb/js-bigchaindb-driver) was used to store blocks in Bigchain.

The main idea was to use a basic user who is responsible for owning every asset that is created.
This is because the project does not require the transfer of assets between two or more proprietary users but only the storage of data and keep track of changes in the value of the data of an asset.
For demonstration purposes public and private user keys are stored in the configuration file.

The green part is the previous part that connects to the prototype. It was not developed in the current project.
![Project schema](https://github.com/acata8/IOT-BC-TBDM/blob/main/utils/img/ProfSchema.jpg)
## Configuration

In the [default.json](https://github.com/acata8/IOT-BC-TBDM/blob/main/config/default.json)  configuration file you can set different parameters in order to activate the prototype in a configurable way.

## Usage
### Run
The fastes way to run the simulator is to use Docker.
  ```bash
    docker-compose up 
  ```
### Stop
To stop the simulator using docker
  ```bash
    docker-compose down
  ```
  
## Authors

* **Andrea Cataluffi** - [acata8](https://github.com/acata8)
* **Paolo Campanelli** - [PaoloCampanelli](https://github.com/PaoloCampanelli)
