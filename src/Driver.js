const driver = require('bigchaindb-driver');
const config = require('../config/dev');

const API_PATH = `http://${config.bigchaindb.apiPath}`;

const connection = new driver.Connection(API_PATH);

class IotDevice {

    /**
     * Method used to create a new asset inside BigchainDB
     * @param {string} type Iot device type
     * @param {*} um unit meauser
     * @param {*} value current value
     * @param {*} dt current datetime
     * @param {string} publicKey user public key
     * @param {string} privateKey user private key
     * @returns posted transaction
     */
    createAsset(type, um, value, dt, publicKey, privateKey) {
    
        return new Promise((resolve, reject) => {
            
            const assetdata = {
                'iot_device': {
                    'type': type
                }
            }
            
            if(!um)
                um = 'ND'

            const metadata = {
                'value': value,
                'timestamp': dt,
                'unit_measure': um
            }

            console.log(metadata)

            const createTx = driver.Transaction.makeCreateTransaction(
                assetdata, metadata
                [ driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(publicKey))
                ],
                publicKey
            );

            const signedTx =  driver.Transaction.signTransaction(createTx, privateKey)
            
            connection.postTransactionCommit(signedTx).then(res => {
                console.log("res: "+signedTx.id);
               
                resolve(res);
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
    updateAsset(transaction, value, dt, um, publicKey, privateKey) {

        return new Promise((resolve, reject) => {

            if(!um)
                um = 'ND'

            const Metadata = {
                'value': value,
                'timestamp': dt,
                'unit_measure': um
            } 

            const updateAssetTransaction = driver.Transaction.makeTransferTransaction(
                [{ tx: transaction, output_index: 0 }],
                [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(publicKey))],
                Metadata
            )

            const signedTransaction = driver.Transaction.signTransaction(updateAssetTransaction, privateKey);
            
            connection.postTransactionCommit(signedTransaction).then(postedTransaction => {
                console.log("Transaction posted...");
                resolve(postedTransaction);
            }).catch(err => {
                reject(err);
            });
        });
    }
};

module.exports = {
    IotDevice,
    API_PATH
}