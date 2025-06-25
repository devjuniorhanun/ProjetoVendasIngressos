import { Database } from "@/database";
import { PartnerModel } from "@/models/partner-model";
import { UserModel } from "@/models/user-model";

// Classe PartnerService, Serviço responsável por registrar parceiros
export class PartnerService {
  // Método register, que recebe os dados do parceiro
  async register(data: {
    name: string; // Nome do parceiro
    email: string; // Email do parceiro
    user_id: number; // ID do usuário associado ao parceiro 
    company_name: string; // Nome da empresa do parceiro
  }) {
    // Desestrutura os dados recebidos
    const { name, email, company_name, user_id } = data;

    // Pega a instância do banco de dados
    const connection = await Database.getInstance().getConnection();
    
    try {
      // Inicia a transação
      await connection.beginTransaction();
      // Inserir um novo Pareceiro
      const partner = await PartnerModel.create(
        {
          company_name, // Nome da empresa do parceiro
          user_id: user_id, // ID do usuário associado ao parceiro
        },
        // Conexão com o banco de dados 
        { connection }
      );

      // Realiza o registro do parceiro
      await connection.commit();
      // Retorna os dados do parceiro registrado
      return {
        id: partner.id, // ID do parceiro registrado
        name, // Nome do parceiro
        user_id: user_id, // ID do usuário associado ao parceiro
        company_name, // Nome da empresa do parceiro
        created_at: partner.created_at, // Data de criação do parceiro
      };
    } catch (e) {
      // Se ocorrer um erro, desfaz a transação
      await connection.rollback();
      // Lança o erro para ser tratado em outro lugar
      throw e;
    }
  }

  // Método findByUserId, que recebe um userId
  async findByUserId(userId: number) {
    // Busca o parceiro pelo ID do usuário usando o PartnerModel
    return PartnerModel.findByUserId(userId);
  }
}