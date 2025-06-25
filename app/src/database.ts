// Importando o mysql2/promise
import * as mysql from "mysql2/promise";

//singleton

// Classe Database para gerenciar a conexão com o banco de dados
export class Database {
    // Instância única do pool de conexões
    private static instance: mysql.Pool;
    // Construtor privado para evitar instanciamento externo
    private constructor() { }
    // Método estático para obter a instância do pool de conexões
    public static getInstance(): mysql.Pool {
        // Verifica se a instância já foi criada
        if (!Database.instance) {
            // Cria uma nova instância do pool de conexões
            Database.instance = mysql.createPool({
                host: process.env.DB_HOST || "localhost", // Host do banco de dados
                user: process.env.DB_USER || "ingressos", // Usuário do banco de dados
                password: process.env.DB_PASSWORD || "ingressos", // Senha do banco de dados
                database: process.env.DB_DATABASE || "tickets", // Nome do banco de dados
                port: parseInt(process.env.DB_PORT || "3306"), // Porta do banco de dados
                waitForConnections: true, // Espera por conexões disponíveis
                connectionLimit: 10, // Limite de conexões no pool
                queueLimit: 0, // Sem limite de fila de conexões
            });
        }

        // Retorna a instância do pool de conexões'
        return Database.instance;
    }
}