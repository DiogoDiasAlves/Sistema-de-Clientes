class EnderecoRepository {
    constructor() {
        this.tableName = 'enderecos';
    }

    findAllWithCliente() {
        window.dbConnection.checkInitialized();
        return alasql(`
            SELECT e.*, c.nome_completo 
            FROM ${this.tableName} e 
            LEFT JOIN clientes c ON e.cliente_id = c.id 
            ORDER BY e.id DESC
        `);
    }

    findByClienteId(clienteId) {
        window.dbConnection.checkInitialized();
        return alasql(
            `SELECT * FROM ${this.tableName} WHERE cliente_id = ?`,
            [clienteId]
        );
    }

    findById(id) {
        window.dbConnection.checkInitialized();
        const resultado = alasql(
            `SELECT * FROM ${this.tableName} WHERE id = ?`,
            [id]
        );
        return resultado && resultado.length > 0 ? resultado[0] : null;
    }

    findPrincipalByClienteId(clienteId) {
        window.dbConnection.checkInitialized();
        const resultado = alasql(
            `SELECT * FROM ${this.tableName} WHERE cliente_id = ? AND principal = 1`,
            [clienteId]
        );
        return resultado && resultado.length > 0 ? resultado[0] : null;
    }

    findPrincipaisExceptId(clienteId, exceptId) {
        window.dbConnection.checkInitialized();
        return alasql(
            `SELECT * FROM ${this.tableName} WHERE cliente_id = ? AND principal = 1 AND id != ?`,
            [clienteId, exceptId]
        );
    }

    deleteByClienteId(clienteId) {
        window.dbConnection.checkInitialized();
        const resultado = alasql(`DELETE FROM ${this.tableName} WHERE cliente_id = ?`, [clienteId]);
        return resultado;
    }

    create(endereco) {
        window.dbConnection.checkInitialized();
        alasql(
            `INSERT INTO ${this.tableName} (cliente_id, cep, rua, bairro, cidade, estado, pais, principal) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                endereco.clienteId,
                endereco.cep,
                endereco.rua,
                endereco.bairro,
                endereco.cidade,
                endereco.estado,
                endereco.pais,
                endereco.principal ? 1 : 0
            ]
        );
    }

    update(id, endereco) {
        window.dbConnection.checkInitialized();
        alasql(
            `UPDATE ${this.tableName} 
             SET cliente_id = ?, cep = ?, rua = ?, bairro = ?, cidade = ?, estado = ?, pais = ?, principal = ? 
             WHERE id = ?`,
            [
                endereco.clienteId,
                endereco.cep,
                endereco.rua,
                endereco.bairro,
                endereco.cidade,
                endereco.estado,
                endereco.pais,
                endereco.principal ? 1 : 0,
                id
            ]
        );
    }

    delete(id) {
        window.dbConnection.checkInitialized();
        alasql(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    }

    unsetPrincipalExceptId(clienteId, exceptId) {
        window.dbConnection.checkInitialized();
        alasql(
            `UPDATE ${this.tableName} SET principal = 0 WHERE cliente_id = ? AND id != ?`,
            [clienteId, exceptId]
        );
    }

    unsetAllPrincipal(clienteId) {
        window.dbConnection.checkInitialized();
        alasql(
            `UPDATE ${this.tableName} SET principal = 0 WHERE cliente_id = ?`,
            [clienteId]
        );
    }

    setPrincipal(id) {
        window.dbConnection.checkInitialized();
        alasql(`UPDATE ${this.tableName} SET principal = 1 WHERE id = ?`, [id]);
    }
}
