const User = require("../models/User")
const PasswordToken = require("../models/PasswordToken")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const secret = "fasfaewfegegtr"
class UserController {
    async index(req, res) {
        let users = await User.findAll()
        res.json(users)
    }

    async findUser(req, res) {
        let id = req.params.id
        let user = await User.findById(id)
        if (user == undefined) {
            res.status(404)
            res.json({})
        } else {
            res.json({user})
        }
    }

    async create(req, res) { //Aqui eu recebo do dados e mando eles para a função new que realmente vai criar
        let { email, name, password } = req.body

        if (email == undefined || email == "" || name == undefined  || name == "" || password == undefined || password == "" ) { //Se não exister um obj chamado email não funciona ou se ele estiver vazio
            res.status(400)
            res.json({err: "Dados inválidos"})
            return//Quando trabalhar com controllers colocar return, pois se tiver um erro já encerra na hora e não tem risco de passar pra frente
        }

        let emailExists = await User.findEmail(email)

        if (!emailExists) {//Se for falso pode cadastrar
            res.status(200)
        } else {
            res.status(406)
            res.send({err: "Email já cadastrado"})
            return
        }

        await User.new(email, password, name) 

        res.status(200)
        res.send("Usuário cadastrado")
    }

    async edit(req, res) { //Aqui eu recebo do dados e mando eles para a função update que realmente vai editar
        let {id, name, email, role} = req.body
        let result = await User.update(id,name,email,role)
        if (result != undefined) {
            if (result.status) {
                res.status(200)
                res.send("Deu bom a edição")
            } else {
                res.status(406)
                res.send(result.err)
            }
        } else {
            res.status(406)
            res.send(result.err)
        }
    }

    async remove(req, res) { //Aqui eu recebo o id e mando para a função delete que realmente vai remover 
        let id = req.params.id
        let result = await User.delete(id)

        if (result.status) {
            res.status(200)
            res.send("Usuário deletado")
        } else {
            res.status(406)
            res.send(result.err)
        }
    }

    async recoverPassword(req, res){
        let email = req.body.email
        let result = await PasswordToken.create(email)
        if(result.status){
           res.status(200)
           res.send("" + result.token)//para nao dar erro
        }else{
            res.status(406)
            res.send(result.err)
        }
    }

    async changePassword(req, res){
        let token = req.body.token;
        let password = req.body.password;
        let isTokenValid = await PasswordToken.validate(token);
        if(isTokenValid.status){
            await User.changePassword(password,isTokenValid.token.user_id,isTokenValid.token.token);
            res.status(200);
            res.send("Senha alterada");
        }else{
            res.status(406);
            res.send("Token inválido!");
        }
    }

    async login(req, res){
        let {email, password } = req.body;

        let user = await User.findByEmail(email);

        if(user != undefined){

            let resultado = await bcrypt.compare(password,user.password);

            if(resultado){

                let token = jwt.sign({ email: user.email, role: user.role }, secret);

                res.status(200);
                res.json({token: token});

            }else{
                res.status(406);
                res.send("Senha incorreta");
            }

        }else{

            res.json({status: false});

        }
    }
}


module.exports = new UserController()