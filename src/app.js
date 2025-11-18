let usuarioRepo;
let clienteRepo;
let enderecoRepo;
let authService;
let clienteService;
let enderecoService;
let databaseExportService;
let syncService;

async function inicializarApp() {
    if (typeof alasql === 'undefined') {
        await new Promise(resolve => {
            const check = setInterval(() => {
                if (typeof alasql !== 'undefined') {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
        });
    }

    window.dbConnection = new DatabaseConnection();
    await window.dbConnection.initialize();

    const localStorageAdapter = new LocalStorageAdapter();
    usuarioRepo = new UsuarioRepository();
    clienteRepo = new ClienteRepository();
    enderecoRepo = new EnderecoRepository();

    databaseExportService = new DatabaseExportService(
        usuarioRepo,
        clienteRepo,
        enderecoRepo,
        localStorageAdapter
    );
    databaseExportService.carregarDoLocalStorage();

    authService = new AuthService(usuarioRepo);
    clienteService = new ClienteService(clienteRepo, enderecoRepo);
    enderecoService = new EnderecoService(enderecoRepo, clienteRepo);
    syncService = new DatabaseSyncService(databaseExportService);

    const page = window.location.pathname.split('/').pop();
    if ((page === 'clientes.html' || page === 'enderecos.html') && !authService.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    if (page === 'index.html' || page === '') {
        new LoginController(authService, databaseExportService);
    } else if (page === 'clientes.html') {
        window.enderecoService = enderecoService;
        window.clienteController = new ClienteController(clienteService, syncService);
    } else if (page === 'enderecos.html') {
        window.enderecoController = new EnderecoController(enderecoService, clienteService, syncService);
    }

    $('#btnExportar').on('click', (e) => {
        e.preventDefault();
        const result = databaseExportService.exportar();
        if (result.success) {
            alert(result.message);
        }
    });

    $('#btnLogout').on('click', (e) => {
        e.preventDefault();
        authService.logout();
    });
}

function saveToLocalStorage() {
    if (syncService) {
        syncService.sync();
    }
}

$(document).ready(() => {
    inicializarApp().catch(error => {
        console.error('Erro ao iniciar:', error);
    });
});
