import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { requireRole } from '../middleware/requireRole'
import { UsersController } from '../controllers/users.controller'

const router = Router()
const controller = new UsersController()

// All admin/users routes require auth + admin role
router.use(verifyAuth)
router.use(requireRole('admin'))

router.get('/', controller.listUsers)
router.post('/', controller.createUser)
router.patch('/:uid/role', controller.updateUserRole)
router.patch('/:uid/disable', controller.disableUser)

export default router
