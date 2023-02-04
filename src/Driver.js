const driver = require('bigchaindb-driver');

const config = require('../config/dev');
const host = config.ubuntu.host;

const API_PATH = `${host}:9984/api/v1/`;

class IotDevice {

    constructor() {
        // Initialise a new connection.
        this.connection = new driver.Connection(API_PATH);
    }
    
    /**
     * Method used to create a new asset inside BigchainDB
     * @param {string} type Iot device type
     * @param {string} um unit meauser
     * @param {number} value current value
     * @param {date} dt current datetime
     * @param {string} publicKey user public key
     * @param {string} privateKey user private key
     * @returns posted transaction
     */
    createAsset(type, um, value, dt, publicKey, privateKey) {
    
        return new Promise((resolve, reject) => {
    
            const Assetdata = {
                "type": type,
                "unit_measure": um
            } 
            
            const Metadata = {
                "value": value,
                "timestamp": dt
            } 

            const createTx = driver.Transaction.makeCreateTransaction(
                assetData,
                metaData,
                [driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(publicKey))],
                publicKey
            );
    
            const signedTransaction = driver.Transaction.signTransaction(createTx, privateKey);

            this.connection.postTransactionCommit(signedTransaction).then(postedTransaction => {
                resolve(postedTransaction);
            }).catch(err => {
                reject(new Error(err));
            })
        });
    };

    /**
     * Update the asset using a TRANSFER transaction
     * 
     * @param {*} transaction - The transaction to chain with the next (CreateTransaction or TransferTransaction)
     * @param {string} type - The action performed on the asset (e.g. processed with preservative).
     * @param {string} publicKey user public key
     * @param {string} privateKey user private key
     * @returns Return the posted transaction
     */
    updateAsset(transaction, value, dt, publicKey, privateKey) {

        return new Promise((resolve, reject) => {

            const Metadata = {
                "value": value,
                "timestamp": dt
            } 

            const updateAssetTransaction = driver.Transaction.makeTransferTransaction(
                [{ tx: transaction, output_index: 0 }],
                [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(publicKey))],
                Metadata
            )

            const signedTransaction = driver.Transaction.signTransaction(updateAssetTransaction, privateKey);

            console.log("Posting transaction.");
            this.connection.postTransactionCommit(signedTransaction).then(postedTransaction => {
                resolve(postedTransaction);

            }).catch(err => {
                reject(err);
            });
        });
    }
};

module.exports = {
    IotDevice
}