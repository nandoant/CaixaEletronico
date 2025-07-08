package br.com.caixaeletronico.service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
@Service
public class JwtService {
    @Value("${jwt.secret:minha-chave-secreta-super-segura-para-jwt-tokens}")
    private String jwtSecret;
    @Value("${jwt.expiration:86400000}")
    private Long jwtExpiration;
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    public String gerarToken(String login) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, login);
    }
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public String extrairLogin(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    public Date extrairDataExpiracao(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    public Boolean validarToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    private Boolean isTokenExpired(String token) {
        return extrairDataExpiracao(token).before(new Date());
    }
}
