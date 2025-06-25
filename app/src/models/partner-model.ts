import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { UserModel } from "./user-model";
import { Database } from "@/database";

// Class PartnerModel, Responsavel por gerenciar os parceiros do sistema
export class PartnerModel {
  id: number; // Identificador único do parceiro
  user_id: number; // ID do usuário associado ao parceiro
  company_name: string; // Nome da empresa do parceiro
  created_at: Date; // Data de criação do parceiro
  user?: UserModel; // Informações do usuário associado ao parceiro (opcional)

  // Método construtor, Responsavel por inicializar os dados do parceiro
  constructor(data: Partial<PartnerModel> = {}) {
    // Inicializa os atributos do parceiro com os dados fornecidos
    this.fill(data);
  }

  // Método create(), Responsavel por criar um novo parceiro
  static async create(
    // Parâmetros de entrada: dados do parceiro a serem criados
    data: { user_id: number; company_name: string },
    // Opções adicionais, como conexão de banco de dados
    options?: { connection?: PoolConnection }
    // Retorna uma Promise que resolve para uma instância de PartnerModel
  ): Promise<PartnerModel> {
    // Obtém a instância do banco de dados, ou usa a conexão fornecida nas opções
    const db = options?.connection ?? Database.getInstance();
    // Define a data de criação do parceiro como a data atual
    const created_at = new Date();
    // Executa a consulta SQL para inserir o novo parceiro na tabela 'partners'
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)",
      [data.user_id, data.company_name, created_at]
    );
    // Instancia um novo PartnerModel
    const partner = new PartnerModel({
      ...data, // Preenche os dados do parceiro com os dados fornecidos
      created_at, // Define a data de criação do parceiro
      id: result.insertId, // Define o ID do parceiro como o ID gerado pelo banco de dados
    });
    // Retorna a instância do parceiro criado
    return partner;
  }
  // Método findById(), Responsavel por buscar um parceiro pelo ID
  static async findById(
    id: number, // Parâmetro de entrada: ID do parceiro a ser buscado
    options?: { user?: boolean }  // Opções adicionais, como incluir informações do usuário associado
    // Retorna uma Promise que resolve para uma instância de PartnerModel ou null se não encontrado
  ): Promise<PartnerModel | null> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Define a consulta SQL para buscar o parceiro pelo ID
    let query = "SELECT * FROM partners WHERE id = ?";
    // Se a opção 'user' for verdadeira, inclui informações do usuário associado
    if (options?.user) {
      query =
        "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p JOIN users ON p.user_id = users.id WHERE p.id = ?";
    }
    // Executa a consulta SQL com o ID do parceiro
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    // Se não houver resultados, retorna null
    if (rows.length === 0) return null;
    // Cria uma nova instância de PartnerModel com os dados do primeiro resultado
    const partner = new PartnerModel(rows[0] as PartnerModel);
    // Se a opção 'user' for verdadeira, preenche as informações do usuário associado
    if (options?.user) {
      // Cria uma nova instância de UserModel com os dados do usuário associado
      partner.user = new UserModel({
        id: rows[0].user_id, // Preenche o ID do usuário
        name: rows[0].user_name, // Preenche o nome do usuário
        email: rows[0].user_email, // Preenche o email do usuário
      });
    }
    // Retorna a instância do parceiro encontrado
    return partner;
  }
  // Método findByUserId(), Responsavel por buscar um parceiro pelo ID do usuário
  static async findByUserId(
    userId: number, // Parâmetro de entrada: ID do usuário associado ao parceiro
    options?: { user?: boolean } // Opções adicionais, como incluir informações do usuário associado
  ): Promise<PartnerModel | null> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Define a consulta SQL para buscar o parceiro pelo ID do usuário
    let query = "SELECT * FROM partners WHERE user_id = ?";
    // Se a opção 'user' for verdadeira, inclui informações do usuário associado
    if (options?.user) {
      // Consulta SQL que busca o parceiro e as informações do usuário associado
      query =
        "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p JOIN users ON p.user_id = users.id WHERE p.user_id = ?";
    }
    // Executa a consulta SQL com o ID do usuário
    const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
    // Se não houver resultados, retorna null
    if (rows.length === 0) return null;
    // Cria uma nova instância de PartnerModel com os dados do primeiro resultado
    const partner = new PartnerModel(rows[0] as PartnerModel);
    // Se a opção 'user' for verdadeira, preenche as informações do usuário associado
    if (options?.user) {
      // Cria uma nova instância de UserModel com os dados do usuário associado
      partner.user = new UserModel({
        id: rows[0].user_id, // Preenche o ID do usuário
        name: rows[0].user_name, // Preenche o nome do usuário
        email: rows[0].user_email, // Preenche o email do usuário
      });
    }
    // Retorna a instância do parceiro encontrado
    return partner;
  }

  // Método findAll(), Responsavel por buscar todos os parceiros
  static async findAll(): Promise<PartnerModel[]> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para buscar todos os parceiros
    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM partners");
    // Mapeia os resultados para instâncias de PartnerModel
    return rows.map((row) => new PartnerModel(row as PartnerModel));
  }

  // Método findAllWithUser(), Responsavel por buscar todos os parceiros com informações do usuário associado
  async update(): Promise<void> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para atualizar os dados do parceiro
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE partners SET user_id = ?, company_name = ? WHERE id = ?",
      [this.user_id, this.company_name, this.id]
    );
    // Verifica se nenhuma linha foi afetada
    if (result.affectedRows === 0) {
      // Lança um erro indicando que o parceiro não foi encontrado
      throw new Error("Parceiro não encontrado");
    }
  }
  // Método delete(), Responsavel por deletar o parceiro
  async delete(): Promise<void> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para deletar o parceiro pelo ID
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM partners WHERE id = ?",
      [this.id]
    );
    // Verifica se nenhuma linha foi afetada
    if (result.affectedRows === 0) {
      // Lança um erro indicando que o parceiro não foi encontrado
      throw new Error("Parceiro não encontrado");
    }
  }

  // Método fill(), Responsavel por preencher os dados do parceiro
  fill(data: Partial<PartnerModel>): void {
    if (data.id !== undefined) this.id = data.id; // Preenche o ID do parceiro
    if (data.user_id !== undefined) this.user_id = data.user_id; // Preenche o ID do usuário associado ao parceiro
    if (data.company_name !== undefined) this.company_name = data.company_name; // Preenche o nome da empresa do parceiro
    if (data.created_at !== undefined) this.created_at = data.created_at; // Preenche a data de criação do parceiro
  }
}