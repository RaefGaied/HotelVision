import Posts from "../models/postModel.js";
import Users from "../models/userModel.js";

export const createPost = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        const { description, image } = req.body;

        if (!description) {
            next("You must provide a description");
            return;
        }

        const post = await Posts.create({
            userId,
            description,
            image,
        });
        res.status(200).json({
            success: true,
            message: "Post Created Successfully",
            data: post,
        })

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, image } = req.body;
        const { userId } = req.body.user;

        const post = await Posts.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this post",
            });
        }

        if (!description && image === undefined) {
            return res.status(400).json({
                success: false,
                message: "Nothing to update",
            });
        }

        if (description) post.description = description;
        if (image !== undefined) post.image = image;

        await post.save();

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: post,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const getPosts = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        const search = req.body?.search ?? req.query?.search ?? "";

        const user = await Users.findById(userId);
        const friends = user?.friends?.toString().split(",") ?? [];

        friends.push(userId);

        const searchPostQuery = {
            $or: [
                {
                    description: { $regex: search, $options: "i" },
                },
            ],
        };

        const posts = await Posts.find(search ? searchPostQuery : {})
            .populate({
                path: "userId",
                select: "firstName lastName location profileUrl -password",

            })
            .sort({ _id: -1 });

        const friendsPosts = posts?.filter((post) => {
            return friends.includes(post?.userId?._id.toString());
        });

        const otherPosts = posts?.filter(
            (post) => !friends.includes(post?.userId?._id.toString())
        );

        let postsRes = null;
        if (friendsPosts?.length > 0) {
            postsRes = search ? friendsPosts : [...friendsPosts, ...otherPosts];
        } else {
            postsRes = posts;
        }
        res.status(200).json({
            success: true,
            message: "successfull",
            data: postsRes,
        })

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
}

export const getPost = async (req, res, next) => {
    try {
        const { id } = req.params;

        const post = await Posts.findById(id).populate({
            path: "userId",
            select: "firstName lastName location profileUrl -password"
        })
        // .populate({
        //     path:"comments",
        //     populate:{
        //         path: "userId",
        //         select: "firstName lastName location profileUrl -password"
        //     },
        //     options:{
        //         sort:"-_id",
        //     },

        // }).populate({
        //     path:"comments",
        //     populate:{
        //         path: "replies.userId",
        //         select: "firstName lastName location profileUrl -password"
        //     },
        // })
        res.status(200).json({
            success: true,
            message: "successfull",
            data: post,
        })
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: error.message
        })

    }

}

export const getUserPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Posts.find({ userId: id }).populate({
            path: "userId",
            select: "firstName lastName location profileUrl -password",
        }).sort({ _id: -1 });

        res.status(200).json({
            success: true,
            message: "successfully",
            data: post,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error._message });
    }
};

export const likePost = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        const post = await Posts.findById(id);

        const index = post.likes.findIndex((pid) => pid === String(userId));
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes = post.likes.filter((pid) => pid !== String(userId));
        }

        const newPost = await Posts.findByIdAndUpdate(id, post, {
            new: true,
        });

        res.status(200).json({
            success: true,
            message: "successful",
        });

    } catch (err) {
        console.error(err);
        res.status(404).json({
            message: err.message
        });
    }
}

export const deletePost = async (req, res, next) => {

    try {
        const { id } = req.params;
        const { userId } = req.body.user;

        const post = await Posts.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this post",
            });
        }

        await Comments.deleteMany({ postId: id });
        await Posts.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }

}
