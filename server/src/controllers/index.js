const service = require('../services/index.js');

const baseRoute = (req, res) => {
    res.status(200).json({ status: "OK", message: 'Welcome to the API' });
};

const getAllUsers = async (req, res) => {
    // Logic to get all users
    const users = await service.getAllUsers();
    if (!users) {
        return res.status(500).json({ status: "ERROR", message: 'Failed to retrieve users'});
    }
    res.status(200).json({ status: "OK", message: 'All users retrieved successfully', data: users  });
}

const createUser = (req, res) => {
    // Logic to create a user
    const { body } = req;
    if (!body || !body.wallet ) {
        return res.status(400).json({ status: "ERROR", message: 'Invalid user data' });
    }

    const createdUser = service.createNewUser(body);
    if (!createdUser) {
        return res.status(500).json({ status: "ERROR", message: 'Failed to create user' });
    }

    res.status(201).json({ status: "OK", message: 'User created successfully' });
};


module.exports = {
    baseRoute,
    getAllUsers,
    createUser
}