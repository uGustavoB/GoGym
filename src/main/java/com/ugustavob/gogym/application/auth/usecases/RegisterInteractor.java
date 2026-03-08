package com.ugustavob.gogym.application.auth.usecases;

import com.ugustavob.gogym.application.auth.dto.RegisterRequestDTO;
import com.ugustavob.gogym.application.auth.dto.RegisterResponseDTO;
import com.ugustavob.gogym.domain.entities.UserEntity;
import com.ugustavob.gogym.domain.exception.UserAlreadyExistsExeption;
import com.ugustavob.gogym.domain.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class RegisterInteractor {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterResponseDTO execute(RegisterRequestDTO request){

        userRepository.findByEmail(request.email())
                .ifPresent(user -> {
                    throw new UserAlreadyExistsExeption();
                });

        UserEntity user = new UserEntity();

        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        user.setRoles(Set.of("USER"));

        UserEntity savedUser = userRepository.save(user);

        return new RegisterResponseDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRoles()
        );
    }
}