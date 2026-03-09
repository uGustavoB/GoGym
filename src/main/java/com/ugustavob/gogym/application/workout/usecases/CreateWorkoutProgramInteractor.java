package com.ugustavob.gogym.application.workout.usecases;

import com.ugustavob.gogym.application.workout.dto.CreateWorkoutProgramRequestDTO;
import com.ugustavob.gogym.application.workout.factories.WorkoutFactory;
import com.ugustavob.gogym.domain.entities.UserEntity;
import com.ugustavob.gogym.domain.entities.WorkoutProgram;
import com.ugustavob.gogym.domain.repositories.UserRepository;
import com.ugustavob.gogym.domain.repositories.WorkoutProgramRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CreateWorkoutProgramInteractor {

    private final WorkoutProgramRepository workoutProgramRepository;
    private final UserRepository userRepository;
    private final WorkoutFactory workoutFactory;

    @Transactional
    public WorkoutProgram execute(CreateWorkoutProgramRequestDTO input) {
        UserEntity user = userRepository.findById(input.userId())
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado."));

        WorkoutProgram program = new WorkoutProgram();
        program.setName(input.name());
        program.setDescription(input.description());
        program.setStartDate(LocalDate.now());
        program.setActive(true);
        program.setUser(user);

        input.workouts().forEach(workoutDto -> {
            program.getWorkouts().add(workoutFactory.create(workoutDto, program));
        });

        // 4. Salva no banco
        return workoutProgramRepository.save(program);
    }
}