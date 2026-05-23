import {Router} from 'express'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { listProduct } from '../controllers/product.controller.js'
const router=Router()
router.use(verifyJWT)
router.route('/list-item').post(upload.single("imageLocalPath"),listProduct)

export default router