package com.ugustavob.gogym.application.workout.usecases;

import com.ugustavob.gogym.application.workout.dto.UpdateWorkoutProgramDetailsRequestDTO;
import com.ugustavob.gogym.domain.entities.WorkoutProgram;
import com.ugustavob.gogym.domain.repositories.WorkoutProgramRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpdateWorkoutProgramDetailsInteractor {

    private final WorkoutProgramRepository repository;

    @Transactional
    public WorkoutProgram execute(UpdateWorkoutProgramDetailsRequestDTO input) {
        WorkoutProgram program = repository.findById(input.programId())
                .orElseThrow(() -> new RuntimeException("Ficha de treino não encontrada."));

        if (input.name() != null) program.setName(input.name());
        if (input.description() != null) program.setDescription(input.description());
        if (input.isActive() != null) program.setActive(input.isActive());

        return repository.save(program);
    }
}