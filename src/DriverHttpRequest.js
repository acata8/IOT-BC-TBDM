
const axios = require('axios');
const driver = require('./Driver');

function GetAsset(assetName) {
    return new Promise((resolve, reject) => {

        var path = `${driver.API_PATH}/assets?search=${assetName}`;
        console.log(path)
        axios.get(path)
        .then(res => {
            resolve(res.data);
        }).catch(err => {
            console.error('>>> Error: ', err.message);
            reject();
        });
    })
}

function GetLastTransferTransaction(assetId) {
    return new Promise((resolve, reject) => {
        var path = `${driver.API_PATH}/transactions?asset_id=${assetId}?operation=TRANSFER&last_tx=true`;
       
        axios.get(path)
        .then(res => {
            resolve(res.data);
        }).catch(err => {
            console.error('>>> Error: ', err.message);
            reject();
        });
    })
}

module.exports = {
    GetAsset,
    GetLastTransferTransaction
}