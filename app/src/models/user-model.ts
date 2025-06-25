import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import bcrypt from "bcrypt";
import { Database } from "@/database";

// UserModel é uma classe que representa um usuário no sistema.
export class UserModel {
  id: number; // Identificador único do usuário
  name: string; // Nome do usuário
  email: string; // Email do usuário
  password: string; // Senha do usuário
  created_at: Date; // Data de criação do usuário

  // Método construtor
  constructor(data: Partial<UserModel> = {}) {
    // Preenche os dados do usuário com os valores fornecidos
    this.fill(data);
  }
// Método estático para criar um novo usuário no banco de dados
  static async create(
    // Parâmetros de entrada: dados do usuário
    data: {
      name: string; // Nome do usuário
      email: string; // Email do usuário
      password: string; // Senha do usuário
    },
    // Opções adicionais, como conexão com o banco de dados
    options?: { connection?: PoolConnection }
    // Retorna uma Promise que resolve para um objeto UserModel
  ): Promise<UserModel> {
    // Obtém a instância do banco de dados
    const db = options?.connection ?? Database.getInstance();
    // Define a data de criação do usuário
    const created_at = new Date();
    // Gera o hash da senha usando bcrypt
    const hashedPassword = UserModel.hashPassword(data.password);
    // Executa a consulta SQL para inserir o usuário no banco de dados
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
      [data.name, data.email, hashedPassword, created_at]
    );
    // Cria uma nova instância de UserModel com os dados inseridos
    const user = new UserModel({
      ...data, // Espalha os dados do usuário
      password: hashedPassword, // Usa a senha Cryptografada
      created_at, // Define a data de criação
      id: result.insertId, // Define o ID do usuário como o ID inserido 
    });
    // Retorna o usuário criado
    return user;
  }
// Método estático para gerar um hash da senha
  static hashPassword(password: string): string {
    // Retorna a senha criptografada usando bcrypt
    return bcrypt.hashSync(password, 10);
  }
// Método estático para comparar uma senha criptografada
  static comparePassword(password: string, hash: string): boolean {
    // Retorna verdadeiro se a senha fornecida corresponder ao hash
    return bcrypt.compareSync(password, hash);
  }

  // Método estático para encontrar um usuário pelo ID
  static async findById(id: number): Promise<UserModel | null> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para buscar o usuário pelo ID
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    // Se houver resultados, retorna uma nova instância de UserModel com os dados do usuário
    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  // Método estático para encontrar um usuário pelo email
  static async findByEmail(email: string): Promise<UserModel | null> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para buscar o usuário pelo email
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    // Se houver resultados, retorna uma nova instância de UserModel com os dados do usuário
    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  // Método estático para encontrar todos os usuários
  static async findAll(): Promise<UserModel[]> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para buscar todos os usuários
    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM users");
    // Mapeia os resultados para instâncias de UserModel e as retorna
    return rows.map((row) => new UserModel(row as UserModel));
  }
// Método de instância para atualizar os dados do usuário
  async update(): Promise<void> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para atualizar os dados do usuário
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
      [this.name, this.email, this.password, this.id]
    );
    // Verifica se a atualização afetou alguma linha
    if (result.affectedRows === 0) {
      // Retorna um erro se o usuário não foi encontrado
      throw new Error("Usuário não encontrado");
    }
  }

  // Método de instância para deletar o usuário
  async delete(): Promise<void> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para deletar o usuário pelo ID
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM users WHERE id = ?",
      [this.id]
    );
    // Verifica se a deleção afetou alguma linha
    if (result.affectedRows === 0) {
      // Retorna um erro se o usuário não foi encontrado
      throw new Error("Usuário não encontrado");
    }
  }

  // Método para preencher os dados do usuário com os valores fornecidos
  fill(data: Partial<UserModel>): void {
    // Verifica se cada campo está definido e o preenche com o valor correspondente
    if (data.id !== undefined) this.id = data.id;
    // Verifica se o nome está definido e o preenche
    if (data.name !== undefined) this.name = data.name;
    // Verifica se o email está definido e o preenche
    if (data.email !== undefined) this.email = data.email;
    // Verifica se a senha está definida e a preenche
    if (data.password !== undefined) this.password = data.password;
    // Verifica se a data de criação está definida e a preenche
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}