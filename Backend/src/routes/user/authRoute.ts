import { Router } from "express"

import { Authenticate } from "../../middlewares/authenticationMiddleware"
import { Authorize } from "../../middlewares/authorizationMiddleware"
import { UserRegister, UpdateUser } from "../../controllers/user/authController"

const router = Router()

router.post('/register', UserRegister)
router.patch('/update/:id', Authenticate, Authorize(["user"]), UpdateUser)
export default router