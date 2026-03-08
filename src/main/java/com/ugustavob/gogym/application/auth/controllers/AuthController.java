package com.ugustavob.gogym.application.auth.controllers;

import com.ugustavob.gogym.application.auth.dto.LoginRequestDTO;
import com.ugustavob.gogym.application.auth.dto.LoginResponseDTO;
import com.ugustavob.gogym.application.auth.dto.RegisterRequestDTO;
import com.ugustavob.gogym.application.auth.dto.RegisterResponseDTO;
import com.ugustavob.gogym.application.auth.usecases.LoginInteractor;
import com.ugustavob.gogym.application.auth.usecases.RegisterInteractor;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final LoginInteractor loginInteractor;
    private final RegisterInteractor registerInteractor;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request){
        return ResponseEntity.ok(loginInteractor.execute(request));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(
            @Valid @RequestBody RegisterRequestDTO request
    ){
        return ResponseEntity.ok(registerInteractor.execute(request));
    }
}