package br.com.caixaeletronico.config;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collection;
import java.util.Collections;
@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + login));
        return new CustomUserPrincipal(usuario);
    }
    public static class CustomUserPrincipal implements UserDetails {
        private final Usuario usuario;
        public CustomUserPrincipal(Usuario usuario) {
            this.usuario = usuario;
        }
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            String role = "ROLE_" + usuario.getPerfil().name();
            return Collections.singletonList(new SimpleGrantedAuthority(role));
        }
        @Override
        public String getPassword() {
            return usuario.getSenha();
        }
        @Override
        public String getUsername() {
            return usuario.getLogin();
        }
        @Override
        public boolean isAccountNonExpired() {
            return true;
        }
        @Override
        public boolean isAccountNonLocked() {
            return true;
        }
        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }
        @Override
        public boolean isEnabled() {
            return true;
        }
        public Usuario getUsuario() {
            return usuario;
        }
    }
}
