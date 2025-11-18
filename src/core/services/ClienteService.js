class ClienteService {
    constructor(clienteRepo, enderecoRepo) {
        this.clienteRepo = clienteRepo;
        this.enderecoRepo = enderecoRepo;
    }

    listarTodos() {
        return this.clienteRepo.findAll();
    }

    buscarPorId(id) {
        return this.clienteRepo.findById(id);
    }

    salvar(cliente, clienteId = null) {
        if (!cliente.nomeCompleto || !cliente.cpf || !cliente.dataNascimento || !cliente.celular) {
            return { success: false, message: 'Por favor, preencha todos os campos obrigatórios.' };
        }

        const cpfLimpo = cliente.cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            return { success: false, message: 'CPF inválido. Deve conter 11 dígitos.' };
        }

        const cpfFormatado = this.formatarCPF(cliente.cpf);

        if (clienteId) {
            if (this.clienteRepo.existsCpfExceptId(cpfFormatado, clienteId)) {
                return { success: false, message: 'Já existe outro cliente cadastrado com este CPF.' };
            }
        } else {
            if (this.clienteRepo.findByCpf(cpfFormatado)) {
                return { success: false, message: 'Já existe um cliente cadastrado com este CPF.' };
            }
        }

        cliente.cpf = cpfFormatado;
        if (clienteId) {
            this.clienteRepo.update(clienteId, cliente);
        } else {
            this.clienteRepo.create(cliente);
        }

        return { success: true };
    }

    excluir(id) {
        this.enderecoRepo.deleteByClienteId(id);
        this.clienteRepo.delete(id);
        return { success: true };
    }

    formatarCPF(cpf) {
        const cpfLimpo = cpf.replace(/\D/g, '');
        return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}
