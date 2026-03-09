package com.ugustavob.gogym.application.exercise.usecases;

import com.ugustavob.gogym.application.equipment.usecases.GetEquipmentByIdInteractor;
import com.ugustavob.gogym.application.exercise.dto.UpdateExerciseRequestDTO;
import com.ugustavob.gogym.application.musclegroup.usecases.GetMuscleGroupByIdInteractor;
import com.ugustavob.gogym.domain.entities.Equipment;
import com.ugustavob.gogym.domain.entities.Exercise;
import com.ugustavob.gogym.domain.entities.MuscleGroup;
import com.ugustavob.gogym.domain.exception.ConflictException;
import com.ugustavob.gogym.domain.exception.ExerciseNotFoundException;
import com.ugustavob.gogym.domain.repositories.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UpdateExerciseInteractor {
    private final ExerciseRepository exerciseRepository;
    private final GetMuscleGroupByIdInteractor getMuscleGroupByIdInteractor;
    private final GetEquipmentByIdInteractor getEquipmentByIdInteractor;

    @Transactional
    public Exercise execute(UpdateExerciseRequestDTO input) {
        Exercise exercise = exerciseRepository.findById(input.exerciseId())
                .orElseThrow(ExerciseNotFoundException::new);

        if (!exercise.getName().equalsIgnoreCase(input.name())) {
            Optional<Exercise> exerciseWithNewName = exerciseRepository.findByNameIgnoreCase(input.name());
            if (exerciseWithNewName.isPresent() && !exerciseWithNewName.get().getId().equals(input.exerciseId())) {
                throw new ConflictException("Já existe outro exercício cadastrado com este nome.");
            }
        }

        MuscleGroup muscleGroup = getMuscleGroupByIdInteractor.execute(input.muscleGroupId());
        Equipment equipment = getEquipmentByIdInteractor.execute(input.equipmentId());

        exercise.setName(input.name());
        exercise.setMuscleGroup(muscleGroup);
        exercise.setEquipment(equipment);

        return exerciseRepository.save(exercise);
    }

}
