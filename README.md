# IoT-BC

**The objective of the project is to define a prototype tool to store IoT data on a blockchain database based on BlockchainDB [https://www.bigchaindb.com/](https://www.bigchaindb.com/).**
**In order to guarantee scalability and performance, the tool must also consider an additional message broker component based on Apache Kafka [https://kafka.apache.org/](https://kafka.apache.org/) for reading IoT messages.**
![alt text](https://github.com/acata8/IOT-BC-TBDM/blob/main/ProfSchema.jpg)


# Prerequisites

StackEdit stores your files in your browser, which means all your files are automatically saved locally and are accessible **offline!**

## Installation

The file explorer is accessible using the button in left corner of the navigation bar. You can create a new file by clicking the **New file** button in the file explorer. You can also create folders by clicking the **New folder** button.


## Usage
* Download and activate Mosquitto to running services
* Start mqtt data simulator
  ```bash
  java -jar simulator.jar safe_Simulator.json
  ```
  (make sure that you are in the simulator folder)
* Launch Confluent from any directory with the underneath command:
  ```bash
  confluent local services start
  ```
* Navigate to the Control Center web interface at http://localhost:9021/ and select your cluster
  <br><br>
  <img src="images/confluent-clusters.png" width="400" height="500">
  <br><br>
* Create the topics you need
* Install source and sink connectors you need with the command
  ```bash
  confluent-hub install confluentinc/kafka-connect-mqtt:latest
  ```
## Authors

* **Andrea Cataluffi** - [acata8](https://github.com/acata8)
* **Paolo Campanelli** - [PaoloCampanelli](https://github.com/PaoloCampanelli)
