class ClienteController {
    constructor(clienteService, syncService) {
        this.service = clienteService;
        this.sync = syncService;
        this.editando = false;
        this.setup();
    }

    setup() {
        this.carregarLista();

        $('#cpf').on('input', function() {
            MascarasInput.cpf(this);
        });

        $('#telefone').on('input', function() {
            MascarasInput.telefone(this);
        });

        $('#celular').on('input', function() {
            MascarasInput.celular(this);
        });

        $('#btnSalvarCliente').on('click', () => this.salvar());
        $('#modalCliente').on('hidden.bs.modal', () => this.limparForm());
        $('#modalCliente').on('show.bs.modal', () => {
            if (!this.editando) {
                $('#modalClienteTitle').text('Novo Cliente');
                this.limparForm();
            }
        });
    }

    carregarLista() {
        try {
            const clientes = this.service.listarTodos();
            const tbody = $('#tabelaClientes');
            tbody.empty();

            if (!clientes || clientes.length === 0) {
                tbody.append('<tr><td colspan="7" class="text-center">Nenhum cliente cadastrado</td></tr>');
                return;
            }

            clientes.forEach(c => {
                const row = `
                    <tr>
                        <td>${c.id}</td>
                        <td>${Formatadores.escapeHtml(c.nome_completo)}</td>
                        <td>${Formatadores.escapeHtml(c.cpf)}</td>
                        <td>${Formatadores.formatarData(c.data_nascimento)}</td>
                        <td>${c.telefone ? Formatadores.escapeHtml(c.telefone) : '-'}</td>
                        <td>${Formatadores.escapeHtml(c.celular)}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="clienteController.editar(${c.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="clienteController.excluir(${c.id})">Excluir</button>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar clientes');
        }
    }

    salvar() {
        const cliente = {
            nomeCompleto: $('#nomeCompleto').val().trim(),
            cpf: $('#cpf').val().trim(),
            dataNascimento: $('#dataNascimento').val(),
            telefone: $('#telefone').val().trim(),
            celular: $('#celular').val().trim()
        };

        const id = this.editando ? $('#clienteId').val() : null;
        const result = this.service.salvar(cliente, id);

        if (result.success) {
            this.sync.sync();
            $('#modalCliente').modal('hide');
            this.carregarLista();
        } else {
            $('#msgErroCliente').removeClass('d-none').text(result.message);
        }
    }

    editar(id) {
        try {
            const cliente = this.service.buscarPorId(id);
            
            if (!cliente) return;

            this.editando = true;
            $('#modalClienteTitle').text('Editar Cliente');
            $('#clienteId').val(cliente.id);
            $('#nomeCompleto').val(cliente.nome_completo);
            $('#cpf').val(cliente.cpf);
            $('#dataNascimento').val(cliente.data_nascimento);
            $('#telefone').val(cliente.telefone || '');
            $('#celular').val(cliente.celular);
            $('#msgErroCliente').addClass('d-none');
            $('#modalCliente').modal('show');
        } catch (error) {
            alert('Erro ao carregar cliente');
        }
    }

    excluir(id) {
        const enderecos = window.enderecoService.buscarPorClienteId(id);
        const mensagem = enderecos && enderecos.length > 0
            ? `Deseja realmente excluir este cliente?\n\nTodos os ${enderecos.length} endereço(s) vinculado(s) também serão excluído(s).`
            : 'Deseja realmente excluir este cliente?';

        if (!confirm(mensagem)) {
            return;
        }

        try {
            const result = this.service.excluir(id);
            
            if (result.success) {
                this.sync.sync();
                this.carregarLista();
                
                if (window.enderecoController) {
                    window.enderecoController.carregarLista();
                }
            } else {
                alert(result.message || 'Erro ao excluir cliente');
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir cliente');
        }
    }

    limparForm() {
        $('#clienteId, #nomeCompleto, #cpf, #dataNascimento, #telefone, #celular').val('');
        $('#msgErroCliente').addClass('d-none');
        this.editando = false;
    }
}
