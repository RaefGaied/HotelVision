import FriendRequest from "../models/friendRequest.js";
import Users from "../models/userModel.js";

export const sendFriendRequest = async (req, res, next) => {
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

        const inverseExist = await FriendRequest.findOne({
            requestFrom: requestTo,
            requestTo: userId,
        });

        if (inverseExist) {
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

export const getFriendRequests = async (req, res) => {
    try {
        const { userId } = req.body.user;

        const requests = await FriendRequest.find({
            requestTo: userId,
            requestStatus: "Pending",
        })
            .populate({
                path: "requestFrom",
                select: "firstName lastName profileUrl profession -password",
            })
            .limit(10)
            .sort({ _id: -1 });

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const respondToRequest = async (req, res, next) => {
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
            if (!user.friends.includes(updatedRequest?.requestFrom)) {
                user.friends.push(updatedRequest?.requestFrom);
                await user.save();
            }

            const friend = await Users.findById(updatedRequest?.requestFrom);
            if (!friend.friends.includes(updatedRequest?.requestTo)) {
                friend.friends.push(updatedRequest?.requestTo);
                await friend.save();
            }
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
