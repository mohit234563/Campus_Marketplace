const user=require('../controllers/usersControll')
const express=require('express');
const router=express.Router();

router.get('/totalUsers',user.totalUsers);

module.exports=router;