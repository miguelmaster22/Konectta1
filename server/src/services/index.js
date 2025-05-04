const database = require('../database/index.js');

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

module.exports = {
    getAllUsers,
    createNewUser,
    // Other service functions can be added here
}