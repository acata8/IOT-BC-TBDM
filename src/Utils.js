
class IotRowData {
    constructor(type, um , value, timestamp){
        this.type = type,
        this.um = um,
        this.value = value,
        this.timestamp = timestamp
    }
}

class OwnerBlock {
    constructor(publicKey, privateKey){
        this.publicKey = publicKey,
        this.privateKey = privateKey
    }
}

/**
* Convert generic json object to IotRowData object
* @param {Json} jsonObject JsonObject retrieved from each consume row
* @returns Array of IotRowData 
*/
function fromJson(jsonObject){

    var PulledData = [];
 
    var obj = JSON.parse(jsonObject);
    var arr = obj.m;
 
    arr.forEach(element => PulledData.push(new IotRowData(element.k, element.u, element.v, element.tz)));
    return PulledData;
 };

 module.exports = {
    IotRowData,
    OwnerBlock,
    fromJson
 }