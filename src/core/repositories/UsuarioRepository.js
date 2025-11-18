class UsuarioRepository {
    constructor() {
        this.tableName = 'usuarios';
    }

    findByUsuarioAndSenha(usuario, senha) {
        window.dbConnection.checkInitialized();
        const resultado = alasql(
            `SELECT * FROM ${this.tableName} WHERE usuario = ? AND senha = ?`,
            [usuario, senha]
        );
        return resultado && resultado.length > 0 ? resultado[0] : null;
    }

    findByUsuario(usuario) {
        window.dbConnection.checkInitialized();
        const resultado = alasql(
            `SELECT * FROM ${this.tableName} WHERE usuario = ?`,
            [usuario]
        );
        return resultado && resultado.length > 0 ? resultado[0] : null;
    }

    create(usuario, senha) {
        window.dbConnection.checkInitialized();
        alasql(
            `INSERT INTO ${this.tableName} (usuario, senha) VALUES (?, ?)`,
            [usuario, senha]
        );
    }

    findAll() {
        window.dbConnection.checkInitialized();
        return alasql(`SELECT * FROM ${this.tableName} ORDER BY id`);
    }
}
