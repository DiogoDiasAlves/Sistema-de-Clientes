class LocalStorageAdapter {
    constructor() {
        this.storageKey = 'clientesDB';
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    load() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                return JSON.parse(savedData);
            }
            return null;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return null;
        }
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }
}
