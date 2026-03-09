package com.ugustavob.gogym.application.exercise.usecases;

import com.ugustavob.gogym.application.equipment.usecases.GetEquipmentByIdInteractor;
import com.ugustavob.gogym.application.exercise.dto.CreateExerciseRequestDTO;
import com.ugustavob.gogym.application.musclegroup.usecases.GetMuscleGroupByIdInteractor;
import com.ugustavob.gogym.domain.entities.Equipment;
import com.ugustavob.gogym.domain.entities.Exercise;
import com.ugustavob.gogym.domain.entities.MuscleGroup;
import com.ugustavob.gogym.domain.exception.ConflictException;
import com.ugustavob.gogym.domain.repositories.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateExerciseInteractor {
    private final ExerciseRepository exerciseRepository;
    private final GetMuscleGroupByIdInteractor getMuscleGroupByIdInteractor;
    private final GetEquipmentByIdInteractor getEquipmentByIdInteractor;

    public Exercise execute(CreateExerciseRequestDTO input) {
        exerciseRepository.findByNameIgnoreCase(input.name())
                .ifPresent(ex -> {
                    throw new ConflictException("Já existe um exercício cadastrado com este nome.");
                });

        MuscleGroup muscleGroup = getMuscleGroupByIdInteractor.execute(input.muscleGroupId());
        Equipment equipment = getEquipmentByIdInteractor.execute(input.equipmentId());

        Exercise exercise = new Exercise();
        exercise.setName(input.name());
        exercise.setMuscleGroup(muscleGroup);
        exercise.setEquipment(equipment);

        return exerciseRepository.save(exercise);
    }
}
