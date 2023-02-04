
const axios = require('axios');
const driver = require('./Driver');

function GetAsset(assetName) {
    return new Promise((resolve, reject) => {

        var path = `${driver.API_PATH}assets?search=${assetName}`;
        // console.log(path)
        axios.get(path)
        .then(res => {
            resolve(res.data);
        }).catch(err => {
            reject(err.message);
        });
    })
}

module.exports = {
    GetAsset
}