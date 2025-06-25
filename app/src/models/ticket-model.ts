// Importando a conexão com o banco de dados
import { Database } from "@/database";
// Importando os tipos necessários do MySQL
import { ResultSetHeader, RowDataPacket, PoolConnection } from "mysql2/promise";

// Definindo o enum para os status dos ingressos
export enum TicketStatus {
  available = "available",
  sold = "sold",
}

// Definindo a classe TicketModel
export class TicketModel {
  id: number; // Identificador único do ingresso
  location: string; // Localização do ingresso (por exemplo, assento)
  event_id: number; // Identificador do evento associado ao ingresso
  price: number; // Preço do ingresso
  status: TicketStatus; // Status do ingresso (disponível ou vendido)
  created_at: Date; // Data de criação do ingresso

  // Método construtor
  constructor(data: Partial<TicketModel> = {}) {
    // Preenchendo os dados do ingresso
    this.fill(data);
  }

  // Método create(), Responsavel por criar um novo ingresso
  static async create(data: {
    location: string; // Localização do ingresso
    event_id: number; // Identificador do evento associado ao ingresso
    price: number; // Preço do ingresso
    status: TicketStatus; // Status do ingresso (disponível ou vendido) 
  }): Promise<TicketModel> {
    // Obtendo a instância do banco de dados  
    const db = Database.getInstance();
    // Definindo a data de criação como a data atual
    const created_at = new Date();
    // Executando a consulta SQL para inserir o novo ingresso na tabela 'tickets'
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO tickets (location, event_id, price, status, created_at) VALUES (?, ?, ?, ?, ?)",
      [data.location, data.event_id, data.price, data.status, created_at]
    );
    // Instanciando um novo TicketModel
    const ticket = new TicketModel({
      ...data, // Preenchendo os dados do ingresso
      created_at, // Definindo a data de criação
      id: result.insertId, // Atribuindo o ID gerado pelo banco de dados
    });
    // Retornando o novo ingresso
    return ticket;
  }
  
  // Método createMany(), Responsavel por criar vários ingressos
  static async createMany(
    // Recebendo os dados dos ingressos a serem criados
    data: {
      location: string; // Localização do ingresso
      event_id: number; // Identificador do evento associado ao ingresso
      price: number; // Preço do ingresso
      status: TicketStatus; // Status do ingresso (disponível ou vendido)
    }[]
  ): Promise<TicketModel[]> {
    // Obtendo a instância do banco de dados
    const db = Database.getInstance();
    // Definindo a data de criação como a data atual
    const created_at = new Date();
    // Verificando se há dados para inserir
    const values = Array(data.length).fill("(?, ?, ?, ?, ?)").join(", ");
    // Se não houver dados, retorna um array vazio
    const params = data.reduce<(string | number | Date)[]>(
      // Acumulando os parâmetros para a consulta SQL
      (acc, ticket) => [
        ...acc, // Acumulando os parâmetros anteriores
        ticket.location, // Localização do ingresso
        ticket.event_id, // Identificador do evento associado ao ingresso
        ticket.price, // Preço do ingresso
        ticket.status, // Status do ingresso (disponível ou vendido)
        created_at, // Data de criação do ingresso
      ],
      []
    );
    // Executando a consulta SQL para inserir os ingressos na tabela 'tickets'
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO tickets (location, event_id, price, status, created_at) VALUES ${values}`,
      params
    );
    // Mapeando os dados recebidos para instâncias de TicketModel
    const tickets = data.map(
      // Indexando os ingressos para atribuir IDs únicos  
      (ticket, index) =>
        // Criando uma nova instância de TicketModel com os dados do ingresso
        new TicketModel({
          ...ticket, // Preenchendo os dados do ingresso
          created_at, // Definindo a data de criação
          id: result.insertId + index, // Atribuindo o ID gerado pelo banco de dados, incrementando pelo índice
        })
    );
    // Retornando os ingressos criados
    return tickets;
  }

  // Método findById(), Responsavel por buscar um ingresso pelo ID
  static async findById(id: number): Promise<TicketModel | null> {
    // Obtendo a instância do banco de dados
    const db = Database.getInstance(); 
    // Executando a consulta SQL para buscar o ingresso pelo ID
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );
    // Se não houver resultados, retorna null
    return rows.length ? new TicketModel(rows[0] as TicketModel) : null;
  }

  // Método findAll(), Responsavel por buscar todos os ingressos com filtros opcionais
  static async findAll(filter?: {
    // Filtros opcionais para buscar ingressos
    where?: { event_id?: number; ids?: number[] };
    // Filtro por ID do evento ou IDs específicos dos ingressos
  }, options?: { connection?: PoolConnection }): Promise<TicketModel[]> {
    // Obtendo a instância do banco de dados ou usando a conexão fornecida
    const db = options?.connection ?? Database.getInstance();
    // Definindo a consulta SQL para buscar todos os ingressos
    let query = "SELECT * FROM tickets";
    // Inicializando os parâmetros para a consulta
    const params = [];
    // Verificando se há filtros para aplicar
    if (filter && filter.where) {
      // Construindo a cláusula WHERE com base nos filtros fornecidos
      const where = [];
      // Verificando se há um ID de evento para filtrar
      if (filter.where.event_id) {
        // Adicionando a condição para o ID do evento
        where.push("event_id = ?");
        // Adicionando o ID do evento aos parâmetros
        params.push(filter.where.event_id);
      }
      // Verificando se há IDs específicos dos ingressos para filtrar
      if (filter.where.ids) {
        // Adicionando a condição para os IDs dos ingressos
        where.push(`id IN (${filter.where.ids.map(() => "?").join(", ")})`);
        // Adicionando os IDs dos ingressos aos parâmetros
        params.push(...filter.where.ids);
      }
      // Se houver condições na cláusula WHERE, adiciona a cláusula WHERE à consulta
      query += ` WHERE ${where.join(" AND ")}`;
    }
    // Executando a consulta SQL com os parâmetros fornecidos
    const [rows] = await db.execute<RowDataPacket[]>(query, params);
    // Mapeando os resultados para instâncias de TicketModel
    return rows.map((row) => new TicketModel(row as TicketModel));
  }

  // Método findByEventId(), Responsavel por buscar ingressos pelo ID do evento
  async update(): Promise<void> {
    // Obtendo a instância do banco de dados
    const db = Database.getInstance();
    // Executando a consulta SQL para atualizar os dados do ingresso  
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET location = ?, event_id = ?, price = ?, status = ? WHERE id = ?",
      [this.location, this.event_id, this.price, this.status, this.id]
    );
    // Verificando se nenhuma linha foi afetada
    if (result.affectedRows === 0) {
      // Lança um erro indicando que o ingresso não foi encontrado
      throw new Error("Tickect não encontrado");
    }
  }

  // Método delete(), Responsavel por deletar o ingresso
  async delete(): Promise<void> {
    // Obtendo a instância do banco de dados
    const db = Database.getInstance();
    // Executando a consulta SQL para deletar o ingresso pelo ID
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM tickets WHERE id = ?",
      [this.id]
    );
    // Verificando se nenhuma linha foi afetada
    if (result.affectedRows === 0) {
      // Lança um erro indicando que o ingresso não foi encontrado
      throw new Error("Ticket não encontrado");
    }
  }

  // Método fill(), Responsavel por preencher os dados do ingresso
  fill(data: Partial<TicketModel>): void {
    if (data.id !== undefined) this.id = data.id; // Preenche o ID do ingresso
    if (data.location !== undefined) this.location = data.location; // Preenche a localização do ingresso
    if (data.event_id !== undefined) this.event_id = data.event_id; // Preenche o ID do evento associado ao ingresso
    if (data.price !== undefined) this.price = data.price; // Preenche o preço do ingresso
    if (data.status !== undefined) this.status = data.status; // Preenche o status do ingresso (disponível ou vendido)
    if (data.created_at !== undefined) this.created_at = data.created_at; // Preenche a data de criação do ingresso
  }
}