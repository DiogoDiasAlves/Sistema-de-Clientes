class LoginController {
    constructor(authService, databaseExportService) {
        this.authService = authService;
        this.dbExport = databaseExportService;
        this.setup();
    }

    setup() {
        $('#linkCadastro').on('click', (e) => {
            e.preventDefault();
            $('#loginForm, #configForm').addClass('d-none');
            $('#cadastroForm').removeClass('d-none');
            this.limparMsg();
        });

        $('#linkVoltarLogin, #linkVoltarLogin2').on('click', (e) => {
            e.preventDefault();
            $('#cadastroForm, #configForm').addClass('d-none');
            $('#loginForm').removeClass('d-none');
            this.limparMsg();
        });

        $('#linkConfiguracoes').on('click', (e) => {
            e.preventDefault();
            $('#loginForm, #cadastroForm').addClass('d-none');
            $('#configForm').removeClass('d-none');
            this.limparMsg();
        });

        $('#btnLogin').on('click', () => this.login());
        $('#btnCadastrar').on('click', () => this.cadastrar());
        $('#btnUploadDB').on('click', () => this.uploadDB());

        $('#usuario, #senha').on('keypress', (e) => {
            if (e.which === 13) this.login();
        });
    }

    login() {
        const usuario = $('#usuario').val().trim();
        const senha = $('#senha').val();

        if (!usuario || !senha) {
            this.mostrarErro('msgErro', 'Preencha todos os campos');
            return;
        }

        if (typeof alasql === 'undefined') {
            this.mostrarErro('msgErro', 'Biblioteca não carregada. Recarregue a página.');
            return;
        }

        const result = this.authService.login(usuario, senha);

        if (result.success) {
            window.location.href = 'clientes.html';
        } else {
            this.mostrarErro('msgErro', result.message);
        }
    }

    cadastrar() {
        if (typeof alasql === 'undefined') {
            this.mostrarErro('msgErroCadastro', 'Biblioteca não carregada. Recarregue a página.');
            return;
        }

        const usuario = $('#novoUsuario').val().trim();
        const senha = $('#novaSenha').val();
        const confirma = $('#confirmarSenha').val();

        if (!usuario || !senha || !confirma) {
            this.mostrarErro('msgErroCadastro', 'Preencha todos os campos');
            return;
        }

        if (senha !== confirma) {
            this.mostrarErro('msgErroCadastro', 'Senhas não coincidem');
            return;
        }

        const result = this.authService.register(usuario, senha, confirma);

        if (result.success) {
            this.dbExport.salvarNoLocalStorage();
            
            $('#msgErroCadastro').addClass('d-none');
            $('#msgSucessoCadastro').removeClass('d-none').text('Usuário cadastrado!');
            $('#novoUsuario, #novaSenha, #confirmarSenha').val('');

            setTimeout(() => {
                $('#cadastroForm').addClass('d-none');
                $('#loginForm').removeClass('d-none');
                $('#msgSucessoCadastro').addClass('d-none');
                $('#msgErro').removeClass('d-none').addClass('alert-success').text('Usuário cadastrado! Faça login.');
            }, 1500);
        } else {
            this.mostrarErro('msgErroCadastro', result.message);
        }
    }

    uploadDB() {
        const input = $('#uploadDB')[0];
        
        if (!input.files || input.files.length === 0) {
            this.mostrarErro('msgConfig', 'Selecione um arquivo JSON');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const result = this.dbExport.importar(e.target.result);
                
                if (result.success) {
                    $('#msgConfig').removeClass('d-none alert-danger').addClass('alert-success').text('Banco importado!');
                    input.value = '';
                    
                    setTimeout(() => {
                        $('#configForm').addClass('d-none');
                        $('#loginForm').removeClass('d-none');
                    }, 1500);
                } else {
                    this.mostrarErro('msgConfig', 'Erro ao importar. Verifique o formato.');
                }
            } catch (error) {
                this.mostrarErro('msgConfig', 'Erro ao processar arquivo');
            }
        };

        reader.onerror = () => {
            this.mostrarErro('msgConfig', 'Erro ao ler arquivo');
        };

        reader.readAsText(input.files[0]);
    }

    mostrarErro(id, msg) {
        $('#' + id).removeClass('d-none alert-success').addClass('alert-danger').text(msg);
    }

    limparMsg() {
        $('#msgErro, #msgErroCadastro, #msgSucessoCadastro, #msgConfig').addClass('d-none');
    }
}
