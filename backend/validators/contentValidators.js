import { body } from 'express-validator';

export const postValidator = [
    body('description')
        .trim()
        .optional()
        .isLength({ max: 5000 }).withMessage('La description ne doit pas dépasser 5000 caractères'),

    body('image')
        .optional()
        .isURL().withMessage('L\'URL de l\'image est invalide'),

    body('location')
        .optional()
        .isLength({ max: 100 }).withMessage('Le lieu ne doit pas dépasser 100 caractères')
];

export const aiIdeaValidator = [
    body('topic')
        .trim()
        .notEmpty().withMessage('Le sujet est requis')
        .isLength({ max: 200 }).withMessage('Le sujet est trop long'),
    body('tone')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Le ton est trop long'),
    body('audience')
        .optional()
        .trim()
        .isLength({ max: 150 }).withMessage('L’audience est trop longue')
];

export const aiSentimentValidator = [
    body('text')
        .trim()
        .notEmpty().withMessage('Le texte est requis pour l’analyse')
        .isLength({ min: 10 }).withMessage('Fournissez au moins 10 caractères')
        .isLength({ max: 2000 }).withMessage('Le texte ne doit pas dépasser 2000 caractères'),
    body('context')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Le contexte est trop long')
];

export const commentValidator = [
    body('comment')
        .trim()
        .notEmpty().withMessage('Le commentaire ne peut pas être vide')
        .isLength({ max: 1000 }).withMessage('Le commentaire ne doit pas dépasser 1000 caractères')
];

export const userUpdateValidator = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),

    body('profession')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('La profession ne doit pas dépasser 100 caractères'),

    body('location')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Le lieu ne doit pas dépasser 100 caractères')
];
