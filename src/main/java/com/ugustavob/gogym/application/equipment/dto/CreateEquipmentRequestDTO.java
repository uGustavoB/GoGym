package com.ugustavob.gogym.application.equipment.dto;

import com.ugustavob.gogym.domain.enums.EquipmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateEquipmentRequestDTO(
        @NotBlank(message = "É obrigatório preencher o nome do equipamento.")
        String name,
        @NotNull(message = "É obrigatório informar o tipo do equipamento.")
        EquipmentType type
) {
}