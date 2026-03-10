package com.ugustavob.gogym.application.workout.dto;

import com.ugustavob.gogym.domain.enums.SetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdatePlannedSetRequestDTO(
        @NotNull(message = " O ID do set planejado é obrigatório")
        @Positive(message = " O ID do set planejado deve ser um número positivo")
        Long setId,
        String targetReps,
        @Positive(message = "RIR deve ser um número positivo ou zero")
        Integer rir,
        @Positive(message = "Tempo de descanso deve ser um número positivo ou zero")
        Integer restTimeSeconds,
        @NotBlank(message = "O tipo da série é obrigatório")
        SetType setType
) {}