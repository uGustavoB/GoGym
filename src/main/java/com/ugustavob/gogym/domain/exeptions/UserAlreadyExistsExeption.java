package com.ugustavob.gogym.domain.exeptions;

public class UserAlreadyExistsExeption extends RuntimeException {
    public UserAlreadyExistsExeption() {
        super("Já existe um usuário este email.");
    }
}
