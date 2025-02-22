const router = require('express').Router()

const UserController = require('../controllers/UserController')
const { imageUpload } = require('../helpers/image-upload')
const verifyToken = require('../helpers/verifyToken')


router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/checkuser', UserController.checkUser)
router.get('/:id', UserController.getUserById)
router.patch('/edit', verifyToken, imageUpload.single("image"), UserController.editUser)


module.exports = router