import { Router } from "express"

import { Authenticate } from "../../middlewares/authenticationMiddleware"
import { Authorize } from "../../middlewares/authorizationMiddleware"
import { AdminRegister, UpdateUser } from "../../controllers/admin/authController"

const router = Router()

router.post('/register', AdminRegister)
router.patch('/update/:id', Authenticate, Authorize(["admin"]), UpdateUser)

export default router