class DatabaseSyncService {
    constructor(exportService) {
        this.exportService = exportService;
    }

    sync() {
        this.exportService.salvarNoLocalStorage();
    }
}
