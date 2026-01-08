import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
            unique: true,
        },
        displayName: {
            type: String,
            required: true,
        },
        bio: {
            type: String,
            default: "",
        },
        avatar: {
            type: String,
        },
        profession: {
            type: String,
        },
        location: {
            type: String,
        },
        skills: [
            {
                type: String,
            },
        ],
        interests: [
            {
                type: String,
            },
        ],
        socialLinks: {
            website: { type: String },
            linkedin: { type: String },
            github: { type: String },
            twitter: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

const Profiles = mongoose.model("Profiles", profileSchema);
export default Profiles;
