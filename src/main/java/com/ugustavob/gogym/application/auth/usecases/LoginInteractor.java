package com.ugustavob.gogym.application.auth.usecases;

import com.ugustavob.gogym.application.auth.dto.LoginRequestDTO;
import com.ugustavob.gogym.application.auth.dto.LoginResponseDTO;
import com.ugustavob.gogym.domain.entities.UserEntity;
import com.ugustavob.gogym.domain.repositories.UserRepository;
import com.ugustavob.gogym.infrastructure.security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginInteractor {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UserRepository userRepository;

    public LoginResponseDTO execute(LoginRequestDTO request){

        var usernamePassword =
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                );

        var auth = authenticationManager.authenticate(usernamePassword);

        UserEntity user = (UserEntity) auth.getPrincipal();

        assert user != null;
        String token = tokenService.generateToken(user);

        return new LoginResponseDTO(
                token,
                "Bearer",
                new LoginResponseDTO.UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRoles()
                )
        );
    }
}