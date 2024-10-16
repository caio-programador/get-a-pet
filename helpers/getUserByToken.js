const jwt = require('jsonwebtoken')
const User = require('../models/User')


const getUserByToken = async (token) => {
    const decoded = jwt.verify(token, "nossa-chavesecreta-para-ajudar-em-tornar-seguro")
    const userId = decoded.id
    const user = await User.findOne({_id: userId})

    return user

}

module.exports = getUserByToken