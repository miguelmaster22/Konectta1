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

const createNewUser = async(newUser) => {

    const userData = {
        lastUpdate: Date.now(),
        ...newUser,
    };

    return await database.createNewUser(userData)
}

const deleteUser = async(wallet) => {
    return await database.deleteUser(wallet);
}

module.exports = {
    getNonce,
    updateNonce,
    getAllUsers,
    deleteUser,
    createNewUser,
}