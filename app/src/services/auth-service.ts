import { UserModel } from "@/models/user-model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Classe AuthService, responsável por autenticar usuários
export class AuthService {
  // Método login, que recebe email e senha
  async login(email: string, password: string) {
    // Busca o usuário pelo email
    const userModel = await UserModel.findByEmail(email);
    // Se o usuário existir e a senha for válida, retorna um token JWT
    if (userModel && bcrypt.compareSync(password, userModel.password)) {
      // Gera um token JWT com o id e email do usuário, com expiração de 1 hora
      return jwt.sign({ id: userModel.id, email: userModel.email }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRATION || "1h", // Define o tempo de expiração do token
      });
      // Se as credenciais forem inválidas
    } else {
      // Lança um erro de credenciais inválidas
      throw new InvalidCredentialsError();
    }
  }
}
// Classe de erro personalizada para credenciais inválidas
export class InvalidCredentialsError extends Error { }