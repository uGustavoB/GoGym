package com.ugustavob.gogym.application.equipment.dto;

import com.ugustavob.gogym.domain.enums.EquipmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateEquipmentRequestDTO(
        @NotNull(message = "O ID não pode ser nulo")
        @Positive(message = "O ID deve ser um número maior que zero")
        Long id,
        @NotBlank(message = "É obrigatório preencher o nome do equipamento.")
        String name,
        @NotNull(message = "É obrigatório informar o tipo do equipamento.")
        EquipmentType type
) {
}
