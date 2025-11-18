class EnderecoController {
    constructor(enderecoService, clienteService, syncService) {
        this.enderecoService = enderecoService;
        this.clienteService = clienteService;
        this.sync = syncService;
        this.editando = false;
        this.setup();
    }

    setup() {
        this.carregarClientes();
        this.carregarLista();

        $('#cep').on('input', function() {
            MascarasInput.cep(this);
        });

        $('#estado').on('input', function() {
            this.value = this.value.toUpperCase().substring(0, 2);
        });

        $('#btnSalvarEndereco').on('click', () => this.salvar());
        $('#modalEndereco').on('hidden.bs.modal', () => this.limparForm());
        $('#modalEndereco').on('show.bs.modal', () => {
            if (!this.editando) {
                $('#modalEnderecoTitle').text('Novo Endereço');
                this.carregarClientes();
                this.limparForm();
            }
        });
    }

    carregarClientes() {
        try {
            const clientes = this.clienteService.listarTodos();
            const select = $('#clienteId');
            const valorAtual = select.val();

            select.empty();
            select.append('<option value="">Selecione um cliente</option>');

            if (clientes && clientes.length > 0) {
                clientes.forEach(c => {
                    select.append(`<option value="${c.id}">${Formatadores.escapeHtml(c.nome_completo)} (ID: ${c.id})</option>`);
                });
            }

            if (valorAtual) {
                select.val(valorAtual);
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    carregarLista() {
        try {
            const enderecos = this.enderecoService.listarTodos();
            const tbody = $('#tabelaEnderecos');
            tbody.empty();

            if (!enderecos || enderecos.length === 0) {
                tbody.append('<tr><td colspan="11" class="text-center">Nenhum endereço cadastrado</td></tr>');
                return;
            }

            enderecos.forEach(e => {
                const principal = (e.principal == 1 || e.principal === true) 
                    ? '<span class="badge-principal">Sim</span>' 
                    : '<span class="badge-secundario">Não</span>';
                
                const row = `
                    <tr>
                        <td>${e.id}</td>
                        <td>${e.cliente_id}</td>
                        <td>${e.nome_completo ? Formatadores.escapeHtml(e.nome_completo) : '-'}</td>
                        <td>${Formatadores.escapeHtml(e.cep)}</td>
                        <td>${Formatadores.escapeHtml(e.rua)}</td>
                        <td>${Formatadores.escapeHtml(e.bairro)}</td>
                        <td>${Formatadores.escapeHtml(e.cidade)}</td>
                        <td>${Formatadores.escapeHtml(e.estado)}</td>
                        <td>${Formatadores.escapeHtml(e.pais)}</td>
                        <td>${principal}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="enderecoController.editar(${e.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="enderecoController.excluir(${e.id})">Excluir</button>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar endereços');
        }
    }

    salvar() {
        const endereco = {
            clienteId: parseInt($('#clienteId').val()),
            cep: $('#cep').val().trim(),
            rua: $('#rua').val().trim(),
            bairro: $('#bairro').val().trim(),
            cidade: $('#cidade').val().trim(),
            estado: $('#estado').val().trim(),
            pais: $('#pais').val().trim(),
            principal: $('#principal').is(':checked')
        };

        const id = this.editando ? $('#enderecoId').val() : null;
        const result = this.enderecoService.salvar(endereco, id);

        if (result.success) {
            this.sync.sync();
            $('#modalEndereco').modal('hide');
            this.carregarLista();
        } else {
            $('#msgErroEndereco').removeClass('d-none').text(result.message);
        }
    }

    editar(id) {
        try {
            const endereco = this.enderecoService.buscarPorId(id);
            
            if (!endereco) return;

            this.editando = true;
            $('#modalEnderecoTitle').text('Editar Endereço');
            this.carregarClientes();

            $('#enderecoId').val(endereco.id);
            $('#clienteId').val(endereco.cliente_id);
            $('#cep').val(endereco.cep);
            $('#rua').val(endereco.rua);
            $('#bairro').val(endereco.bairro);
            $('#cidade').val(endereco.cidade);
            $('#estado').val(endereco.estado);
            $('#pais').val(endereco.pais);
            $('#principal').prop('checked', endereco.principal == 1);
            $('#msgErroEndereco').addClass('d-none');
            $('#modalEndereco').modal('show');
        } catch (error) {
            alert('Erro ao carregar endereço');
        }
    }

    excluir(id) {
        if (!confirm('Deseja realmente excluir este endereço?')) {
            return;
        }

        try {
            this.enderecoService.excluir(id);
            this.sync.sync();
            this.carregarLista();
        } catch (error) {
            alert('Erro ao excluir');
        }
    }

    limparForm() {
        $('#enderecoId, #clienteId, #cep, #rua, #bairro, #cidade, #estado').val('');
        $('#pais').val('Brasil');
        $('#principal').prop('checked', false);
        $('#msgErroEndereco').addClass('d-none');
        this.editando = false;
    }
}
