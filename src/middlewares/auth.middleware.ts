import { NextFunction, Request, Response } from "express";
import Token from "../models/token.entity";

export default async function authMiddleware(req:Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).json({error: "Token não informado."});

    const userToken = await Token.findOneBy({token: authorization});
    if(!userToken) return res.status(401).json({error:"Token não encontrado."});

    if(userToken.expireAt < new Date()){
        await userToken.remove();
        return res.status(401).json({error:"Token expirado."});
    }

    req.headers.userId = userToken.userId.toString();

    next();
}