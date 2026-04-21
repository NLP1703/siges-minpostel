// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errorHandler');
const jwtConfig = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Token manquant ou format invalide', 401);
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, jwtConfig.SECRET, {
      algorithms: [jwtConfig.ALGORITHM]
    });

    req.user = {
      id: decoded.id,
      email: decoded.email,
      nom: decoded.nom,
      prenom: decoded.prenom,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
        type: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
        type: 'INVALID_TOKEN'
      });
    }

    res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || 'Authentification requise'
    });
  }
};

module.exports = authMiddleware;
