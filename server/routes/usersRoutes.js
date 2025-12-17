const express=require('express');
const router=express.Router();
const {totalUsers,userProfile}=require('../controllers/usersControll')
const authmiddleware=require('../middleware/authmiddleware')


router.get('/totalUsers',totalUsers);
router.get('/profile',authmiddleware,userProfile);

module.exports=router;