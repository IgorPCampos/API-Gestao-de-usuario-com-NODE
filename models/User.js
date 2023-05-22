const knex = require("../database/connection")
const bcrypt = require("bcrypt")
const PasswordToken = require("./PasswordToken")
class User {

    async findAll() {
        try {
            let result = await knex.select(["id","name","email","role"]).table("users")//retorna um array. Não retorna a senha por motivos obvios
            return result
        } catch (error) {
            console.log(error)
            return []
        }
        
    }

    async findById(id) {
        try {
            let result = await knex.select(["id","name","email","role"]).where({id: id}).table("users")//retorna um array. Não retorna a senha por motivos obvios
            if (result.length > 0) {
                return result[0]
            } else {
                return undefined
            }
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

    async findByEmail(email) {
        try {
            let result = await knex.select(["id","name","password","email","role"]).where({email: email}).table("users")//retorna um array. Não retorna a senha por motivos obvios
            if (result.length > 0) {
                return result[0]
            } else {
                return undefined
            }
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

    async new(email, password, name) { //Insere os elementos na tabela, mas nao recebi nenhum dado até eu chamar a função Create no UserController
        try {
            let hash = await bcrypt.hash(password, 10)//Só coloca 10 por exemplo, o prof não explica o pq 

            await knex.insert({email, password: hash, name, role: 0}).table("users")//Por padrão vou colocar 0, pois é opcional
        } catch (error) {
            console.log(error)
        }
    }

    async findEmail(email) {//Como no banco de dados eu defini que o email é unico so pode ter um cadastro com cada email eu tenho que verificar e
        try {
            let result = await knex.select("*").from("users").where({email: email})//Returna um array se ele estiver vazio é pq o email ainda não existe
            if (result.length > 0) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.log(error)
            return false
        }
        
    }

    async update(id,name,email,role) { //Atualiza os dados na tabela, mas nao recebi nenhum dado até eu chamar a função edit no UserController
        
        let user = await this.findById(id)
        if (user != undefined) {
            let editUser = {}
            if (email != undefined) {
                if (email != user.email) {
                    let result = await this.findEmail(email)
                    if (!result) {
                        editUser.email = email
                    } else  {
                        return {status: false, err: "O email já está cadastrado"}
                    }
                }
            }

        if (name != undefined) {
            editUser.name = name
        }

        if (role != undefined) {
            editUser.role = role
        }

        try {
            await knex.update(editUser).where({id: id}).table("users")
            return {status: true}
        } catch (error) {
            return {status: false, err: error}
        }
       

        } else {
            return {status: false, err: "O usuario não existe"}
        }

    }

    async delete(id) {
        let user = await this.findById(id)
        
        if (user != undefined) {
            try {
                await knex.delete().where({id: id}).table("users")
                return {status: true}
            } catch (error) {
                return {status: false, err: error}
            }
            
        } else {
            return {status: false, err: "Usuário não existe"}
        }
    }

    async changePassword(newPassword,id,token){
        let hash = await bcrypt.hash(newPassword, 10);
        await knex.update({password: hash}).where({id: id}).table("users");
        await PasswordToken.setUsed(token);
    }
}

module.exports = new User()