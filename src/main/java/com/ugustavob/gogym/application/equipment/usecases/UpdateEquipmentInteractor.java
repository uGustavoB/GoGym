package com.ugustavob.gogym.application.equipment.usecases;

import com.ugustavob.gogym.application.equipment.dto.UpdateEquipmentRequestDTO;
import com.ugustavob.gogym.domain.entities.Equipment;
import com.ugustavob.gogym.domain.exception.ConflictException;
import com.ugustavob.gogym.domain.exception.EquipmentNotFoundException;
import com.ugustavob.gogym.domain.repositories.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UpdateEquipmentInteractor {
    private final EquipmentRepository repository;

    public Equipment execute(UpdateEquipmentRequestDTO input) {
        Equipment equipment = repository.findById(input.id())
                .orElseThrow(EquipmentNotFoundException::new);

        if (!equipment.getName().equalsIgnoreCase(input.name())) {
            Optional<Equipment> equipmentWithNewName = repository.findByNameIgnoreCase(input.name());
            if (equipmentWithNewName.isPresent() && !equipmentWithNewName.get().getId().equals(input.id())) {
                throw new ConflictException("Já existe outro equipamento cadastrado com este nome.");
            }
        }

        equipment.setName(input.name());
        equipment.setType(input.type());
        return repository.save(equipment);
    }
}