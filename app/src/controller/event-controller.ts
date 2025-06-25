// Importando as Rotas do Express
import { EventService } from "@/services/event-service";
import { Router } from "express";

// Criando uma instância do Router
export const eventRoutes = Router();

// Definindo a Rota de Listagem de Eventos
eventRoutes.get("/", async (req, res) => {
    // Instanciando o serviço de eventos
    const eventService = new EventService();
    // Buscando todos os eventos
    const result = await eventService.findAll();
    // Retornando a lista de eventos
    res.json(result);
});

// Definindo a Rota de Detalhes de Evento
eventRoutes.get("/:eventId", async (req, res) => {
    // Recebendo o ID do evento dos parâmetros da requisição
    const { eventId } = req.params;
    // Instanciando o serviço de eventos
    const eventService = new EventService();
    // Buscando o evento pelo ID
    const event = await eventService.findById(+eventId);

    // Verificando se o evento foi encontrado
    if (!event) {
        // Retornando um erro 404 se o evento não for encontrado
        res.status(404).json({ message: "Evento não encontrado" });
    }
    // Retornando o evento encontrado
    res.json(event);
});