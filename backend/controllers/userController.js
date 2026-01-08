import Verification from "../models/emailVerification.js";
import Users from "../models/userModel.js";
import Profiles from "../models/profileModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import PasswordReset from "../models/PasswordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";

export const verifyEmail = async (req, res) => {
    const { userId, token } = req.params;

    try {
        const verificationRecord = await Verification.findOne({ userId });

        if (!verificationRecord) {
            const message = "Invalid verification link. Try again later.";
            return res.redirect(`http://localhost:5173/?status=error&message=${message}`);
        }

        const { expiresAt, token: hashedToken } = verificationRecord;

        if (expiresAt < Date.now()) {
            await Verification.findOneAndDelete({ userId });
            await Users.findOneAndDelete({ _id: userId });
            const message = "Verification token has expired.";
            return res.redirect(`http://localhost:5173/?status=error&message=${message}`);
        }

        const isMatch = await compareString(token, hashedToken);
        if (!isMatch) {
            const message = "Verification failed or link is invalid";
            return res.redirect(`http://localhost:5173/?status=error&message=${message}`);
        }

        await Users.findOneAndUpdate({ _id: userId }, { verified: true });
        await Verification.findOneAndDelete({ userId });

        const message = "Email verified successfully";
        return res.redirect(`http://localhost:5173/?status=success&message=${message}`);
    } catch (error) {
        console.log(error);
        return res.redirect(`http://localhost:5173/?status=error&message=Error`);
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: "FAILED",
                message: "Email address not found.",
            });
        }

        const existingRequest = await PasswordReset.findOne({ email });
        if (existingRequest) {
            if (existingRequest.expiresAt > Date.now()) {
                return res.status(201).json({
                    status: "PENDING",
                    message: "Reset password link has already been sent to your email",
                });
            }
            await PasswordReset.findOneAndDelete({ email });
        }

        await resetPasswordLink(user, res);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { userId, token } = req.params;

    try {
        const user = await Users.findById(userId);

        if (!user) {
            const message = "Invalid password reset link. Try again";
            return res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }

        const resetPasswordRecord = await PasswordReset.findOne({ userId });
        if (!resetPasswordRecord) {
            const message = "Invalid password reset link. Try again";
            return res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }

        const { expiresAt, token: resetToken } = resetPasswordRecord;

        if (expiresAt < Date.now()) {
            const message = "Reset Password link has expired. Please try again";
            return res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }

        const isMatch = await compareString(token, resetToken);
        if (!isMatch) {
            const message = "Invalid reset password link. Please try again";
            return res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }

        return res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { userId, password } = req.body;

        const hashedPassword = await hashString(password);

        const user = await Users.findByIdAndUpdate(userId, { password: hashedPassword });

        if (user) {
            await PasswordReset.findOneAndDelete({ userId });

            const message = "Password successfully reset.";
            res.redirect(`/users/resetpassword?status=success&message=${message}`);
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

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

        const updateUser = {
            firstName,
            lastName,
            location,
            profileUrl,
            profession,
            _id: userId,
        };

        const user = await Users.findByIdAndUpdate(userId, updateUser, {
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
        res.status(404).json({ message: error.message });
    }
};

export const friendRequest = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        const { requestTo } = req.body;

        const requestExist = await FriendRequest.findOne({
            requestFrom: userId,
            requestTo,
        });

        if (requestExist) {
            next("Friend Request already sent.");
            return;
        }

        const accountExist = await FriendRequest.findOne({
            requestFrom: requestTo,
            requestTo: userId,
        });

        if (accountExist) {
            next("Friend Request already sent.");
            return;
        }

        await FriendRequest.create({
            requestTo,
            requestFrom: userId,
        });

        res.status(201).json({
            success: true,
            message: "Friend Request sent successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const getFriendRequest = async (req, res) => {
    try {
        const { userId } = req.body.user;

        const request = await FriendRequest.find({
            requestTo: userId,
            requestStatus: "Pending",
        })
            .populate({
                path: "requestFrom",
                select: "firstName lastName profileUrl profession -password",
            })
            .limit(10)
            .sort({
                _id: -1,
            });
        res.status(200).json({
            success: true,
            data: request,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const acceptRequest = async (req, res, next) => {
    try {
        const id = req.body.user.userId;
        const { rid, status } = req.body;
        const requestExist = await FriendRequest.findById(rid);

        if (!requestExist) {
            next("No Friend Request Found.");
            return;
        }

        const updatedRequest = await FriendRequest.findByIdAndUpdate(
            rid,
            { requestStatus: status },
            { new: true }
        );

        if (status === "Accepted") {
            const user = await Users.findById(id);
            user.friends.push(updatedRequest?.requestFrom);
            await user.save();

            const friend = await Users.findById(updatedRequest?.requestFrom);
            friend.friends.push(updatedRequest?.requestTo);
            await friend.save();
        }

        res.status(201).json({
            message: `Friend Request ${status}`,
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
        });
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
        res.status(404).json({
            message: error.message,
        });
    }
};
