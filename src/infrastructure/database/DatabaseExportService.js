class DatabaseExportService {
    constructor(usuarioRepo, clienteRepo, enderecoRepo, localStorageAdapter) {
        this.usuarioRepo = usuarioRepo;
        this.clienteRepo = clienteRepo;
        this.enderecoRepo = enderecoRepo;
        this.localStorageAdapter = localStorageAdapter;
    }

    exportar() {
        try {
            const usuarios = this.usuarioRepo.findAll() || [];
            const clientes = this.clienteRepo.findAll() || [];
            const enderecos = this.enderecoRepo.findAllWithCliente() || [];

            const enderecosFormatados = enderecos.map(end => ({
                ...end,
                principal: end.principal === 1 || end.principal === true
            }));

            const data = {
                usuarios,
                clientes,
                enderecos: enderecosFormatados
            };

            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `banco_dados_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return { success: true, message: 'Banco de dados exportado com sucesso!' };
        } catch (error) {
            console.error('Erro ao exportar banco de dados:', error);
            return { success: false, message: 'Erro ao exportar banco de dados' };
        }
    }

    importar(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            alasql("DELETE FROM enderecos");
            alasql("DELETE FROM clientes");
            alasql("DELETE FROM usuarios");

            if (data.usuarios && Array.isArray(data.usuarios)) {
                data.usuarios.forEach(user => {
                    this.usuarioRepo.create(user.usuario, user.senha);
                });
            }

            if (data.clientes && Array.isArray(data.clientes)) {
                data.clientes.forEach(cliente => {
                    this.clienteRepo.create({
                        nomeCompleto: cliente.nome_completo,
                        cpf: cliente.cpf,
                        dataNascimento: cliente.data_nascimento,
                        telefone: cliente.telefone,
                        celular: cliente.celular
                    });
                });
            }

            if (data.enderecos && Array.isArray(data.enderecos)) {
                data.enderecos.forEach(endereco => {
                    this.enderecoRepo.create({
                        clienteId: endereco.cliente_id,
                        cep: endereco.cep,
                        rua: endereco.rua,
                        bairro: endereco.bairro,
                        cidade: endereco.cidade,
                        estado: endereco.estado,
                        pais: endereco.pais,
                        principal: endereco.principal === true || endereco.principal === 1
                    });
                });
            }

            this.syncToLocalStorage();
            
            return { success: true };
        } catch (error) {
            console.error('Erro ao importar banco de dados:', error);
            return { success: false, message: error.message };
        }
    }

    syncToLocalStorage() {
        const usuarios = this.usuarioRepo.findAll() || [];
        const clientes = this.clienteRepo.findAll() || [];
        const enderecos = this.enderecoRepo.findAllWithCliente() || [];
        
        const data = {
            usuarios: usuarios.sort((a, b) => a.id - b.id),
            clientes: clientes.sort((a, b) => a.id - b.id),
            enderecos: enderecos.sort((a, b) => a.id - b.id)
        };
        this.localStorageAdapter.save(data);
    }

    carregarDoLocalStorage() {
        const data = this.localStorageAdapter.load();
        if (!data) return;

        try {
            alasql("DELETE FROM enderecos");
            alasql("DELETE FROM clientes");
            alasql("DELETE FROM usuarios");

            if (data.usuarios && data.usuarios.length > 0) {
                data.usuarios.sort((a, b) => a.id - b.id).forEach(user => {
                    alasql("INSERT INTO usuarios (id, usuario, senha) VALUES (?, ?, ?)", 
                        [user.id, user.usuario, user.senha]);
                });
            }

            if (data.clientes && data.clientes.length > 0) {
                data.clientes.sort((a, b) => a.id - b.id).forEach(cliente => {
                    alasql("INSERT INTO clientes (id, nome_completo, cpf, data_nascimento, telefone, celular) VALUES (?, ?, ?, ?, ?, ?)", 
                        [cliente.id, cliente.nome_completo, cliente.cpf, cliente.data_nascimento, cliente.telefone, cliente.celular]);
                });
            }

            if (data.enderecos && data.enderecos.length > 0) {
                data.enderecos.sort((a, b) => a.id - b.id).forEach(endereco => {
                    const principal = endereco.principal === true || endereco.principal === 1 ? 1 : 0;
                    alasql("INSERT INTO enderecos (id, cliente_id, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                        [endereco.id, endereco.cliente_id, endereco.cep, endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, principal]);
                });
            }

            this.resetAutoIncrement();
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
        }
    }

    resetAutoIncrement() {
        try {
            const maxUsuarioId = alasql("SELECT MAX(id) as maxId FROM usuarios")[0]?.maxId || 0;
            if (maxUsuarioId > 0) {
                alasql("INSERT INTO usuarios (id, usuario, senha) VALUES (?, ?, ?)", [maxUsuarioId + 1, '__temp__', '__temp__']);
                alasql("DELETE FROM usuarios WHERE usuario = '__temp__'");
            }

            const maxClienteId = alasql("SELECT MAX(id) as maxId FROM clientes")[0]?.maxId || 0;
            if (maxClienteId > 0) {
                alasql("INSERT INTO clientes (id, nome_completo, cpf, data_nascimento, celular) VALUES (?, ?, ?, ?, ?)", 
                    [maxClienteId + 1, '__temp__', '000.000.000-00', '2000-01-01', '00000000000']);
                alasql("DELETE FROM clientes WHERE nome_completo = '__temp__'");
            }

            const maxEnderecoId = alasql("SELECT MAX(id) as maxId FROM enderecos")[0]?.maxId || 0;
            if (maxEnderecoId > 0) {
                const primeiroClienteId = alasql("SELECT MIN(id) as minId FROM clientes")[0]?.minId || 1;
                alasql("INSERT INTO enderecos (id, cliente_id, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                    [maxEnderecoId + 1, primeiroClienteId, '00000-000', '__temp__', '__temp__', '__temp__', 'SP', 'Brasil', 0]);
                alasql("DELETE FROM enderecos WHERE rua = '__temp__'");
            }
        } catch (error) {
            console.warn('Aviso ao resetar AUTO_INCREMENT:', error);
        }
    }

    salvarNoLocalStorage() {
        const usuarios = this.usuarioRepo.findAll() || [];
        const clientes = this.clienteRepo.findAll() || [];
        const enderecos = this.enderecoRepo.findAllWithCliente() || [];
        
        const data = {
            usuarios: usuarios.sort((a, b) => a.id - b.id),
            clientes: clientes.sort((a, b) => a.id - b.id),
            enderecos: enderecos.sort((a, b) => a.id - b.id)
        };
        this.localStorageAdapter.save(data);
    }
}
