import { UserModel } from "@/models/user-model";

// Classe UserService, responsável por buscar usuários
export class UserService {
  // Método findById, que recebe um userId
  async findById(userId: number) {
    // Busca o usuário pelo ID usando o UserModel
    return UserModel.findById(userId);
  }
  // Método findByEmail, que recebe um email
  async findByEmail(email: string) {
    // Busca o usuário pelo email usando o UserModel
    return UserModel.findByEmail(email);
  }
}