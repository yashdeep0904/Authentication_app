import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const updatePassword = async (req, res, next) => {
    const { password } = req.body;
    // Use the setup cookie issued by step 2
    const token = req.cookies.setup_session;

    try {
        if (!token) return res.status(401).json({ status: false, message: 'Session expired. Please verify OTP again.' });

        // Decode token to securely get the email
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the user
        const updatedUser = await User.findOneAndUpdate(
            { email: email }, 
            { password: hashedPassword },
            { new: true }
        );

        if(!updatedUser) return res.status(404).json({ status: false, message: 'User not found.' });

        // Clean up the setup session cookie now that password is changed
        res.clearCookie('setup_session');

        res.status(200).json({ status: true, message: 'Password updated successfully! You can now log in.' });
    } catch (error) {
        next(error);
    }
};

export default updatePassword;