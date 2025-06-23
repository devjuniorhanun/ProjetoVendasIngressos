// Importando o express
import express from "express";
// Importando o mysql2/promise
import * as mysql from "mysql2/promise";
// Importando o JWT (JSON Web Token) para autenticação
import jwt from "jsonwebtoken";
// Importando o bcrypt para criptografia de senhas
import bcrypt from "bcrypt";

// Função para conectar ao banco de dados
function createConnection() {
  // Criando uma conexão com o banco de dados
  return mysql.createConnection({
    host: process.env.DB_HOST || "localhost", // Host do banco de dados
    user: process.env.DB_USER || "ingressos", // Usuário do banco de dados
    password: process.env.DB_PASSWORD || "ingressos", // Senha do banco de dados
    database: process.env.DB_DATABASE || "tickets", // Nome do banco de dados
    port: parseInt(process.env.DB_PORT || "3306"), // Porta do banco de dados
  });
}

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
    // Instanciando uma conexão com o banco de dados
    const connection = await createConnection();
    // Executando uma query para buscar o usuário pelo ID do token
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [payload.id]
    );
    // Verifica se o usuário existe
    const user = rows.length ? rows[0] : null;
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

});

// Definindo a Rota de Login
app.post("/auth/login", async (req, res) => {
  // Recebendo o email e a senha do corpo da requisição
  const { email, password } = req.body;
  // Instanciando uma conexão com o banco de dados
  const connection = await createConnection();
  try {
    // Executando uma query para buscar o usuário pelo email
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    // Verifica se o usuário existe
    const user = rows.length ? rows[0] : null;
    //console.log(user);
    if (user && bcrypt.compareSync(password, user.password)) {
      // Se o usuário existir e a senha estiver correta, gera um token JWT
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRATION || "1h", // Define o tempo de expiração do token
      });
      // Envia o token como resposta
      res.json({ token });

    } else {
      // Se o usuário não existir ou a senha estiver incorreta, retorna um erro 401 (não autorizado)
      res.status(401).json({ message: "Email ou senha incorretos" });
    }
  } finally {
    // Fechando a conexão com o banco de dados
    await connection.end();
  }

  // Enviando uma resposta de sucesso
  res.send("Login realizado com sucesso");
});

// Definindo a Rota de Cadastro de Parceiros
app.post("/partners/register", async (req, res) => {

  // Recebendo o nome, email, senha e nome da empresa do corpo da requisição
  const { name, email, password, company_name, userId } = req.body;

  // Instanciando uma conexão com o banco de dados
  const connection = await createConnection();

  // Instanciado a Data atual
  const createdAt = new Date;
  try {
    // Executando uma query para inserir o parceiro
    const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)",
      [userId, company_name, createdAt]
    );
    // Enviando uma resposta de sucesso
    res.status(201).json({
      id: partnerResult.insertId, // ID do parceiro recém-criado
      name, // Nome do parceiro
      user_id: userId, // ID do usuário associado ao parceiro
      company_name, // Nome da empresa do parceiro
      created_at: createdAt, // Data de criação do parceiro
    });
  } finally {
    // Fechando a conexão com o banco de dados
    await connection.end();
  }
})

// Definindo a Rota de Cadastro de Consumidores
app.post("/customers/register", async (req, res) => {
  // Recebendo o nome, email, senha, endereço e telefone do corpo da requisição
  const { name, email, password, address, phone, user_id } = req.body;
  // Instanciando uma conexão com o banco de dados
  const connection = await createConnection();
  try {
    // Instanciando a Data atual
    const createdAt = new Date();
    // Executando uma query para inserir o consumidor
    const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)",
      [user_id, address, phone, createdAt]
    );
    // Enviando uma resposta de sucesso
    res.status(201).json({
      id: partnerResult.insertId, // ID do consumidor recém-criado
      name, // Nome do consumidor
      user_id: user_id, // ID do usuário associado ao consumidor
      address, // Endereço do consumidor
      phone, // Telefone do consumidor
      created_at: createdAt, // Data de criação do consumidor
    });
  } finally {
    // Fechando a conexão com o banco de dados
    await connection.end();
  }
});

// Definindo a Rota de Cadastro de Eventos pelo Parceiro
app.post("/partners/register/events", (req, res) => {
  const { name, description, date, location } = req.body
  //console.log(name, description, date, location);
  res.send("Evento cadastrado com sucesso");
})

// Definindo a Rota de Cadastro de Eventos pelo Parceiro
app.post("/partners/events", async (req, res) => {
  // Recebendo o nome, descrição, data e localização do corpo da requisição
  const { name, description, date, location } = req.body;
  // Recebendo o ID do usuário
  const userId = req.user!.id;
  // Instanciando uma conexão com o banco de dados
  const connection = await createConnection();
  try {
    // Executando uma query para buscar o parceiro pelo ID do usuário
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );
    // Verifica se o parceiro existe
    const partner = rows.length ? rows[0] : null;
    // Se o parceiro não existir, retorna um erro 403 (não autorizado)
    if (!partner) {
      // Retorna um erro 403 (não autorizado)
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    // Converte a data recebida para o formato Date
    const eventDate = new Date(date);
    // Instanciando a Data atual
    const createdAt = new Date();
    // Executando uma query para inserir o evento
    const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO events (name, description, date, location, created_at, partner_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, eventDate, location, createdAt, partner.id]
    );
    // Enviando uma resposta de sucesso
    res.status(201).json({
      id: eventResult.insertId, // ID do evento recém-criado
      name, // Nome do evento
      description, // Descrição do evento
      date: eventDate, // Data do evento
      location, // Localização do evento
      created_at: createdAt, // Data de criação do evento
      partner_id: partner.id, // ID do parceiro associado ao evento
    });
  } finally {
    // Fechando a conexão com o banco de dados
    await connection.end();
  }
});

// Definindo a Rota de Cadastro de Eventos
app.get("/partners/events", async (req, res) => {
  // Recebendo o ID do usuário da requisição
  const userId = req.user!.id;
  // Instanciando uma conexão com o banco de dados
  const connection = await createConnection();
  try {
    // Executando uma query para buscar o parceiro pelo ID do usuário
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );
    // Retorna o parceiro encontrado ou null se não existir
    const partner = rows.length ? rows[0] : null;

    // Se o parceiro não existir
    if (!partner) {
      // Retorna um erro 403 (não autorizado)
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // Executando uma query para buscar os eventos do parceiro
    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ?",
      [partner.id]
    );
    // Retorna os eventos encontrados
    res.json(eventRows);
  } finally {
    // Fechando a conexão com o banco de dados
    await connection.end();
  }
});

// Definindo a Rota de Listagem de Eventos
app.get("/partners/events/:eventId", async (req, res) => {
  // Recebendo o ID do evento da requisição
  const { eventId } = req.params;
  // Recebendo o ID do usuário global da requisição 
  const userId = req.user!.id;
  // Instanciando uma conexão com o banco de dados
  const connection = await createConnection();
  try {
    // Executando uma query para buscar o parceiro pelo ID do usuário
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );
    // Retorna o parceiro encontrado ou null se não existir
    const partner = rows.length ? rows[0] : null;
// Se o parceiro não existir
    if (!partner) {
      // Retorna um erro 403 (não autorizado)
      res.status(403).json({ message: "Not authorized" });
      return;
    }
// Executando uma query para buscar o evento pelo ID do parceiro e ID do evento
    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ? and id = ?",
      [partner.id, eventId]
    );
    // Retorna o evento encontrado ou null se não existir
    const event = eventRows.length ? eventRows[0] : null;

    // Se o evento não existir
    if (!event) {
      // Retorna um erro 404 (não encontrado)
      res.status(404).json({ message: "Event not found" });
    }
// Retorna o evento encontrado
    res.json(event);
  } finally {
    // Fechando a conexão com o banco de dados
    await connection.end();
  }
});

// Definindo a Rota de Listagem de Eventos
app.get("/events", async (req, res) => {
  // Instanciando uma conexão com o banco de dados
  const connection = await createConnection();
  try {
    // Executando uma query para buscar todos os eventos
    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events"
    );
    // Retorna todos os eventos encontrados
    res.json(eventRows);
  } finally {
    // Fechando a conexão com o banco de dados
    await connection.end();
  }
});

// Definindo a Rota de Listagem de Eventos por ID
app.get("/events/:eventId", async (req, res) => {
  // Recebendo o ID do evento da requisição
  const { eventId } = req.params;
  // Instanciando uma conexão com o banco de dados
  const connection = await createConnection();
  try {
    // Executando uma query para buscar o evento pelo ID
    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );
    // Retorna o evento encontrado ou null se não existir
    const event = eventRows.length ? eventRows[0] : null;

    // Se o evento não existir
    if (!event) {
      // Retorna um erro 404 (não encontrado)
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Retorna o evento encontrado
    res.json(event);
  } finally {
    // Fechando a conexão com o banco de dados
    await connection.end();
  }
});

// Definindo a porta do servidor
const PORT = process.env.APP_PORT || 3333

// Iniciando o servidor
app.listen(PORT, async () => {
  const connection = await createConnection();
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log(`Servidor rodando na porta ${PORT} \nhttp://localhost:${PORT}`)
});