import User from "../models/usermodel.js";

// get all users
export const getUsers = async (req, res) => {
    try {
        const user = await User.find();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message});
    }
}

// get user by id
export const getUserByID = async (req, res) => {
    try {
        const userByID = await User.findById(req.params.id);
        if (!userByID) return res.status(404).json({message: "User not found"});
        res.status(200).json(userByID);
    } catch (error) {
        res.status(500).json({message: "Error fetching user by ID", error: error.message});
    }
}

// get user by name
export const getUserByName = async (req, res) => {
    try {
        const userByName = await User.findOne({name: req.params.name});
        if (!userByName) return res.status(404).json({message: "User not found"});
        res.status(200).json(userByName);
    } catch (error) {
        res.status(500).json({message: "Error fetching user by name", error: error.message});
    }
}

// add users
export const addUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser, { message: "User added successfully"});
    } catch (error) {
        res.status(500).json({ message: "Error adding users", error: error.message});
    }
}

// update user
export const updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!updatedUser) return res.status(404).json({message: "User not found"});
        res.status(200).json({user: updatedUser, message: "User updated successfully"});
    } catch (error) {
        res.status(500).json({message: "Error updating user", error: error.message});
    }
}

// delete user
export const deleteUser = async (req, res) => {
    try {
        const deleteUser = await User.findByIdAndDelete(req.params.id);
        if (!deleteUser) return res.status(404).json({message: "User not found"});
        res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "Error deleting user", error});
    }
}