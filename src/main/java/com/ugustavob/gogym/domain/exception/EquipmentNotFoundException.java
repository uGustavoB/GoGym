package com.ugustavob.gogym.domain.exception;

public class EquipmentNotFoundException extends RuntimeException {
    public EquipmentNotFoundException(String message) {
        super(message);
    }

    public EquipmentNotFoundException() {
        super("Equipamento não encontrado.");
    }
}
