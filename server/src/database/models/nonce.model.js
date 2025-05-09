const {Schema} = require('mongoose');

module.exports = (connection) => {

    const NonceSchema = new Schema({
        lastNonce: {type: Number, default: 0},
        lastUpdate: {type:Number, default: Date.now()},
      
    })

    return connection.model('Nonce', NonceSchema);
}