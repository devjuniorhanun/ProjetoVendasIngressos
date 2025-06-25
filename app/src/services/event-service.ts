import { EventModel } from "@/models/event-model";

// Classe EventService, Serviço responsável por gerenciar eventos
export class EventService {
  // Método create(). Responsável por criar um novo evento
  async create(data: {
    name: string; // Nome do evento
    description: string | null; // Descrição do evento
    date: Date; // Data do evento
    location: string; // Localização do evento
    partnerId: number; // ID do parceiro associado ao evento
  }) {
    // Desestrutura os dados recebidos
    const { name, description, date, location, partnerId } = data;
    // Chama o modelo de evento para criar um novo evento
    const event = await EventModel.create({
      name, // Nome do evento
      description, // Descrição do evento
      date, // Data do evento
      location, // Localização do evento
      partner_id: partnerId, // ID do parceiro associado ao evento
    });
    // Retorna os dados do evento criado
    return {
      id: event.id, // ID do evento criado
      name, // Nome do evento
      description, // Descrição do evento
      date, // Data do evento
      location, // Localização do evento
      created_at: event.created_at, // Data de criação do evento
      partner_id: partnerId, // ID do parceiro associado ao evento
    };
  }

  // Método findAll(). Responsável por buscar todos os eventos de um parceiro
  async findAll(partnerId?: number) {
    // Retorna todos os eventos associados ao parceiro, se o ID do parceiro for fornecido
    return EventModel.findAll({
      // Se partnerId for fornecido, filtra os eventos por partner_id
      where: { partner_id: partnerId },
    });
  }

  // Método findById(). Responsável por buscar um evento pelo ID
  async findById(eventId: number) {
    // Busca o evento pelo ID usando o EventModel
    return EventModel.findById(eventId);
  }
}