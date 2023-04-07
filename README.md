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

[BIGCHAINDB EXPORT NODES](https://drive.google.com/drive/u/1/folders/1DXq_tf4nXs5l0d1VF6MZjqfCYlu4SEzp)

# Prototype
## Configuration

In the [default.json](https://github.com/acata8/IOT-BC-TBDM/blob/main/config/default.json)  configuration file you can set different parameters in order to activate the prototype in a configurable way.

A properly formatted example for expected format to be consumed
```
{
  "m": [
    {
      "t": "nowTimestamp()",
      "tz": "now()",
      "k": "device_temperature",
      "v": "double(0, 40)",
      "u": "C"
    }
}
```


## Prototype Usage
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
  
  
# BigChainDB Configuration

## Deploy a machine for your node

It might be a virtual machine (VM) or a real machine.
The following instructions assume all the nodes in the network (including yours) have public IP addresses.
**Use Ubuntu 18.04 or Ubuntu server 18.04 as OS**.

In our configuration we will not setup our nodes in order to handle an HTTPS connection, so we won't consider NGINX.

### Set up the machine

#### Update system
SSH into your machine and updata all its OS-level packages
  ```bash
  sudo apt update
  sudo apt full-upgrade
  ```

#### Update firewall settings

  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 9984/tcp
  sudo ufw allow 9985/tcp
  sudo ufw allow 46656/tcp
  sudo ufw enable
  ```

### Setup the BigchainDB Node

#### Install BigchainDB Server
BigchainDB Server requires Python 3.6+, make sure your system has it. Install the required packages:
  ```bash
  sudo apt install -y python3-pip libssl-dev
  ```

BigchainDB Server requires **gevent**, and to install gevent, you must use pip 19 or later (as of 2019, because gevent now uses manylinux2010 wheels). Upgrade pip to the latest version:
  
  ```bash
  sudo pip3 install -U pip
  ```

Now install the latest version of BigchainDB Server

  ```bash
  sudo pip3 install bigchaindb==2.2.2
  ```
  
Check that you installed the correct version of BigchainDB Server using ```bigchaindb --version```.
 
### Configure BigchainDB Server

Run

  ```bash
  bigchaindb configure
  ```
  The first question is API Server bind? (default `localhost:9984`).

<ul>
  <li>
    If you’re not using NGINX, to expose the API to the public, bind the API Server to 0.0.0.0:9984. 
  </li>
  <li>
    If you’re using NGINX (e.g. if you want HTTPS), then accept the default value (localhost:9984).
  </li>
</ul>

### Install and run MongoDB
  
  Install a recent version of MongoDB. BigchainDB Server requires version 3.4 or newer.
  ```bash
  sudo apt install mongodb
   ```
   
### Install Tendermint
The version of BigchainDB Server described in these docs only works well with Tendermint 0.31.5 (not a higher version number). Install that:

```bash
sudo apt install -y unzip
wget https://github.com/tendermint/tendermint/releases/download/v0.31.5/tendermint_v0.31.5_linux_amd64.zip
unzip tendermint_v0.31.5_linux_amd64.zip
rm tendermint_v0.31.5_linux_amd64.zip
sudo mv tendermint /usr/local/bin
```

### Start Configuring Tendermint
You won’t be able to finish configuring Tendermint until you have some information from the other nodes in the network, but you can start by doing:

```
tendermint init
```

A BigchainDD Node is identified by:

- hostname, i.e. the node’s *DNS subdomain*, such as bnode.example.com, or its *IP* *address*, such as 46.145.17.32
- Tendermint *pub_key.value*
- Tendermint *node_id*

The Tendermint *pub_key.value* is stored in the file ```$HOME/.tendermint/config/priv_validator.json```. That file should look like:
```bash
{
  "address": "E22D4340E5A92E4A9AD7C62DA62888929B3921E9",
  "pub_key": {
    "type": "tendermint/PubKeyEd25519",
    "value": "P+aweH73Hii8RyCmNWbwPsa9o4inq3I+0fSfprVkZa0="
  },
  "last_height": "0",
  "last_round": "0",
  "last_step": 0,
  "priv_key": {
    "type": "tendermint/PrivKeyEd25519",
    "value": "AHBiZXdZhkVZoPUAiMzClxhl0VvUp7Xl3YT6GvCc93A/5rB4fvceKLxHIKY1ZvA+xr2jiKercj7R9J+mtWRlrQ=="
  }
}
```

To get your Tendermint node_id, run the command:
```
tendermint show_node_id
```

**Share your hostname, pub_key.value and node_id with all other Members.**

## How to setup a BigchainDB Network

A BigchainDB Network is a set of 4 or more BigchainDB Nodes.
Every Node is independently managed by a Member, and runs an instance of the BigchainDB Server software. 
At the Genesis of a Network, there MUST be at least 4 Nodes ready to connect. After the Genesis, a Network can dynamically add new Nodes or remove old Nodes.

A Network will stop working if more than one third of the Nodes are down. The bigger a Network, the more failures it can handle. A Network of size 4 can tolerate only 1 failure, so if 3 out of 4 Nodes are online, everything will work as expected. Eventually, the Node that was offline will automatically sync with the others.

All the nodes needs to be in the same network, for example:
- all Nodes running in the cloud using public IPs
- all Nodes running in a private network

From now, we are going to handle 4 nodes, so u have to implement at least 4 nodes.

You can setup or connect to a network once you have a single node running.
Now the node operators, also called Members, must share some information with each other, so they can form a network.
There is one special Member who helps coordinate everyone: the Coordinator. (a Coordinator is also a Member)

The configurations that have been described in the previous paragraph must be considered valid for each member.

### Coordinator

#### Initialize the Network
At this point the Coordinator should has received the data from all the Members, and should combine them in the ```.tendermint/config/genesis.json``` file:

```bash
{
   "genesis_time":"0001-01-01T00:00:00Z",
   "chain_id":"test-chain-la6HSr",
   "consensus_params":{
      "block_size_params":{
         "max_bytes":"22020096",
         "max_txs":"10000",
         "max_gas":"-1"
      },
      "tx_size_params":{
         "max_bytes":"10240",
         "max_gas":"-1"
      },
      "block_gossip_params":{
         "block_part_size_bytes":"65536"
      },
      "evidence_params":{
         "max_age":"100000"
      }
   },
   "validators":[
      {
         "pub_key":{
            "type":"tendermint/PubKeyEd25519",
            "value":"<Member 1 public key>"
         },
         "power": "10",
         "name":"<Member 1 name>"
      },
      {
         "...":{"..."},
      },
      {
         "pub_key":{
            "type":"tendermint/PubKeyEd25519",
            "value":"<Member N public key>"
         },
         "power":"10",
         "name":"<Member N name>"
      }
   ],
   "app_hash":""
}
```

The above consensus_params in the genesis.json are default values.

The new genesis.json file contains the data that describes the Network.
The key name is the *Member’s moniker*; it can be any valid string, but put something human-readable like "First Node".

At this point, the Coordinator must share the new genesis.json file with all Members.


### Members

As we already says, each BigchainDB node is a member, also the Coordinator

#### Connect with other members

At this point the Member should have received the *genesis.json* file.

The Member must copy the *genesis.json* file into their local ```$HOME/.tendermint/config``` directory. Every Member now shares the same *chain_id* and *genesis_time* (used to identify the Network), and the same list of validators.

Each Member must edit their ```$HOME/.tendermint/config/config.toml``` file and make the following changes:
```
moniker = "Name of our node"
create_empty_blocks = false
log_level = "main:info,state:info,*:error"

persistent_peers = "<Member 1 node id>@<Member 1 hostname>:26656,\
<Member 2 node id>@<Member 2 hostname>:26656,\
<Member N node id>@<Member N hostname>:26656,"

send_rate = 102400000
recv_rate = 102400000

recheck = false
```

Note: The list of persistent_peers doesn’t have to include all nodes in the network.

#### Check MongoDB status

You can check using 
```
systemctl status mongodb.
```
If you installed MongoDB using sudo apt install mongodb, then a MongoDB startup script should already be installed (so MongoDB will start automatically when the machine is restarted). Otherwise, you should install a startup script for MongoDB.
In our case mongodb should already be running in the background.

### Start BigchainDB and Tendermint using MONIT
We use Monit, a small open-source utility for managing and monitoring Unix processes.
BigchainDB and Tendermint are managed together, because if BigchainDB is stopped (or crashes) and is restarted, Tendermint won’t try reconnecting to it. (That’s not a bug. It’s just how Tendermint works.)


#### Install Monit and run script
```
sudo apt install monit
```

Run the script to build a configuration file for Monit.
```
bigchaindb-monit-config
```
Run Monit as a daemon, instructing it to wake up every second to check on processes:
```
monit -d 1
```

## How Others Can Access Your Node
If you followed the above instructions, then your node should be publicly-accessible with BigchainDB Root URL http://hostname:9984.
That is, anyone can interact with your node using the BigchainDB HTTP API exposed at that address or you can use one of the BigchainDB Drivers.

## Useful Troubleshooting 

This is a list of used techniques that we used in order to thoubleshoot our system.

- pip install --upgrade gevent
- monit restart tendermint
- monit reload
- bigchaindb start & disown

Also, we suggest to check tendermint log inside ```.bigchaindb-monit/logs/```

## Authors

* **Andrea Cataluffi** - [acata8](https://github.com/acata8)
* **Paolo Campanelli** - [PaoloCampanelli](https://github.com/PaoloCampanelli)
