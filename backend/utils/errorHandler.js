// utils/errorHandler.js

class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // Pour les erreurs de validation
  }
}

const handleError = (res, error) => {
  console.error('❌ Erreur:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors && { errors: error.errors })
    });
  }

  // Erreur MySQL
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Cette ressource existe déjà',
      type: 'DUPLICATE_ENTRY'
    });
  }

  // Erreur par défaut
  return res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
};

module.exports = { ApiError, handleError };
