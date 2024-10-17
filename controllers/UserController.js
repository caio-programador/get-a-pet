const User = require("../models/User")
const bcrypt = require('bcryptjs')
const createUserToken = require("../helpers/createUserToken")
const getToken = require("../helpers/getToken")
const jwt = require('jsonwebtoken')
const getUserByToken = require("../helpers/getUserByToken")

module.exports = class UserController{
    static async register(req, res){
        const {name, email, phone, password, confirmpassword} = req.body

        if(!name) {
            res.status(422).json({message: 'O nome é obrigatório'})
            return
        }
        if(!email) {
            res.status(422).json({message: 'O e-mail é obrigatório'})
            return
        }
        if(!phone) {
            res.status(422).json({message: 'O número de telefone é obrigatório'})
            return
        }
        if(!password) {
            res.status(422).json({message: 'A senha é obrigatória'})
            return
        }
        if(!confirmpassword) {
            res.status(422).json({message: 'A confirmação de senha é obrigatória'})
            return
        }

        if(password !== confirmpassword){
            res.status(422).json({message: 'As senhas não coincidem'})
            return
        }

        const userExists = await User.findOne({email:email})

        if(userExists){
            res.status(422).json({message: 'Por favor, utilize outro e-mail'})
            return
        }
        
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        const user = new User({
            name, email, phone, password: passwordHash
        })

        try {
            const newUser = await user.save()
            await createUserToken(newUser, req, res)
        } catch (error) {
            res.status(error.status).json({message: error})
        }

    }
    static async login(req, res){
        const {email, password} = req.body

        if(!email) {
            res.status(422).json({message: 'O e-mail é obrigatório'})
            return
        }
        if(!password) {
            res.status(422).json({message: 'A senha é obrigatória'})
            return  
        }

        const user = await User.findOne({email:email})

        if(!user){
            res.status(422).json({message: 'Usuário não existe'})
            return
        }

        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword){
            res.status(422).json({
                message: 'Senha inválida'
            })
        }

        await createUserToken(user,req,res)

    }

    static async checkUser(req,res){
        let currentUser

        if(req.headers.authorization){
            const token = getToken(req)
            const decoded = jwt.verify(token, "nossa-chavesecreta-para-ajudar-em-tornar-seguro")

            currentUser = await User.findById(decoded.id)

            currentUser.password = undefined
        }else{
            currentUser = null
        }

        res.json({currentUser})
    }

    static async getUserById(req,res){
        const id = req.params.id

        const user = await User.findById(id)

        if(!user){
            res.status(404).json({
                message: 'User não encontrado'
            })
            return
        }

        

        res.status(200).json({user})
    }

    static async editUser(req, res){
        const token = getToken(req)
        const user = await getUserByToken(token)

        const {name, email, phone, password, confirmpassword} = req.body

        if(req.file){
            user.image = req.file.filename
        }

        if(name) {
            user.name = name
        }
        if(email) {
            const userExists = await User.findOne({email:email})

            if(user.email === email && userExists){
                res.status(422).json({message: 'Por favor, utilize outro e-mail'})
                return
            }

            user.email = email
        }

        

        if(phone) {
            user.phone = phone
        }
        

        if(password != confirmpassword){
            res.status(422).json({message: 'As senhas não coincidem'})
            return
        }else if(password == confirmpassword && password != null){
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)
            user.password = passwordHash
        }
        try {
            await User.findOneAndUpdate(
                {_id: user._id},
                {$set: user},
                {new: true}
            )
            res.status(200).json({message: 'User atualizado com sucesso'})
        } catch (error) {
            return res.status(500).json({message: error})
        }
    }
}