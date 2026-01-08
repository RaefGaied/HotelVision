import Users from "../models/userModel.js";
import Profiles from "../models/profileModel.js";
import Verification from "../models/emailVerification.js";
import PasswordReset from "../models/PasswordReset.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import { resetPasswordLink, sendVerificationEmail } from "../utils/sendEmail.js";

export const register = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    if (!(firstName && lastName && email && password)) {
        next("Provide Required Fields!");
        return;
    }

    try {
        const userExist = await Users.findOne({ email });
        if (userExist) {
            next("Email Address Already Exists");
            return;
        }

        const hashedPassword = await hashString(password);

        const user = await Users.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        const profile = await Profiles.create({
            user: user._id,
            displayName: `${firstName} ${lastName}`.trim(),
            bio: "",
            avatar: "",
            profession: "",
            location: "",
            skills: [],
            interests: [],
        });

        user.profile = profile._id;
        await user.save();

        //send email verification to user
        sendVerificationEmail(user, res);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

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
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
    }
};
export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        //validation
        if (!email || !password) {
            next("Please Provide User Credentials");
            return;
        }

        // find user by email
        const user = await Users.findOne({ email }).select("+password").populate({
            path: "friends",
            select: "firstName lastName location profileUrl -password",
        });

        if (!user) {
            next("Invalid Email or Password")
            return;
        }
        if (!user?.verified) {
            next("User email is not verified. Check you email account and verify your email")
            return;
        }

        //check for correct passsword
        const isMatch = await compareString(password, user?.password);
        if (!isMatch) {
            next("Invalid Email or Password")
            return;
        }

        user.password = undefined;

        const token = createJWT(user?._id);
        res.status(201).json({
            success: true,
            message: "Login successfully",
            user,
            token,
        })


    } catch (error) {
        // handle error
        console.log(error);
        res.status(404).json({ message: error.message });
    }
}