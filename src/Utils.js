
class IotRowData {
    constructor(type, um , value, timestamp){
        this.type = type,
        this.um = um,
        this.value = value,
        this.timestamp = timestamp
    }
}

/**
* Convert generic json object to IotRowData object
* @param {Json} jsonObject JsonObject retrieved from each consume row
* @returns {Array} of IotRowData 
*/
function fromJson(jsonObject){

    var PulledData = [];
 
    var obj = JSON.parse(jsonObject);
    var arr = obj.m;
 
    arr.forEach(element => {
        if(element.v)
            PulledData.push(new IotRowData(element.k, element.u, element.v, element.tz));
    })

    return PulledData;
 };

 module.exports = {
    IotRowData,
    fromJson
 }