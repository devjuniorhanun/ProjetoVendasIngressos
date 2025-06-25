// Importação do Model de Evento e Ticket
import { EventModel } from "@/models/event-model";
import { TicketModel, TicketStatus } from "@/models/ticket-model";

// Serviço de Tickets
export class TicketService {
  // Método para criar um ticket
  async createMany(data: {
    eventId: number; // ID do Evento
    numTickets: number; // Número de Tickets a serem criados
    price: number; // Preço do Ticket
  }) {
    // Busca o Evento pelo ID
    const event = await EventModel.findById(data.eventId);
// Verifica se o Evento existe
    if (!event) {
      // Se não existir, lança um erro
      throw new Error("Evento não encontrado");
    }
// Cria um array de objetos de tickets
    const ticketsData = Array(data.numTickets)
    // Preenche o array com objetos de tickets
      .fill({})
      // Mapeia cada item do array para um objeto de ticket
      .map((_, index) => ({
        // Define as propriedades do ticket
        location: `Location ${index}`, // Localização do Ticket
        event_id: event.id, // ID do Evento associado ao Ticket
        price: data.price, // Preço do Ticket
        status: TicketStatus.available, // Status do Ticket (disponível)
      }));
// Cria os tickets no banco de dados
    await TicketModel.createMany(ticketsData);
  }
}