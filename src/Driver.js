const driver = require('bigchaindb-driver');
const config = require('../config/dev');
const http = require('./DriverHttpRequest');
const { IotRowData } = require('./Utils');


class BlockchainHandler {

    constructor(){
        this.connection = new driver.Connection(config.bigchaindb.httpApiPath);
        this.publicKey = config.bigchaindb.userPublicKey;
        this.privateKey = config.bigchaindb.userPrivateKey
    }

    /**
     * Create a new asset inside server
     * @param {string} type Iot device type
     * @param {*} um unit meauser
     * @param {*} value current value
     * @param {*} timestamp current datetime
     * @returns posted transaction
     */
    async createAsset(type, um, value, timestamp) {
    
        if(!value)
            return;

        const assetdata = {
            iot_device : type
        }

        const metadata = {
            timestamp: !timestamp ? Date.UTC.now() : timestamp,
            value: value,
            unit_measure: !um ? 'ND' : um
        }

        const txCreate = driver.Transaction.makeCreateTransaction(
            assetdata, metadata,
            [driver.Transaction.makeOutput(
                driver.Transaction.makeEd25519Condition(this.publicKey))],
            this.publicKey
        )

        const txSigned =  driver.Transaction.signTransaction(txCreate, this.privateKey)
        
        this.connection.postTransactionCommit(txSigned)
        .then(res => {
            console.log(`[CREATE TX] Transaction ${txSigned.id} added`);
    })  .catch((err) => {console.log('>>> [TRANSFER TX] Invalid commit transaction')})
    };

    /**
     * Update the asset using a TRANSFER transaction
     * @param {*} txCreatedID - The transaction id to chain with the next (CreateTransaction or TransferTransaction)
     * @param {string} type - The action performed on the asset 
     * @returns Return the posted transaction
     */
    async updateAsset(txCreatedID, value, timestamp, um) {

        if(!value)
            return;

        const metadata = {
            timestamp: !timestamp ? Date.UTC.now() : timestamp,
            value: value,
            unit_measure: !um ? 'ND' : um
        }

        this.connection.getTransaction(txCreatedID)
        .then((txCreated) => {
            const txTransfer = driver.Transaction.
            makeTransferTransaction(
                [{
                    tx: txCreated,
                    output_index: 0
                }],
                [driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(this.publicKey))],
                metadata
            )

            const txSigned = driver.Transaction
                .signTransaction(txTransfer, this.privateKey);

            this.connection.postTransactionCommit(txSigned)
            .then((res) => {  console.log(`[TRANSFER TX] Transaction ${txSigned.id} transfered`);})
            .catch((err) => {console.log('>>> [TRANSFER TX] Invalid commit transaction')})
        }).catch((err) => {
            console.log('>>> [TRANSFER TX] Cannot retrieve transaction')
        })
    }

    /**
     * Assess whether to CREATE the asset or TRANSFER to update the metadata
     * @param {IotRowData} iotMessage - object to post inside server
     */
    async createOrTransferAsset(iotMessage){
        this.connection.searchAssets(iotMessage.type)
        .then((result) => {
            if(result.length == 0)
            {
                console.log("[CREATE TX] Action pending");
                this.createAsset(iotMessage.type, iotMessage.unit, iotMessage.value, iotMessage.timestamp)
                .catch((err) => { console.error(">>> [CREATE TX]", err)});
            }
            else if(result.length > 0)
            {
                console.log("[TRANSFER TX] Action pending");

                http.GetLastAssetTransaction(iotMessage.type)
                .then((res) => {
                    var lastTxId = res.pop().id;
    
                    this.updateAsset(lastTxId, iotMessage.value, iotMessage.timestamp, iotMessage.um)
                        .catch((err) => { console.error(">>> [TRANSFER TX]", err)});
                    
                }).catch((err) => {  console.error(">>> [RETRIEVE TX]", err)});
            }
        }).catch((err) => { console.error(">>> [BIGCHAINDB]", err)})
    }
};


module.exports = {
    BlockchainHandler
}