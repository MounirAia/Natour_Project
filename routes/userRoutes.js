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
  getMe,
} = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword', resetPassword);

router.use(protectRoute); // all the routes below are protected routes

router.patch('/updatePassword', updatePassword);

router.get('/me', getMe);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo({ acceptedRoles: ['admin'] })); // all the routes below are reserved for admins

router.get('/', getUsers);
router.route('/:id').patch(updateUser).delete(deleteUser);

module.exports = router;
