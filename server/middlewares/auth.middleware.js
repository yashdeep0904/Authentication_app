import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // CRITICAL FIX: Check headers first to bypass 3rd party cookie blockers
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    // Fallback to cookies if header isn't present
    if (!token) {
        token = req.cookies.accessToken || req.cookies.access_token || req.cookies.admin_access_token;
    }

    if (!token) {
        return res.status(401).json({ 
            status: false, 
            message: "Access Denied. No security token found." 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ 
            status: false, 
            message: "Session expired or invalid token." 
        });
    }
};

export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ status: false, message: "Identity verification failed." });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ status: false, message: `Forbidden: You do not have ${allowedRoles.join('/')} permissions.` });
        }
        next();
    };
};