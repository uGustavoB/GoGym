package com.ugustavob.gogym.domain.exception;

public class MuscleGroupNotFoundExeption extends RuntimeException {
    public MuscleGroupNotFoundExeption(String message) {
        super(message);
    }

    public MuscleGroupNotFoundExeption() {
        super("Grupo muscular não encontrado.");
    }
}
