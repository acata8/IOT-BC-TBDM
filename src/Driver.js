const driver = require('bigchaindb-driver');
const config = require('../config/dev');

const API_PATH = `http://${config.bigchaindb.apiPath}`;


class IotDevice {

    constructor(){
        this.connection = new driver.Connection(API_PATH);
    }



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
    
        const assetdata = {
            iot_device : type
        }

        const metadata = {
            timestamp: dt,
            value: value,
            unit_measure: !um ? 'ND' : um
        }
        
        const txCreate = driver.Transaction.makeCreateTransaction(
            assetdata, metadata,
            [driver.Transaction.makeOutput(
                driver.Transaction.makeEd25519Condition(publicKey))],
            publicKey
        )

        const txSigned =  driver.Transaction.signTransaction(txCreate, privateKey)
        
        this.connection.postTransactionCommit(txSigned)
        .then(res => {
            console.log(txSigned.id)
        })
    };

    /**
     * Update the asset using a TRANSFER transaction
     * 
     * @param {*} txCreatedID - The transaction id to chain with the next (CreateTransaction or TransferTransaction)
     * @param {string} type - The action performed on the asset (e.g. processed with preservative).
     * @param {string} publicKey user public key
     * @param {string} privateKey user private key
     * @returns Return the posted transaction
     */
    updateAsset(txCreatedID, value, dt, um, publicKey, privateKey) {

        const metadata = {
            timestamp: dt,
            value: value,
            unit_measure: !um ? 'ND' : um
        }

        this.connection.getTransaction(txCreatedID)
        .then((txCreated) => {

            console.log(txCreated)

            const createTranfer = driver.Transaction.
            makeTransferTransaction(
                // The output index 0 is the one that is being spent
                [{
                    tx: txCreated,
                    output_index: 0
                }],
                [driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(
                        publicKey))],
                metadata
            )
            // Sign with the key of the owner of the painting (Alice)
            const signedTransfer = driver.Transaction
                .signTransaction(createTranfer, privateKey)
            this.connection.postTransactionCommit(signedTransfer)
            .then((res) => { console.log('Transaction posted')})
        })
    }
};

module.exports = {
    IotDevice,
    API_PATH
}