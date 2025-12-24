const express=require('express');
const router=express.Router();
const {userProfile,userHistory, editProfile}=require('../controllers/usersControls')
const authmiddleware=require('../middleware/authmiddleware');
const { totalUsers,sellItem,buyItem, myProducts,productList, editItem, deleteItem } = require('../controllers/productControllers');


router.get('/totalUsers',totalUsers);//done
router.get('/profile',authmiddleware,userProfile);//done
router.get('/orderHistory',authmiddleware,userHistory);//done
router.post('/sellItem',authmiddleware,sellItem)//done
router.post('/buyItem',authmiddleware,buyItem)//done
router.get('/myProducts',authmiddleware,myProducts)//done
router.get('/productList',productList);//done
router.put('/profileEdit',authmiddleware,editProfile);//done
router.put('/ItemEdit/:productId',authmiddleware,editItem);//done
router.delete('/deleteItem/:id',authmiddleware,deleteItem);//done
module.exports=router;