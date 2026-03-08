package com.ugustavob.gogym.domain.exception;

public class UserAlreadyExistsExeption extends RuntimeException {
    public UserAlreadyExistsExeption() {
        super("Já existe um usuário este email.");
    }
}
