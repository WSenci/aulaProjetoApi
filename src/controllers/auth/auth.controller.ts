import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../../models/user.entity";
import Token from "../../models/token.entity";

export default class AuthController {
    static async store(req: Request, res: Response) {
        const { name, email, password } = req.body;

        if (!name) return res.status(400).json({ error: "Nome obrigatório" });
        if (!email) return res.status(400).json({ error: "E-mail obrigatório" });
        if (!password) return res.status(400).json({ error: "Senha obrigatório" });

        const user = new User();
        user.name = name;
        user.email = email;
        user.password = bcrypt.hashSync(password, 10);
        await user.save();

        return res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email
        })
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ error: "E-mail e senha são obrigatórios!" });

        const user = await User.findOneBy({ email: email });
        if (!user) return res.status(401).json({ error: "Usuário não encontrado." });

        const passwCheck = bcrypt.compareSync(password, user.password);
        if (!passwCheck) return res.status(401).json({ error: "Senha inválida" });

        //Remove todos os Tokens logados
        await Token.delete({ user: { id: user.id } });

        const token = new Token();
        //Gera token aleatório
        let numberRand = Math.random();
        numberRand *= user.id;
        const stringRand = user.id + new Date().getTime().toString();

        token.token = bcrypt.hashSync(stringRand,1).slice(-20);
        //define a data de expiração do token
        token.expireAt = new Date(Date.now()+60*60*1000);

        token.refreshToken = bcrypt.hashSync(stringRand+2,1).slice(-30);

        token.user = user;

        await token.save();
        
        return res.json({
            token: token.token,
            expiresAt: token.expireAt,
            refreshToken: token.refreshToken
        })
    }

    static async refresh (req: Request, res: Response) {
      const { authorization } = req.headers
  
      if (!authorization) return res.status(400).json({ error: 'O refresh token é obrigatório' })
  
      const token = await Token.findOneBy({ refreshToken: authorization })
      if (!token) return res.status(401).json({ error: 'Refresh token inválido' })
  
      // Verifica se o refresh token ainda é válido
      if (token.expireAt < new Date()) {
        await token.remove()
        return res.status(401).json({ error: 'Refresh token expirado' })
      }
  
      // Atualiza os tokens
      token.token = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
      token.refreshToken = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
      token.expireAt = new Date(Date.now() + 60 * 60 * 1000)
      await token.save()
  
      return res.json({
        token: token.token,
        expiresAt: token.expireAt,
        refreshToken: token.refreshToken
      })
    }

    static async logout (req: Request, res: Response) {
      const { authorization } = req.headers
      
      if (!authorization) return res.status(400).json({ error: 'O token é obrigatório' })
  
      // Verifica se o token existe
      const userToken = await Token.findOneBy({ token: authorization })
      if (!userToken) return res.status(401).json({ error: 'Token inválido' })
  
      // Remove o token
      await userToken.remove()
  
      // Retorna uma resposta vazia
      return res.status(204).json()
    }

}