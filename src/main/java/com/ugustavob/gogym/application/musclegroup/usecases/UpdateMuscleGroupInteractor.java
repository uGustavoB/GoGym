package com.ugustavob.gogym.application.musclegroup.usecases;

import com.ugustavob.gogym.domain.entities.MuscleGroup;
import com.ugustavob.gogym.domain.repositories.MuscleGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UpdateMuscleGroupInteractor {
    private final MuscleGroupRepository repository;

    public MuscleGroup execute(Long id, String newName) {
        MuscleGroup muscleGroup = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grupo muscular não encontrado."));

        if (muscleGroup.getName().equalsIgnoreCase(newName)) {
            return muscleGroup;
        }

        Optional<MuscleGroup> groupWithNewName = repository.findByNameIgnoreCase(newName);

        if (groupWithNewName.isPresent()) {
            if (!groupWithNewName.get().getId().equals(id)) {
                throw new RuntimeException("Já existe outro grupo muscular cadastrado com este nome.");
            }
        }

        // 4. Aplica a alteração e salva
        muscleGroup.setName(newName);
        return repository.save(muscleGroup);
    }
}
