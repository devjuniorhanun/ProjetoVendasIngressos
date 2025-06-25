// Importando as Rotas do Express
import { Router } from "express";
import { AuthService, InvalidCredentialsError } from "../services/auth-service";

// Criando uma instância do Router
export const authRoutes = Router();

// Rota de Login
authRoutes.post("/login", async (req, res) => {
    // Recebe as credenciais do usuário
  const { email, password } = req.body;
  // Instantia o serviço de autenticação
  const authService = new AuthService();
  try {
    // Tenta fazer o login com as credenciais fornecidas
    const token = await authService.login(email, password);
    // Retorna o token de autenticação
    res.json({ token });
  } catch (e) {
    // Mostrando o erro no console
    console.error(e);
    // Verifica se o erro é de credenciais inválidas
    if (e instanceof InvalidCredentialsError) {
        // Retorna um erro 401 se as credenciais forem inválidas
      res.status(401).json({ message: "Credenciais forem inválidas" });
    }
    // Retorna um erro genérico 500 para outros tipos de erro
    res.status(500).json({ message: " Erro ao fazer login" });
  }
});