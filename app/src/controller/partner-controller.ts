// Importando as Rotas do express
import { EventService } from "@/services/event-service";
import { PartnerService } from "@/services/partner-service";
import { Router } from "express";


// Criando uma instância do Router
export const partnerRoutes = Router();

// Definindo a Rota de Registro de Parceiros
partnerRoutes.post("/register", async (req, res) => {
    // Recebendo o nome, email, senha e nome da empresa do corpo da requisição
  const { name, email, password, company_name } = req.body;
// Instantia o serviço de parceiros
  const partnerService = new PartnerService();
  // Inserindo um novo parceiro
  const result = await partnerService.register({
    name, // Nome do parceiro
    email, // Email do parceiro
    password, // Senha do parceiro
    company_name, // Nome da empresa do parceiro
  }); 
  // Retornando o resultado da operação
  res.status(201).json(result);
});

// Definindo a Rota de eventos de parceiros
partnerRoutes.post("/events", async (req, res) => {
    // Recebendo os dados do evento do corpo da requisição
  const { name, description, date, location } = req.body;
  // Recebendo o ID do usuário autenticado
  const userId = req.user!.id;
  // Instanciando o serviço de parceiros
  const partnerService = new PartnerService();
    // Buscando o parceiro pelo ID do usuário
  const partner = await partnerService.findByUserId(userId);
// Verificando se o parceiro existe
  if (!partner) {
    // Retornando um erro 403 se o parceiro não for encontrado
    res.status(403).json({ message: "Não autorizado" });
    return;
  }
  // Instanciando o serviço de eventos
  const eventService = new EventService();
  // Criando um novo evento
  const result = await eventService.create({
    name, // Nome do evento
    description, // Descrição do evento
    date: new Date(date), // Data do evento
    location, // Localização do evento
    partnerId: partner.id, // ID do parceiro associado ao evento
  });
  // Retornando o resultado da operação
  res.status(201).json(result);
});

// Definindo a Rota de Listagem de Eventos
partnerRoutes.get("/events", async (req, res) => {
    // Recebendo o ID do usuário autenticado
  const userId = req.user!.id;
    // Instanciando o serviço de parceiros
  const partnerService = new PartnerService();
    // Buscando o parceiro pelo ID do usuário
  const partner = await partnerService.findByUserId(userId);
// Verificando se o parceiro existe
  if (!partner) {
    // Retornando um erro 403 se o parceiro não for encontrado
    res.status(403).json({ message: "Não autorizado" });
    return;
  }
// Instanciando o serviço de eventos
  const eventService = new EventService();
  // Buscando todos os eventos associados ao parceiro
  const result = await eventService.findAll(partner.id);
  // Retornando a lista de eventos
  res.json(result);
});

// Definindo a Rota de Detalhes de Evento
partnerRoutes.get("/events/:eventId", async (req, res) => {
    // Recebendo o ID do evento dos parâmetros da requisição
  const { eventId } = req.params;
    // Recebendo o ID do usuário autenticado
  const userId = req.user!.id;
// Instanciando o serviço de parceiros
  const partnerService = new PartnerService();
    // Buscando o parceiro pelo ID do usuário
  const partner = await partnerService.findByUserId(userId);
// Verificando se o parceiro existe
  if (!partner) {
    // Retornando um erro 403 se o parceiro não for encontrado
    res.status(403).json({ message: "Não autorizado" });
    return;
  }

  // Instanciando o serviço de eventos
  const eventService = new EventService();
  // Buscando o evento pelo ID
  const event = await eventService.findById(+eventId);
// Verificando se o evento foi encontrado e se pertence ao parceiro
  if (!event || event.partner_id !== partner.id) {
    res.status(404).json({ message: "Evento não encontrado ou não autorizado" });
  }
// Retornando o evento encontrado
  res.json(event);
});