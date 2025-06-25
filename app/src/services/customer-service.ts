// Importando a Conexão com o Banco de Dados
import { Database } from "@/database";
// Importando os Modelos de Cliente
import { CustomerModel } from "@/models/customer-model";
// Importando o Modelo de Usuário
import { UserModel } from "@/models/user-model";

// Definindo a Classe CustomerService
// Esta classe é responsável por gerenciar as operações relacionadas aos clientes, como o registro de novos
export class CustomerService {
  // Método para registrar um novo cliente
  async register(data: {
    name: string; // Nome do cliente
    email: string; // Email do cliente
    user_id: string; // ID do usuário associado ao cliente
    address: string; // Endereço do cliente
    phone: string; // Telefone do cliente
  }) {
    // Desestruturando os dados recebidos
    const { name, address, phone, user_id } = data;
// Instanciando a conexão com o banco de dados
    const connection = await Database.getInstance().getConnection();
    try {
      // Iniciando uma transação para garantir a atomicidade das operações
      await connection.beginTransaction();
      // Inserindo um Consumidor no Banco de Dados
      const customer = await CustomerModel.create(
        {
          user_id: parseInt(user_id), // ID do usuário associado ao cliente
          address, // Endereço do cliente
          phone, // Telefone do cliente
        },
        // Usando a conexão do banco de dados
        { connection }
      );
      // Verificando se o cliente foi criado com sucesso
      await connection.commit();
      // Se o cliente foi criado com sucesso, retornamos os dados do cliente
      return {
        id: customer.id, // ID do cliente
        name, // Nome do cliente
        user_id: user_id, // ID do usuário associado ao cliente
        address, // Endereço do cliente
        phone, // Telefone do cliente
        created_at: customer.created_at, // Data de criação do cliente
      };
    } catch (e) {
      // Se ocorrer um erro, fazemos rollback da transação
      await connection.rollback();
      // Lançamos o erro para ser tratado em outro lugar
      throw e;
    }
  }
}
