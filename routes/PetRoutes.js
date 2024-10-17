const PetController = require('../controllers/PetController')
const { imageUpload } = require('../helpers/image-upload')
const verifyToken = require('../helpers/verifyToken')

const router = require('express').Router()

router.post('/create', verifyToken, imageUpload.array('images'), PetController.create)
router.get('/', PetController.getAll)

module.exports = router