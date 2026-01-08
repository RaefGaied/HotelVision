import Users from "../models/userModel.js";
import { createJWT } from "../utils/index.js";

export const getUser = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        const user = await Users.findById(id ?? userId).populate({
            path: "friends",
            select: "-password",
        });

        if (!user) {
            return res.status(404).json({
                message: "User Not Found",
                success: false,
            });
        }

        user.password = undefined;

        res.status(200).json({
            user,
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { firstName, lastName, location, profileUrl, profession } = req.body;

        if (!(firstName || lastName || location || profileUrl || profession)) {
            next("Please provide at least one field to update");
            return;
        }

        const { userId } = req.body.user;

        const updateUserPayload = {
            firstName,
            lastName,
            location,
            profileUrl,
            profession,
            _id: userId,
        };

        const user = await Users.findByIdAndUpdate(userId, updateUserPayload, {
            new: true,
        });

        await user.populate({ path: "friends", select: "-password" });
        const token = createJWT(user?._id);

        user.password = undefined;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user,
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const profileViews = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.body;

        const user = await Users.findById(id);
        user.views.push(userId);
        await user.save();

        res.status(201).json({
            success: true,
            message: "Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "auth error",
            error: error.message,
        });
    }
};

export const suggestedFriends = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const queryObject = {
            _id: { $ne: userId },
            friends: { $nin: userId },
        };
        const suggestedFriends = await Users.find(queryObject)
            .limit(15)
            .select("firstName lastName profileUrl profession -password");

        res.status(200).json({
            success: true,
            data: suggestedFriends,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message,
        });
    }
};
