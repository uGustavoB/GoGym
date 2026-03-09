package com.ugustavob.gogym.domain.exception;

public class ExerciseNotFoundException extends RuntimeException {
    public ExerciseNotFoundException(String message) {
        super(message);
    }

        public ExerciseNotFoundException() {
            super("Exercício não encontrado.");
        }
}
