class DatabaseConnection {
    constructor() {
        this.isInitialized = false;
        this.maxRetries = 50;
        this.retryInterval = 100;
    }

    waitForAlaSQL(callback) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof alasql !== 'undefined' && alasql) {
                clearInterval(checkInterval);
                callback();
            } else if (attempts >= this.maxRetries) {
                clearInterval(checkInterval);
                console.error(`AlaSQL não foi carregado após ${this.maxRetries} tentativas`);
            }
        }, this.retryInterval);
    }

    async initialize() {
        if (this.isInitialized) return;

        if (typeof alasql === 'undefined' || !alasql) {
            return new Promise((resolve) => {
                this.waitForAlaSQL(() => {
                    this.createTables();
                    this.isInitialized = true;
                    resolve();
                });
            });
        }

        this.createTables();
        this.isInitialized = true;
    }

    createTables() {
        const tables = {
            usuarios: `CREATE TABLE usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario VARCHAR(100) UNIQUE NOT NULL,
                senha VARCHAR(100) NOT NULL
            )`,
            clientes: `CREATE TABLE clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome_completo VARCHAR(200) NOT NULL,
                cpf VARCHAR(14) UNIQUE NOT NULL,
                data_nascimento DATE NOT NULL,
                telefone VARCHAR(14),
                celular VARCHAR(15) NOT NULL
            )`,
            enderecos: `CREATE TABLE enderecos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cliente_id INT NOT NULL,
                cep VARCHAR(9) NOT NULL,
                rua VARCHAR(200) NOT NULL,
                bairro VARCHAR(100) NOT NULL,
                cidade VARCHAR(100) NOT NULL,
                estado VARCHAR(2) NOT NULL,
                pais VARCHAR(100) NOT NULL,
                principal INT DEFAULT 0
            )`
        };

        Object.keys(tables).forEach(tableName => {
            try {
                alasql(tables[tableName]);
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    console.warn(`Erro ao criar tabela ${tableName}:`, error.message);
                }
            }
        });
    }

    checkInitialized() {
        if (!this.isInitialized) {
            console.warn('Banco de dados não inicializado. Tentando inicializar...');
            this.initialize();
        }
    }
}
