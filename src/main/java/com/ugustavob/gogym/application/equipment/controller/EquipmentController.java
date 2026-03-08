package com.ugustavob.gogym.application.equipment.controller;

import com.ugustavob.gogym.application.equipment.dto.CreateEquipmentRequestDTO;
import com.ugustavob.gogym.application.equipment.dto.UpdateEquipmentRequestDTO;
import com.ugustavob.gogym.application.equipment.usecases.*;
import com.ugustavob.gogym.domain.entities.Equipment;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class EquipmentController {

    private final CreateEquipmentInteractor createInteractor;
    private final GetEquipmentsInteractor getInteractor;
    private final GetEquipmentByIdInteractor getByIdInteractor;
    private final UpdateEquipmentInteractor updateInteractor;
    private final DeleteEquipmentInteractor deleteInteractor;

    @QueryMapping
    public List<Equipment> equipments() {
        return getInteractor.execute();
    }

    @QueryMapping
    public Equipment equipmentById(@Argument Long id) {
        return getByIdInteractor.execute(id);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Equipment createEquipment(@Valid @Argument CreateEquipmentRequestDTO input) {
        return createInteractor.execute(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Equipment updateEquipment(@Valid @Argument UpdateEquipmentRequestDTO input) {
        return updateInteractor.execute(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteEquipment(@Argument Long id) {
        deleteInteractor.execute(id);
        return true;
    }
}