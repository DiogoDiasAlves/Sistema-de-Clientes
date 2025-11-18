class AuthService {
    constructor(usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }

    login(usuario, senha) {
        if (!usuario || !senha) {
            return { success: false, message: 'Por favor, preencha todos os campos.' };
        }

        const user = this.usuarioRepo.findByUsuarioAndSenha(usuario, senha);
        
        if (user) {
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('usuario', usuario);
            return { success: true };
        }

        return { success: false, message: 'Usuário ou senha incorretos.' };
    }

    register(usuario, senha, confirmarSenha) {
        if (!usuario || !senha || !confirmarSenha) {
            return { success: false, message: 'Por favor, preencha todos os campos.' };
        }

        if (senha !== confirmarSenha) {
            return { success: false, message: 'As senhas não coincidem.' };
        }

        if (senha.length < 3) {
            return { success: false, message: 'A senha deve ter pelo menos 3 caracteres.' };
        }

        const existingUser = this.usuarioRepo.findByUsuario(usuario);
        if (existingUser) {
            return { success: false, message: 'Este usuário já existe. Escolha outro.' };
        }

        this.usuarioRepo.create(usuario, senha);
        return { success: true, message: 'Usuário cadastrado com sucesso!' };
    }

    isAuthenticated() {
        return sessionStorage.getItem('loggedIn') === 'true';
    }

    logout() {
        sessionStorage.removeItem('loggedIn');
        sessionStorage.removeItem('usuario');
        window.location.href = 'index.html';
    }
}
