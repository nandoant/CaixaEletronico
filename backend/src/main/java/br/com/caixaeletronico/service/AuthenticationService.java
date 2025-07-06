package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.PerfilUsuario;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class AuthenticationService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    public Usuario registrarUsuario(String login, String email, String senha, PerfilUsuario perfil) {
        // Verifica se login já existe
        if (usuarioRepository.existsByLogin(login)) {
            throw new RuntimeException("Login já cadastrado");
        }
        
        // Verifica se email já existe
        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        // Cria novo usuário
        Usuario usuario = new Usuario();
        usuario.setLogin(login);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setPerfil(perfil);
        
        return usuarioRepository.save(usuario);
    }
    
    public String autenticar(String login, String senha) {
        Usuario usuario = usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new RuntimeException("Senha incorreta");
        }
        
        return jwtService.gerarToken(usuario.getLogin());
    }
    
    public Optional<Usuario> obterUsuarioDoToken(String token) {
        try {
            String login = jwtService.extrairLogin(token);
            return usuarioRepository.findByLogin(login);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public Usuario obterUsuarioPorLogin(String login) {
        return usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
    
    public Usuario obterUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}
