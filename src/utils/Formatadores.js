class Formatadores {
    static formatarData(data) {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    }

    static formatarCPF(cpf) {
        if (!cpf) return '';
        const limpo = cpf.replace(/\D/g, '');
        return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    static escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }
}
