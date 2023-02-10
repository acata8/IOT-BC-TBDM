const driver = require('bigchaindb-driver');
const config = require('config');
const http = require('./DriverHttpRequest');
const { IotRowData } = require('./Utils');


class BlockchainHandler {

    constructor(){
        this.connection = new driver.Connection(config.get("bigchaindb.httpApiPath"));
        this.publicKey = config.get("bigchaindb.userPublicKey");
        this.privateKey = config.get("bigchaindb.userPrivateKey");
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

        const txSigned = driver.Transaction.signTransaction(txCreate, this.privateKey)
        
        var postedTx = await this.connection.postTransactionCommit(txSigned)

        if(postedTx){
            console.log(`[CREATE TX] Transaction ${txSigned.id} transfered`);
            return txSigned.id;
        }else{
            console.log('>>> [CREATE TX] Invalid transaction')
        }
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

        var getTx = await this.connection.getTransaction(txCreatedID);

        if(getTx){

            const txTransfer = driver.Transaction.
            makeTransferTransaction(
                [{
                    tx: getTx,
                    output_index: 0
                }],
                [driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(this.publicKey))],
                metadata
            )

            const txSigned = driver.Transaction
                .signTransaction(txTransfer, this.privateKey);

            var postedTx = await this.connection.postTransactionCommit(txSigned)

            if(postedTx){
                console.log(`[TRANSFER TX] Transaction ${txSigned.id} transfered`);
                return txSigned.id;
            }else{
                console.log('>>> [TRANSFER TX] Invalid transaction')
            }
        }else{
            console.log('>>> [BIGCHAINDB] Cannot get current transaction ')
        }
    }

    /**
     * Assess whether to CREATE the asset or TRANSFER to update the metadata
     * @param {IotRowData} iotMessage - object to post inside server
     */
    async createOrTransferAsset(iotMessage){
        
        try{

        
            var Assets = await this.connection.searchAssets(iotMessage.type);
            if(Assets){

                if(Assets.length == 0)
                {
                    console.log("[CREATE TX] Action pending");

                    var createdTx = await this.createAsset(iotMessage.type, iotMessage.um, iotMessage.value, iotMessage.timestamp);

                    if(createdTx){
                        return createdTx;
                    }else{
                        console.error(">>> [CREATE TX]", err)
                    }

                }
                else if(Assets.length > 0)
                {
                    console.log("[TRANSFER TX] Action pending");

                    var LastTx = await http.GetLastAssetTransaction(iotMessage.type);

                    if(LastTx){
                        var lastTxId = LastTx.pop().id;

                        var updatedTx = await this.updateAsset(lastTxId, iotMessage.value, iotMessage.timestamp, iotMessage.um);

                        if(updatedTx){
                            return updatedTx;
                        }else{ 
                            console.error(">>> [TRANSFER TX]", err)
                        };

                    }else{
                        console.error(">>> [RETRIEVE TX]", err);
                    }
                }else{
                    console.error(">>> [BIGCHAINDB] No result ", err);
                }
            } else{
                console.error(">>> [BIGCHAINDB]", err);
            }
        } catch (error) {
            console.error(">>> Connection to BIGCHAIN is not estabilished... Trying to connect...", );
        }
    }
};


module.exports = {
    BlockchainHandler
}