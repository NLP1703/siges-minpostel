// middlewares/roleMiddleware.js
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Rôle insuffisant',
        type: 'INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

module.exports = { checkRole };
