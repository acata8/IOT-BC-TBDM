
const axios = require('axios');
const config = require('../config/dev');

/**
 * Search all assets that match a given text search. 
 * @param {String} assetName asset name from which to retrieve the last transaction
 * @returns all assets that match conditions.
 */
function GetAsset(assetName) {
    return new Promise((resolve, reject) => {

        var path = `${config.bigchaindb.httpApiPath}assets?search=${assetName}`;
        axios.get(path)
        .then(res => {
            resolve(res.data);
        }).catch(err => {
            reject('>>> [HTTP REQ]',err);
        });
    })
}

/**
 * Get last asset transaction, every transaction involving the asset (CREATE or TRANSFER)
 * @param {String} assetName asset name from which to retrieve the last transaction
 * @returns {String} transaction
 */
function GetLastAssetTransaction(assetName) {
    return new Promise((resolve, reject) => {
        
        GetAsset(assetName).then((res) => { 
            var path = `${config.bigchaindb.httpApiPath}transactions?asset_id=${res.pop().id}&last_tx=true`;
            axios.get(path)
            .then(res => {
                resolve(res.data);
            }).catch(err => {
                reject('>>> [HTTP REQ]',err);
            });
        }).catch(err => {
            reject('>>> [HTTP REQ]',err);
        })
    }).catch(err => {
        reject('>>> [HTTP REQ]',err);
    });
}

module.exports = {
    GetAsset,
    GetLastAssetTransaction
}