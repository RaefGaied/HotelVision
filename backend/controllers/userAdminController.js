import Users from "../models/userModel.js";
import Profiles from "../models/profileModel.js";
import FriendRequest from "../models/friendRequest.js";
import { hashString } from "../utils/index.js";

export const createUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, profession, location } = req.body;

        if (!(firstName && lastName && email && password)) {
            next("All fields are required to create a user.");
            return;
        }

        const userExist = await Users.findOne({ email });
        if (userExist) {
            next("Email address already exists");
            return;
        }

        const hashedPassword = await hashString(password);

        const user = await Users.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profession,
            location,
        });

        const profile = await Profiles.create({
            user: user._id,
            displayName: `${firstName} ${lastName}`.trim(),
        });

        user.profile = profile._id;
        await user.save();

        user.password = undefined;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const listUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const query = search
            ? {
                $or: [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const users = await Users.find(query)
            .select("-password")
            .populate({ path: "profile" })
            .populate({ path: "friends", select: "firstName lastName profileUrl" });

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        await Profiles.findOneAndDelete({ user: id });
        await FriendRequest.deleteMany({
            $or: [{ requestFrom: id }, { requestTo: id }],
        });
        await Users.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
