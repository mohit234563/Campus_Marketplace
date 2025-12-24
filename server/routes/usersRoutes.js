const express=require('express');
const router=express.Router();
const {userProfile,userHistory, editProfile}=require('../controllers/usersControls')
const authmiddleware=require('../middleware/authmiddleware');
const { totalUsers,sellItem,buyItem, myProducts,productList, editItem } = require('../controllers/productControllers');


router.get('/totalUsers',totalUsers);
router.get('/profile',authmiddleware,userProfile);
router.get('/orderHistory',authmiddleware,userHistory);
router.post('/sellItem',authmiddleware,sellItem)
router.post('/buyItem',authmiddleware,buyItem)
router.get('/myProducts',authmiddleware,myProducts)
router.get('/productList',authmiddleware,productList);
router.put('/profileEdit',authmiddleware,editProfile);
router.put('/ItemEdit/:id',authmiddleware,editItem);
module.exports=router;