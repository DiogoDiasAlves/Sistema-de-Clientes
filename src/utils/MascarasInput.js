class MascarasInput {
    static cpf(input) {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length <= 11) {
            valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
            valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
            valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            input.value = valor;
        }
    }

    static telefone(input) {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length <= 10) {
            valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
            valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
            input.value = valor;
        }
    }

    static celular(input) {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length <= 11) {
            valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
            valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
            input.value = valor;
        }
    }

    static cep(input) {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length <= 8) {
            valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
            input.value = valor;
        }
    }
}
