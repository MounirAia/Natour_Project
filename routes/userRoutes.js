const express = require('express');
const {
  signup,
  login,
  protectRoute,
  restrictTo,
} = require('../controllers/authentificationController');
const {
  getUsers,
  updateUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMe,
  deleteMe,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword', resetPassword);
router.patch('/updatePassword', protectRoute, updatePassword);

router.get('/', protectRoute, getUsers);
router.patch('/updateMe', protectRoute, updateMe);
router.delete('/deleteMe', protectRoute, deleteMe);

router
  .route('/:id')
  .patch(protectRoute, restrictTo({ acceptedRoles: ['admin'] }), updateUser)
  .delete(protectRoute, restrictTo({ acceptedRoles: ['admin'] }), deleteUser);

module.exports = router;
