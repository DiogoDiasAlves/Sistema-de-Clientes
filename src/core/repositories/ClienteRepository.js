class ClienteRepository {
    constructor() {
        this.tableName = 'clientes';
    }

    findAll() {
        window.dbConnection.checkInitialized();
        return alasql(`SELECT * FROM ${this.tableName} ORDER BY id DESC`);
    }

    findById(id) {
        window.dbConnection.checkInitialized();
        const resultado = alasql(
            `SELECT * FROM ${this.tableName} WHERE id = ?`,
            [id]
        );
        return resultado && resultado.length > 0 ? resultado[0] : null;
    }

    findByCpf(cpf) {
        window.dbConnection.checkInitialized();
        const resultado = alasql(
            `SELECT * FROM ${this.tableName} WHERE cpf = ?`,
            [cpf]
        );
        return resultado && resultado.length > 0 ? resultado[0] : null;
    }

    existsCpfExceptId(cpf, exceptId) {
        window.dbConnection.checkInitialized();
        const resultado = alasql(
            `SELECT * FROM ${this.tableName} WHERE cpf = ? AND id != ?`,
            [cpf, exceptId]
        );
        return resultado && resultado.length > 0;
    }

    create(cliente) {
        window.dbConnection.checkInitialized();
        alasql(
            `INSERT INTO ${this.tableName} (nome_completo, cpf, data_nascimento, telefone, celular) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                cliente.nomeCompleto,
                cliente.cpf,
                cliente.dataNascimento,
                cliente.telefone || null,
                cliente.celular
            ]
        );
    }

    update(id, cliente) {
        window.dbConnection.checkInitialized();
        alasql(
            `UPDATE ${this.tableName} 
             SET nome_completo = ?, cpf = ?, data_nascimento = ?, telefone = ?, celular = ? 
             WHERE id = ?`,
            [
                cliente.nomeCompleto,
                cliente.cpf,
                cliente.dataNascimento,
                cliente.telefone || null,
                cliente.celular,
                id
            ]
        );
    }

    delete(id) {
        window.dbConnection.checkInitialized();
        alasql(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    }
}
