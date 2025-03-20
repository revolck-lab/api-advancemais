const jwt = require('jsonwebtoken');
const userModel = require('../modules/users/models/userModel');

const authToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });    
        }

        const token = authHeader?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token not provided' });
        }

        const decode = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decode.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.user = user;

        const roleLevel = await userModel.findByLevel(user.role_id);
        if (!roleLevel) {
            return res.status(404).json({ error: 'Role not found for the user' });
        }
        
        req.user
        next();
    } catch (error) {
        console.error('Error in authentication middleware:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Invalid token' });
        }

        return res.status(500).json({ error: 'Internal server error in authentication' });
    }
};

module.exports = authToken;
