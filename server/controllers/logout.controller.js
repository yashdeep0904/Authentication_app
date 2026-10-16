export const logout = async (req, res, next) => {
    try {
        // We use res.clearCookie with the exact same options used to set them
        const clearOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        // 1. Clear the main authentication Refresh/Access token
        res.clearCookie('jwt', clearOptions);
        
        // 2. Clear any lingering registration or setup sessions just in case
        res.clearCookie('setup_session', clearOptions);
        res.clearCookie('registration_session', clearOptions);

        // (Optional) If you are tracking Refresh Tokens in your database, 
        // you would also remove the token from the User's array here.

        res.status(200).json({ message: "Logged out successfully", status: true });

    } catch (error) {
        next(error);
    }
}