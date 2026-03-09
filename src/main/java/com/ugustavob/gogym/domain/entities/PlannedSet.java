package com.ugustavob.gogym.domain.entities;

import com.ugustavob.gogym.domain.enums.SetType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "planned_sets")
@Data
public class PlannedSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer setNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SetType setType;

    private String targetReps;
    private Integer rir;
    private Integer restTimeSeconds;

    // Planejamento de série pertence a um exercício de um treino
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_exercise_id", nullable = false)
    private WorkoutExercise workoutExercise;
}