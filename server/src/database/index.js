const mongoose = require('mongoose');
const User = require('./models/user.model.js');

const getAllUsers = async()=>{
    return await User.find({})
}

const createNewUser = async(user) => {
    user.wallet = user.wallet.toLowerCase()
    const newUser = new User(user); 
    await newUser.save();

    return newUser;
}

module.exports = {
    getAllUsers,
    createNewUser
}