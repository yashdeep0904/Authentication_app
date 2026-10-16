const getAccess = async (req, res, next) => {
    // Read the secure cookie instead of req.body
    const token = req.cookies.registration_session; 

    try {
        if (!token) {
            return res.status(401).json({ status: false, message: "No registration session found." });
        }
        // If the cookie exists, grant access to the OTP page!
        return res.status(200).json({ message: "success", status: true });
        
    } catch (error) {
        next(error);
    }
}
export default getAccess;