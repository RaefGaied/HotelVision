import mongoose, { Schema } from "mongoose";

//schema

const commentSchema = new mongoose.Schema(
    {
        userId:{type: Schema.Types.ObjectId, ref:"Users"},
        postId:{type: Schema.Types.ObjectId, ref:"Posts"},
        comment:{type:String, required:true},
        from:{type:String, required:true},
        likes:[{type:String}],
        replies:[
            {
                rid:{type: Schema.Types.ObjectId},
                userId:{type: Schema.Types.ObjectId, ref:"Users"},
                comment:{type:String},
                from:{type:String},
                replyAt:{type:String},
                likes:[{type:String}],
                created_At:{type:Date, default:Date.now()},
                updated_At:{type:Date, default:Date.now()},
            }

        ],
        
    },
    {timestamps:true}
)

const Comments = mongoose.model("Comments", commentSchema);
export default Comments;