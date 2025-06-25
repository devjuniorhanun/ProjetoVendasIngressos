// Importando as Rotas do express
import { PartnerService } from "@/services/partner-service";
import { TicketService } from "@/services/ticket-service";
import { Router } from "express";


// Criando uma instância do Router
export const ticketRoutes = Router();

// Definindo a Rota de Criação de Ingressos
ticketRoutes.post("/:eventId/tickets", async (req, res) => {
    // Recebendo o ID do usuário autenticado
  const userId = req.user!.id;
  // Verificando se o usuário é um parceiro
  const partnerService = new PartnerService();
  // Buscando o parceiro pelo ID do usuário
  const partner = await partnerService.findByUserId(userId);
// Verificando se o parceiro existe
  if (!partner) {
    // Retornando um erro 403 se o parceiro não for encontrado
    res.status(403).json({ message: "Not authorized" });
    return;
  }
// Recebendo o número de ingressos e o preço do corpo da requisição
  const { num_tickets, price } = req.body;
  // Recebendo o ID do evento dos parâmetros da parametros
  const { eventId } = req.params;
  // Instanciando o serviço de ingressos
  const ticketService = new TicketService();
  // Verificando se o evento pertence ao parceiro
  await ticketService.createMany({
    eventId: +eventId, // ID do evento
    numTickets: num_tickets, // Número de ingressos a serem criados
    price, // Preço de cada ingresso
  });
  // Enviando uma resposta de sucesso
  res.status(204).send();
});

// Definindo a Rota de Listagem de Ingressos
ticketRoutes.get("/:eventId/tickets", (req, res) => {});

// Definindo a Rota de Detalhes de Ingresso
ticketRoutes.get("/:eventId/tickets/:ticketId", (req, res) => {});