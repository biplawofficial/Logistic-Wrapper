import { Router } from "express"

import { Authenticate } from "../../middlewares/authenticationMiddleware"
import { Authorize } from "../../middlewares/authorizationMiddleware"
import { LogisticRegister, UpdateUser } from "../../controllers/logistics/authController"
import { addDriver, getDrivers } from "../../controllers/logistics/DriverController"
import { confirmShipment, scanShipment } from "../../controllers/logistics/shipment"
const router = Router()

router.post('/register', LogisticRegister)
router.patch('/update/:id', Authenticate, Authorize(["logistic"]), UpdateUser)
router.post('/driver/add', Authenticate, Authorize(["logistic"]), addDriver)
router.get('/driver/getall', Authenticate, Authorize(["logistic"]), getDrivers)
router.post('/shipment/confirm', Authenticate, Authorize(["logistic"]), confirmShipment)
router.post('/shipment/scan', Authenticate, Authorize(["driver", "logistic"]), scanShipment)

export default router