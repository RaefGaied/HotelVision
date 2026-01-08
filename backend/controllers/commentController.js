import Comments from "../models/commentModel.js";
import Posts from "../models/postModel.js";

export const getComments = async (req, res) => {
    try {
        const { postId, id } = req.params;
        const targetPostId = postId ?? id;

        const postComments = await Comments.find({ postId: targetPostId })
            .populate({
                path: "userId",
                select: "firstName lastName location profileUrl -password",
            })
            .populate({
                path: "replies.userId",
                select: "firstName lastName location profileUrl -password",
            })
            .sort({ _id: -1 });

        res.status(200).json({
            success: true,
            message: "successfull",
            data: postComments,
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            message: error.message,
        });
    }
};

export const commentPost = async (req, res) => {
    try {
        const { comment, from } = req.body;
        const { userId } = req.body.user;
        const { id } = req.params;

        if (!comment) {
            return res.status(400).json({ message: "Comment is required." });
        }

        const newComment = new Comments({ comment, from, userId, postId: id });
        await newComment.save();

        const post = await Posts.findById(id);
        post.comments.push(newComment._id);
        await Posts.findByIdAndUpdate(id, post, { new: true });

        const populatedComment = await Comments.findById(newComment._id).populate({
            path: "userId",
            select: "firstName lastName location profileUrl -password",
        });

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: populatedComment,
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            message: error.message,
        });
    }
};

export const replyPostComment = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { comment, replyAt, from } = req.body;
        const { id } = req.params;

        if (!comment) {
            return res.status(400).json({ message: "Comment is required." });
        }

        const commentInfo = await Comments.findById(id);
        commentInfo.replies.push({
            comment,
            replyAt,
            from,
            userId,
            created_At: Date.now(),
        });
        await commentInfo.save();

        res.status(200).json(commentInfo);
    } catch (error) {
        console.error(error);
        res.status(404).json({
            message: error.message,
        });
    }
};

export const likePostComment = async (req, res) => {
    const { userId } = req.body.user;
    const { id, rid } = req.params;

    try {
        if (!rid) {
            const comment = await Comments.findById(id);
            const index = comment.likes.findIndex((el) => el === String(userId));
            if (index === -1) {
                comment.likes.push(userId);
            } else {
                comment.likes = comment.likes.filter((i) => i !== String(userId));
            }
            const updated = await Comments.findByIdAndUpdate(id, comment, {
                new: true,
            });
            res.status(201).json(updated);
            return;
        }

        const replyComments = await Comments.findOne(
            { _id: id },
            { replies: { $elemMatch: { _id: rid } } }
        );

        const index = replyComments?.replies[0]?.likes.findIndex(
            (i) => i === String(userId)
        );

        if (index === -1) {
            replyComments.replies[0].likes.push(userId);
        } else {
            replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
                (i) => i !== String(userId)
            );
        }

        const query = { _id: id, "replies._id": rid };
        const updated = {
            $set: {
                "replies.$.likes": replyComments.replies[0].likes,
            },
        };

        const result = await Comments.updateOne(query, updated, { new: true });
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(404).json({
            message: error.message,
        });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const { userId } = req.body.user;

        const existingComment = await Comments.findById(id);

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        if (existingComment.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to modify this comment",
            });
        }

        existingComment.comment = comment ?? existingComment.comment;
        await existingComment.save();

        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: existingComment,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body.user;

        const comment = await Comments.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        if (comment.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this comment",
            });
        }

        await Posts.findByIdAndUpdate(comment.postId, {
            $pull: { comments: comment._id },
        });
        await Comments.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
