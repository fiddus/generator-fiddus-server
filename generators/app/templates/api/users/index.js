/**
 * User router configuration
 */

'use strict';

var router = require('express').Router(),
    controller = require('./userController'),
    auth = require('../../auth/authService'),
    formatResponse = require('express-format-response'),
    template = require('../../config/responseTemplate'),
    responseFormatter = formatResponse(template),
    activator = require('activator'),
    activatorConfig = require('../../config/activatorConfig');

activator.init(activatorConfig);

// Creates a new user
router.post('/', controller.create, activator.createActivateNext, responseFormatter);

// Reads the own user profile
router.get('/me', auth.isAuthenticated(), controller.me, responseFormatter);

// Reads an user
router.get('/:id', auth.hasRole('admin'), controller.read, responseFormatter);

// Updates own user profile
router.put('/me', auth.isAuthenticated(), controller.updateMe, responseFormatter);

// Updates an user
router.put('/:id', auth.hasRole('admin'), controller.update, responseFormatter);

// Deletes an user
router.delete('/:id', auth.hasRole('admin'), controller.delete);

// Lists all users
router.get('/', auth.isAuthenticated(), controller.list, responseFormatter);

// Activates an user
router.get('/activate/:user', activator.completeActivateNext, controller.activateUser, responseFormatter);

// Require password reset
router.post('/passwordreset', controller.passwordResetRequest, activator.createPasswordResetNext,
    controller.passwordResetRequestResponse, responseFormatter);

// Set new password page
// This route renders a page for users to insert new password
router.get('/passwordreset/:user', controller.newPasswordPage);

// Fulfill password reset
router.put('/passwordreset/:user', activator.completePasswordResetNext, controller.passwordResetFulfill,
    responseFormatter);

module.exports = router;
