package com.ugustavob.gogym.application.equipment.usecases;

import com.ugustavob.gogym.domain.entities.Equipment;
import com.ugustavob.gogym.domain.exception.EquipmentNotFoundException;
import com.ugustavob.gogym.domain.repositories.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetEquipmentByIdInteractor {
    private final EquipmentRepository repository;

    public Equipment execute(Long id) {
        return repository.findById(id)
                .orElseThrow(EquipmentNotFoundException::new);
    }
}