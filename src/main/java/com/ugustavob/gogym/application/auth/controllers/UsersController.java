package com.ugustavob.gogym.application.auth.controllers;

import com.ugustavob.gogym.domain.entities.UserEntity;
import com.ugustavob.gogym.domain.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UsersController {
    private final UserRepository userRepository;

    @QueryMapping
    public List<UserEntity> users() {
        return userRepository.findAll();
    }
}
