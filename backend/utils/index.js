import bcrypt from "bcryptjs";

import JWT from "jsonwebtoken";

export const hashString = async(useValue)=>{
    const salt  = await bcrypt.genSalt(10);

    const hashedPassword  = await bcrypt.hash(useValue, salt);
    return hashedPassword;
};

export const compareString = async (userPassword, password)=>{
    const isMatch = await bcrypt.compare(userPassword, password);
    return isMatch;
};

//JSON WEBTOKEN

export function createJWT(id){
    return JWT.sign({userId: id}, process.env.JWT_SECRET, {
        expiresIn : '24h' // expires in 24 hours
    })
}