class EnderecoService {
    constructor(enderecoRepo, clienteRepo) {
        this.enderecoRepo = enderecoRepo;
        this.clienteRepo = clienteRepo;
    }

    listarTodos() {
        return this.enderecoRepo.findAllWithCliente();
    }

    buscarPorId(id) {
        return this.enderecoRepo.findById(id);
    }

    buscarPorClienteId(clienteId) {
        return this.enderecoRepo.findByClienteId(clienteId);
    }

    salvar(endereco, enderecoId = null) {
        if (!endereco.clienteId || !endereco.cep || !endereco.rua || !endereco.bairro || 
            !endereco.cidade || !endereco.estado || !endereco.pais) {
            return { success: false, message: 'Por favor, preencha todos os campos obrigatórios.' };
        }

        const cliente = this.clienteRepo.findById(endereco.clienteId);
        if (!cliente) {
            return { success: false, message: 'Cliente não encontrado.' };
        }

        if (!endereco.principal && !enderecoId) {
            const principais = this.enderecoRepo.findPrincipaisExceptId(endereco.clienteId, 0);
            if (!principais || principais.length === 0) {
                return { success: false, message: 'Cada cliente deve ter pelo menos um endereço principal.' };
            }
        } else if (!endereco.principal && enderecoId) {
            const outrosPrincipais = this.enderecoRepo.findPrincipaisExceptId(endereco.clienteId, enderecoId);
            if (!outrosPrincipais || outrosPrincipais.length === 0) {
                return { success: false, message: 'Cada cliente deve ter pelo menos um endereço principal. Marque este ou outro endereço como principal.' };
            }
        }

        if (endereco.principal) {
            if (enderecoId) {
                this.enderecoRepo.unsetPrincipalExceptId(endereco.clienteId, enderecoId);
            } else {
                this.enderecoRepo.unsetAllPrincipal(endereco.clienteId);
            }
        }

        endereco.cep = this.formatarCEP(endereco.cep);
        endereco.estado = endereco.estado.toUpperCase();

        if (enderecoId) {
            this.enderecoRepo.update(enderecoId, endereco);
        } else {
            this.enderecoRepo.create(endereco);
        }

        return { success: true };
    }

    excluir(id) {
        const endereco = this.enderecoRepo.findById(id);
        
        if (endereco && endereco.principal == 1) {
            const outrosEnderecos = this.enderecoRepo.findByClienteId(endereco.cliente_id);
            if (outrosEnderecos && outrosEnderecos.length > 1) {
                const proximoPrincipal = outrosEnderecos.find(e => e.id != id);
                if (proximoPrincipal) {
                    this.enderecoRepo.setPrincipal(proximoPrincipal.id);
                }
            }
        }

        this.enderecoRepo.delete(id);
        return { success: true };
    }

    formatarCEP(cep) {
        const cepLimpo = cep.replace(/\D/g, '');
        return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
}
