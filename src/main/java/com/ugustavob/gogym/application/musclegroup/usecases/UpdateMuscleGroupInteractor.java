package com.ugustavob.gogym.application.musclegroup.usecases;

import com.ugustavob.gogym.application.musclegroup.dto.UpdateMuscleGroupRequestDTO;
import com.ugustavob.gogym.domain.entities.MuscleGroup;
import com.ugustavob.gogym.domain.exception.ConflictException;
import com.ugustavob.gogym.domain.exception.MuscleGroupNotFoundExeption;
import com.ugustavob.gogym.domain.repositories.MuscleGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UpdateMuscleGroupInteractor {
    private final MuscleGroupRepository repository;

    public MuscleGroup execute(UpdateMuscleGroupRequestDTO input) {
        MuscleGroup muscleGroup = repository.findById(input.id())
                .orElseThrow(MuscleGroupNotFoundExeption::new);

        if (!muscleGroup.getName().equalsIgnoreCase(input.name())) {
            Optional<MuscleGroup> groupWithNewName = repository.findByNameIgnoreCase(input.name());
            if (groupWithNewName.isPresent() && !groupWithNewName.get().getId().equals(input.id())) {
                throw new ConflictException("Já existe outro grupo muscular cadastrado com este nome.");
            }
        }

        muscleGroup.setName(input.name());
        return repository.save(muscleGroup);
    }
}
