const {Schema} = require('mongoose');

module.exports = (connection) => {

    const UserSchema = new Schema({
        wallet: {type: String, required: true, unique: true},
        registered: {type:Boolean, default: false},
        invested: {type:String, default: "0"},
        invested_leader: {type:String, default: "0"},
        upTo: {type:String, default: "0"},
        lastUpdate: {type:Number, default: Date.now()},
        reclamados: {type:String, default: "0"},
        referer: {type:String, default: ""},
        up: {type:String, default: ""},
        left: {type:String, default: ""},
        lReclamados: {type:String, default: "0"},
        lExtra: {type:String, default: "0"},
        lPersonas: {type:String, default: "0"},
        lPuntos: {type:String, default: "0"},
        right: {type:String, default: ""},
        rReclamados: {type:String, default: "0"},
        rExtra: {type:String, default: "0"},
        rPersonas: {type:String, default: "0"},
        rPuntos: {type:String, default: "0"},
        idBlock: {type:Number, default: 0},
        puntosActivos: {type:String, default: "0"},
        hand: {type:Number, default: 0},
        retirableA: {type:Number, default: 0},
    })

    return connection.model('User', UserSchema);
}
