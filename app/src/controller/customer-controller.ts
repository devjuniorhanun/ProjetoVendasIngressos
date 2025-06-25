// Importando o serviço de Consumidor
import { CustomerService } from "@/services/customer-service";
// Importando as rotas do Express
import { Router } from "express";

// Importando o Router do Express para definir as rotas
export const customerRoutes = Router();

// Definindo a Rota de Cadastro de Consumidores
customerRoutes.post("/customers/register", async (req, res) => {
  // Recebendo o nome, email, senha, endereço e telefone do corpo da requisição
  const { name, email, password, address, phone, user_id } = req.body;
  
   const customerService = new CustomerService();
    // Enviando uma resposta de sucesso
    const result = await customerService.register({
    name, // Nome do consumidor
    email, // Email do consumidor
    user_id, // Senha do consumidor
    address, // Endereço do consumidor
    phone, // Telefone do consumidor
  });
    // Retornando o resultado da operação
  res.status(201).json(result);
});