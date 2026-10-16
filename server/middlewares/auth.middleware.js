import jwt from 'jsonwebtoken';

/**
 * 1. UNIVERSAL TOKEN VERIFIER
 * This middleware checks if a valid access token exists in the cookies.
 * It works for both Students (access_token) and Admins (admin_access_token).
 */
export const verifyToken = (req, res, next) => {
    // Check both potential cookie names
    const token = req.cookies.access_token || req.cookies.admin_access_token;

    if (!token) {
        return res.status(401).json({ 
            status: false, 
            message: "Access Denied. No security token found." 
        });
    }

    try {
        // Verify the JWT signature using your secret key
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        
        // Attach the user's info (id and role) to the request object
        // so the next functions/controllers can use them
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ 
            status: false, 
            message: "Session expired or invalid token." 
        });
    }
};

/**
 * 2. ROLE-BASED ACCESS CONTROL (RBAC)
 * This is a "Higher Order" middleware. You tell it which roles are allowed,
 * and it returns a middleware function to check the user's role.
 * * Usage: requireRole(['admin']) or requireRole(['student', 'teacher'])
 */
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        // req.user was set by the verifyToken middleware above
        if (!req.user || !req.user.role) {
            return res.status(401).json({ 
                status: false, 
                message: "Identity verification failed." 
            });
        }

        // Check if the user's role is in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: false, 
                message: `Forbidden: You do not have ${allowedRoles.join('/')} permissions.` 
            });
        }

        next(); // Authorization passed!
    };
};