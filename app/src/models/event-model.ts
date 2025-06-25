import { Database } from "@/database";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

// Classe EventModel, Responsável por gerenciar os eventos
export class EventModel {
  id: number; // Identificador único do evento
  name: string; // Nome do evento
  description: string | null; // Descrição do evento (pode ser nulo)
  date: Date; // Data do evento
  location: string; // Localização do evento
  created_at: Date; // Data de criação do evento
  partner_id: number; // ID do parceiro associado ao evento

  // Método construtor, Responsável por inicializar os dados do evento
  constructor(data: Partial<EventModel> = {}) {
    // Inicializa os atributos do evento com os dados fornecidos
    this.fill(data);
  }

  // Método create(), Responsável por criar um novo evento
  static async create(data: {
    name: string; // Nome do evento
    description: string | null; // Descrição do evento (pode ser nulo)
    date: Date; // Data do evento
    location: string; // Localização do evento
    partner_id: number; // ID do parceiro associado ao evento
    // Retorna uma Promise que resolve para uma instância de EventModel
  }): Promise<EventModel> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Define a data de criação do evento como a data atual
    const created_at = new Date();
    // Executa a consulta SQL para inserir o novo evento na tabela 'events'
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO events (name, description, date, location, created_at, partner_id) VALUES (?, ?, ?, ?, ?, ?)",
      [
        data.name, // Nome do evento
        data.description, // Descrição do evento
        data.date, // Data do evento
        data.location, // Localização do evento
        created_at, // Data de criação do evento
        data.partner_id, // ID do parceiro associado ao evento
      ]
    );
    // Instancia um novo EventModel
    const event = new EventModel({
      ...data, // Preenche os dados do evento com os dados fornecidos
      created_at, // Define a data de criação do evento
      id: result.insertId, // Define o ID do evento como o ID gerado pelo banco de dados
    });
    // Retorna a instância do evento criado
    return event;
  }

  // Método findById(), Responsável por buscar um evento pelo ID
  static async findById(id: number): Promise<EventModel | null> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para buscar o evento pelo ID
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM events WHERE id = ?",
      [id]
    );
    // Verifica se algum evento foi encontrado
    return rows.length ? new EventModel(rows[0] as EventModel) : null;
  }

  // Método findAll(), Responsável por buscar todos os eventos, com opção de filtro por parceiro
  static async findAll(filter?: {
    // Parâmetros de filtro, como o ID do parceiro
    where?: { partner_id?: number };
    // Retorna uma Promise que resolve para um array de instâncias de EventModel
  }): Promise<EventModel[]> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Define a consulta SQL para buscar todos os eventos
    let query = "SELECT * FROM events";
    // Inicializa um array para os parâmetros da consulta
    const params = [];
    // Se houver um filtro, adiciona a cláusula WHERE para filtrar por partner_id
    if (filter && filter.where) {
      // Verifica se o filtro contém o ID do parceiro
      if (filter.where.partner_id) {
        // Adiciona a cláusula WHERE e o parâmetro correspondente
        query += " WHERE partner_id = ?";
        // Adiciona o ID do parceiro aos parâmetros da consulta
        params.push(filter.where.partner_id);
      }
    }
    // Executa a consulta SQL com os parâmetros fornecidos  
    const [rows] = await db.execute<RowDataPacket[]>(query, params);
    // Mapeia os resultados para instâncias de EventModel e retorna o array
    return rows.map((row) => new EventModel(row as EventModel));
  }

  // Método findAllWithUser(), Responsável por buscar todos os eventos com informações do parceiro associado
  async update(): Promise<void> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para atualizar os dados do evento
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE events SET name = ?, description = ?, date = ?, location = ?, partner_id = ? WHERE id = ?",
      [
        this.name,  // Nome do evento
        this.description, // Descrição do evento
        this.date, // Data do evento
        this.location, // Localização do evento
        this.partner_id, // ID do parceiro associado ao evento
        this.id, // ID do evento a ser atualizado
      ]
    );
    // Verifica se nenhuma linha foi afetada
    if (result.affectedRows === 0) {
      throw new Error("Evento não encontrado");
    }
  }

  // Método delete(), Responsável por deletar o evento
  async delete(): Promise<void> {
    // Obtém a instância do banco de dados
    const db = Database.getInstance();
    // Executa a consulta SQL para deletar o evento pelo ID
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM events WHERE id = ?",
      [this.id]
    );
    // Verifica se nenhuma linha foi afetada
    if (result.affectedRows === 0) {
      // Lança um erro indicando que o evento não foi encontrado
      throw new Error("Evento não encontrado");
    }
  }

  // Método fill(), Responsável por preencher os dados do evento
  fill(data: Partial<EventModel>): void {
    if (data.id !== undefined) this.id = data.id; // Preenche o ID do evento
    if (data.name !== undefined) this.name = data.name; // Preenche o nome do evento
    if (data.description !== undefined) this.description = data.description; // Preenche a descrição do evento
    if (data.date !== undefined) this.date = data.date; // Preenche a data do evento
    if (data.location !== undefined) this.location = data.location; // Preenche a localização do evento
    if (data.created_at !== undefined) this.created_at = data.created_at; // Preenche a data de criação do evento
    if (data.partner_id !== undefined) this.partner_id = data.partner_id; // Preenche o ID do parceiro associado ao evento
  }
}