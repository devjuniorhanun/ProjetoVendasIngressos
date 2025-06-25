// Importando o express
import express from "express";

// Importando o JWT (JSON Web Token) para autenticação
import jwt from "jsonwebtoken";
// Importando o bcrypt para criptografia de senhas
import bcrypt from "bcrypt";
import { authRoutes } from "./controller/auth-controller";
import { UserService } from "./services/user-service";
import { partnerRoutes } from "./controller/partner-controller";
import { customerRoutes } from "./controller/customer-controller";
import { eventRoutes } from "./controller/event-controller";
import { ticketRoutes } from "./controller/ticket-controller";
import { Database } from "./database";




// Criando uma instância do express
const app = express();

// Middleware para parsear o corpo da requisição
app.use(express.json());

// Rotas não protegidas (sem autenticação)
const unprotectedRoutes = [
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/customers/register" },
  { method: "POST", path: "/partners/register" },
  { method: "GET", path: "/events" },
];

// Middleware de autenticação
app.use(async (req, res, next) => {
  // Verifica se a rota é uma das não protegidas
  const isUnprotectedRoute = unprotectedRoutes.some(
    (route) => route.method == req.method && req.path.startsWith(route.path)
  );
  // Se for uma rota não protegida, permite o acesso
  if (isUnprotectedRoute) {
    return next();
  }
  // Caso contrário, verifica se o token de autenticação foi passado
  const token = req.headers.authorization?.split(" ")[1];
  // Se o token não foi fornecido, retorna um erro 401 (não autorizado)
  if (!token) {
    res.status(401).json({ message: "Token não fornecido" });
    return;
  }
  // Verifica se o token é válido
  try {
    // Verifica o token usando a chave secreta definida
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number; // ID do usuário
      email: string; // Email do usuário
    };
    const userService = new UserService();
    const user = await userService.findById(payload.id)
    // Se o usuário não existir, retorna um erro 401 (não autorizado)
    if (!user) {
      res.status(401).json({ message: "Usuário não encontrado" });
      return;
    }
    // Se o usuário existir, adiciona as informações do usuário à requisição
    req.user = user as { id: number; email: string };
    next();
  } catch (error) {
    // Se o token for inválido, retorna um erro 401 (não autorizado)
    res.status(401).json({ message: "Token inválido" });
  }
});

// Definindo a Rota home
app.get("/", (req, res) => {
  res.send("Hello World");
});



// Definindo a Rota de Cadastro de Usuários
/*
app.post("/users", async (req, res) => {
  // Recebendo o nome, email e senha do corpo da requisição
  const { name, email, password } = req.body;

  // Instanciando uma conexão com o banco de dados
  const connection = await createConnection();
  // Instanciado a Data atual
  const createdAt = new Date;
  // Criptografando a senha
  const hashedPassword = bcrypt.hashSync(password, 10);
  //console.log(name, email, hashedPassword, createdAt);

  try {
    // Executando uma query para inserir o usuário no banco de dados
    const [userResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, createdAt]
    );
    const userId = userResult.insertId;
    // Enviando uma resposta de sucesso
    res.json({ message: "Usuário cadastrado com sucesso", userId });
  } finally {
    await connection.end();
  }

});*/
app.use('/auth', authRoutes);
app.use('/partners', partnerRoutes);
app.use('/customers', customerRoutes);
app.use('/events', eventRoutes);
app.use('/events', ticketRoutes)

// Definindo a porta do servidor
const PORT = process.env.APP_PORT || 3333

// Iniciando o servidor
app.listen(PORT, async () => {
  const connection = await Database.getInstance();;
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log(`Servidor rodando na porta ${PORT} \nhttp://localhost:${PORT}`)
});