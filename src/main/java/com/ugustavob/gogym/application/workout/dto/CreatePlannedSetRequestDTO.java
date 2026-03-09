package com.ugustavob.gogym.application.workout.dto;

import com.ugustavob.gogym.domain.enums.SetType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreatePlannedSetRequestDTO(
        @NotNull @Positive Integer setNumber,
        @NotNull SetType setType,
        String targetReps,
        Integer rir,
        Integer restTimeSeconds
) {}