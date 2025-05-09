const database = require('../database/index.js');

const getNonce = async() => {
    const nonce = await database.getNonce();
    if (!nonce) {
        // consultar en la blockchain el nonce y guardarlo en la base de datos
        // const nonce = await getNonceFromBlockchain()
        return 0;
    }
    return nonce;
}

const updateNonce = async(nonce) => {
    const updatedNonce = await database.updateNonce(nonce);
    if (!updatedNonce) {
        return null;
    }
    return updatedNonce;
}

const getAllUsers = async() => {
    const users = await database.getAllUsers();
    if (!users) {
        return null;
    }
    return users;
}

const getUser = async(wallet) => {
    wallet = wallet.toLowerCase()
    const user = await database.getUserByWallet(wallet);
    if (!user) {
        return null;
    }
    return user;
}

const createNewUser = async(newUser) => {
    const existingUser = await database.getUserByWallet(newUser.wallet);
    if (existingUser) {
        return existingUser
    }
    newUser.wallet = newUser.wallet.toLowerCase()

    const userData = {
        lastUpdate: Date.now(),
        ...newUser,
    };

    return await database.createNewUser(userData)
}

const updateUser = async(wallet, data) => {
    wallet = wallet.toLowerCase()
    data.lastUpdate = Date.now()
    const updatedUser = await database.updateUser(wallet, data);
    if (!updatedUser) {
        return null;
    }
    return updatedUser;
}

const deleteUser = async(wallet) => {
    wallet = wallet.toLowerCase()
    return await database.deleteUser(wallet);
}

module.exports = {
    getNonce,
    updateNonce,
    getAllUsers,
    getUser,
    deleteUser,
    updateUser,
    createNewUser,
}