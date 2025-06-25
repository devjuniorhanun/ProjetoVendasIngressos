// Importando as dependências necessárias
import { Database } from "@/database";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { UserModel } from "./user-model";

// Definindo a classe CustomerModel
export class CustomerModel {
  id: number; // Identificador único do Consumidor
  user_id: number; // Identificador do usuário associado ao Consumidor
  address: string; // Endereço do Consumidor
  phone: string; // Telefone do Consumidor
  created_at: Date; // Data de criação do Consumidor
  user?: UserModel; // Objeto opcional do usuário associado ao Consumidor

  // Método construtor
  constructor(data: Partial<CustomerModel> = {}) {
    // Preenchendo os dados do Consumidor com os valores fornecidos
    this.fill(data);
  }
  // Método estático para criar um novo Consumidor
  static async create(
    // Recebe os dados do Consumidor a serem criados
    data: { user_id: number; address: string; phone: string },
    // Opções adicionais, como conexão de banco de dados
    options?: { connection?: PoolConnection }
  ): Promise<CustomerModel> {
    // Obtém a instância do banco de dados ou usa a conexão fornecida
    const db = options?.connection ?? Database.getInstance();
    // Define a data de criação como a data atual
    const created_at = new Date();
    // Executa a consulta SQL para inserir o novo Consumidor na tabela 'customers'
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)",
      [data.user_id, data.address, data.phone, created_at]
    );
    // Instancia um novo Consumidor
    const customer = new CustomerModel({
      ...data, // Preenche os dados do Consumidor
      created_at, // Define a data de criação
      id: result.insertId, // Atribui o ID gerado pelo banco de dados
    });
    // REtorna o novo Consumidor
    return customer;
  }

  // Método para pesquisar um Consumidor pelo ID
  static async findById(
    id: number, // Recebe o id do Consumidor
    options?: { user?: boolean } // Opções adicionais, como incluir dados do usuário
  ): Promise<CustomerModel | null> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Define a consulta SQL para buscar o Consumidor pelo ID
    let query = "SELECT * FROM customers WHERE id = ?";
    // Se a opção 'user' for verdadeira, inclui os dados do usuário na consulta
    if (options?.user) {
      // Define a consulta SQL para buscar o Consumidor e os dados do usuário
      query =
        "SELECT c.*, users.id as user_id, users.name as user_name, users.email as user_email FROM customers c JOIN users ON c.user_id = users.id WHERE c.id = ?";
    }
    // Executa a consulta SQL com o ID fornecido
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    // Se não houver resultados, retorna null
    if (rows.length === 0) return null;
    // Cria uma nova instância de CustomerModel com os dados do primeiro resultado
    const customer = new CustomerModel(rows[0] as CustomerModel);
    // Se a opção 'user' for verdadeira, preenche os dados do usuário associado ao Consumidor
    if (options?.user) {
      // Cria uma nova instância de UserModel com os dados do usuário
      customer.user = new UserModel({
        id: rows[0].user_id, // Atribui o ID do usuário
        name: rows[0].user_name, // Atribui o nome do usuário
        email: rows[0].user_email, // Atribui o email do usuário
      });
    }
    // Retorna o Consumidor encontrado
    return customer;
  }
  // Método findByUserId(), Responsavel por buscar os dados do usuário
  static async findByUserId(
    user_id: number, // Recebe o ID do usuário
    options?: { user?: boolean } // Opções adicionais, como incluir dados do usuário
  ): Promise<CustomerModel | null> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Define a consulta SQL para buscar o Consumidor pelo ID do usuário
    let query = "SELECT * FROM customers WHERE user_id = ?";
    // Se a opção 'user' for verdadeira, inclui os dados do usuário na consulta
    if (options?.user) {
      // Define a consulta SQL para buscar o Consumidor e os dados do usuário
      query =
        "SELECT c.*, users.id as user_id, users.name as user_name, users.email as user_email FROM customers c JOIN users ON c.user_id = users.id WHERE c.user_id = ?";
    }
    // Executa a consulta SQL com o ID do usuário fornecido
    const [rows] = await db.execute<RowDataPacket[]>(query, [user_id]);

    // Se não houver resultados, retorna null
    if (rows.length === 0) return null;
    // Cria uma nova instância de CustomerModel com os dados do primeiro resultado
    const customer = new CustomerModel(rows[0] as CustomerModel);
    // Se a opção 'user' for verdadeira, preenche os dados do usuário associado ao Consumidor
    if (options?.user) {
      // Cria uma nova instância de UserModel
      customer.user = new UserModel({
        id: rows[0].user_id, // Atribui o ID do usuário
        name: rows[0].user_name, // Atribui o nome do usuário
        email: rows[0].user_email, // Atribui o email do usuário
      });
    }
    // Retorna o Consumidor encontrado
    return customer;
  }

  // Método findAll(), Responsavel por buscar todos os consumidores
  static async findAll(): Promise<CustomerModel[]> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para buscar todos os consumidores
    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM customers");
    // Mapeia os resultados para instâncias de CustomerModel
    return rows.map((row) => new CustomerModel(row as CustomerModel));
  }

  // Método update(), Responsavel por atualizar os dados do consumidor
  async update(): Promise<void> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para atualizar os dados do consumidor
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE customers SET user_id = ?, address = ?, phone = ? WHERE id = ?",
      [this.user_id, this.address, this.phone, this.id]
    );
    // Se nenhuma linha foi afetada
    if (result.affectedRows === 0) {
      // Lança um erro indicando que o consumidor não foi encontrado
      throw new Error("Consumindor não encontrado");
    }
  }

  // Método delete(), Responsavel por deletar o consumidor
  async delete(): Promise<void> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para deletar o consumidor pelo ID
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM customers WHERE id = ?",
      [this.id]
    );
    // Verifica se nenhuma linha foi afetada
    if (result.affectedRows === 0) {
      // Lança um erro indicando que o consumidor não foi encontrado
      throw new Error("Consumidor não encontrado");
    }
  }

  // Método fill(), Responsavel por preencher os dados do consumidor
  fill(data: Partial<CustomerModel>): void {
    if (data.id !== undefined) this.id = data.id; // Preenche o ID do consumidor
    if (data.user_id !== undefined) this.user_id = data.user_id; // Preenche o ID do usuário associado
    if (data.address !== undefined) this.address = data.address; // Preenche o endereço do consumidor
    if (data.phone !== undefined) this.phone = data.phone; // Preenche o telefone do consumidor
    if (data.created_at !== undefined) this.created_at = data.created_at; // Preenche a data de criação do consumidor
  }
}