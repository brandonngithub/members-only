const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}

const validateSignup = [
    // Sanitization middleware (runs first)
    (req, res, next) => {
        if (req.body.first_name) req.body.first_name = req.body.first_name.trim();
        if (req.body.last_name) req.body.last_name = req.body.last_name.trim();
        if (req.body.email) req.body.email = req.body.email.trim().toLowerCase();

        req.body.first_name = sanitizeHtml(req.body.first_name || '');
        req.body.last_name = sanitizeHtml(req.body.last_name || '');
        req.body.email = sanitizeHtml(req.body.email || '');
        
        next();
    },

    // Validation rules
    body('first_name')
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1-50 characters')
        .matches(/^[A-Za-z\s\-']+$/)
        .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

    body('last_name')
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1-50 characters')
        .matches(/^[A-Za-z\s\-']+$/)
        .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

    body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (!value) {
            throw new Error('Confirm Password is required');
            }
            if (value !== req.body.password) {
            throw new Error('Passwords do not match');
            }
            return true;
        }),

    body('admin')
        .optional()
        .isIn(['on', undefined])
        .withMessage('Invalid admin value'),
  
    // Validation handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Format errors to send back to the client
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).render('signup', { 
                errors: errorMessages,
                formData: req.body 
            });
        }
        next();
    }
];

module.exports = {
    ensureAuthenticated,
    validateSignup
};
