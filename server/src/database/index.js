const { db1, db2 } = require('./connections.js');
const createUserModel = require('./models/user.model.js');
const createNonceModel = require('./models/nonce.model.js');

const createNonce = createNonceModel(db1)
const User = createUserModel(db2)


const getNonce = async() => {
    const nonce = await createNonce.findOne({}).catch((error) => {
        //console.error('Error creating user:', error.message);
        return null; // or handle the error as needed
    })
    return nonce
}

const updateNonce = async(nonce) => {
    const updatedNonce = await createNonce.findOneAndUpdate({}, { lastNonce: nonce, lastUpdate: Date.now() }, { new: true }).catch((error) => {
        //console.error('Error creating user:', error.message);
        return null; // or handle the error as needed
    })
    return updatedNonce
}

const getAllUsers = async()=>{
    return await User.find({})
}

const createNewUser = async(user) => {
    user.wallet = user.wallet.toLowerCase()
    const newUser = await new User(user).save().catch((error) => {
        //console.error('Error creating user:', error.message);
        return null; // or handle the error as needed
    })

    return newUser;
}

const deleteUser = async(wallet) => {
    return await User.findOneAndDelete({ wallet: wallet.toLowerCase() })
}

const getUserByWallet = async(wallet) => {
    return await User.findOne({ wallet: wallet.toLowerCase() })
}

const updateUser = async(wallet, data) => {
    return await User.findOneAndUpdate({ wallet: wallet.toLowerCase() }, data, { new: true })
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