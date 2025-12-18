import { Router } from "express"

import userRoutes from "./user/authRoute"
import adminRoutes from "./admin/authRoute"
import logisticRoutes from "./logistics/Routes"
import shipment from "./user/shipmentRoute"
import { Login }  from "../controllers/authController"
import { fetchUserDetail } from "../controllers/authController"
import { Authenticate } from "../middlewares/authenticationMiddleware"
import { Authorize } from "../middlewares/authorizationMiddleware"
const  router = Router()

router.use('/user', userRoutes)
router.use('/admin', adminRoutes)
router.use('/logistic', logisticRoutes)
router.use('/user', shipment)

router.use('/login', Login)
router.use('/fetchdetail', Authenticate, Authorize(["user", "admin", "logistic"]), fetchUserDetail)
export default router;