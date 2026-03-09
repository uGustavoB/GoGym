package com.ugustavob.gogym.application.workout.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public record CreateWorkoutExerciseRequestDTO(
        @NotNull @Positive Long exerciseId,
        @NotNull @Positive Integer orderIndex,
        String notes,
        @NotEmpty List<CreatePlannedSetRequestDTO> plannedSets
) {}