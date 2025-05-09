const { db1, db2 } = require('./connections.js');
const createUserModel = require('./models/user.model.js');
const createNonceModel = require('./models/nonce.model.js');

const Nonce = createNonceModel(db1)
const User = createUserModel(db2)


const getNonce = async() => {
    return await Nonce.findOne({})
}

const updateNonce = async(nonce) => {
    return await Nonce.findOneAndUpdate({}, { lastNonce: nonce, lastUpdate: Date.now() }, { new: true })
}

const getAllUsers = async()=>{
    return await User.find({}, { wallet: true, idBlock: true, lastUpdate: true, _id: false}).sort({ idBlock: -1, lastUpdate: -1 })
}

const createNewUser = async(user) => {
    return await new User(user).save();
}

const deleteUser = async(wallet) => {
    return await User.findOneAndDelete({ wallet })
}

const getUserByWallet = async(wallet) => {
    return await User.findOne({ wallet})
}

const updateUser = async(wallet, data) => {
    return await User.findOneAndUpdate({ wallet }, data, { new: true })
}

module.exports = {
    getNonce,
    updateNonce,
    getAllUsers,
    createNewUser,
    deleteUser,
    getUserByWallet,
    updateUser
}