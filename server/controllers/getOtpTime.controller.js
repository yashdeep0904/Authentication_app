import redisClient from "../utils/redisClient.js";


const getOtpTime = async(req, res, next) => {
    // SECURE: We read the token directly from the hidden cookie
    const token = req.cookies.registration_session; 

    try {
        if(!token) return res.status(401).json({ status: false, message: "Session expired." });

        // FETCH FROM REDIS
        const redisDataStr = await redisClient.get(`otp_session:${token}`);
        
        if(!redisDataStr){
            // If it's not in Redis, it means the 3 minutes already passed and Redis deleted it!
            return res.status(200).json({ status: true, message: 'Expired', sendTime: 0 }); 
        }
        
        const redisData = JSON.parse(redisDataStr);
        
        res.status(200).json({
            message: 'success',
            status: true,
            sendTime: redisData.sendTime
        });
        
    } catch (error) {
        next(error);
    } 
}
export default getOtpTime;