import {clerkClient} from "@clerk/express";

// middleware so that only admin can add new shows

export const protectAdmin = async (req,res,next) => {
    try {
        // get userId from req.auth
        const {userId} = req.auth;

        // fetch user from clerk
        const user = await clerkClient.users.getUser(userId);

        // check if user has admin role
        if(user.privateMetadata.role != 'admin'){   
            return res.json({
                success: false,
                message: 'Not Authorized'
            })
        }

        next();
    } catch (error) {
        return res.json({
            success: false,
            message: 'Not Authorized'
        })
    }
}