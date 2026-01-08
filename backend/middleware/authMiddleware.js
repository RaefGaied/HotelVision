import JWT from "jsonwebtoken";

export const userAuth = async(req,res,next) =>{
    const authHeader = req?.headers?.authorization;

    if(!authHeader || !authHeader?.startsWith("Bearer")){
        next("Autentication== failed");
    }
    const token = authHeader?.split(" ")[1];

    try{
        const userToken = JWT.verify(token, process.env.JWT_SECRET);

        req.body.user = {
            userId: userToken.userId,
        };

        next();
    }catch(error){
        console.log('error', error );
        next("Auth failed");
    }
}