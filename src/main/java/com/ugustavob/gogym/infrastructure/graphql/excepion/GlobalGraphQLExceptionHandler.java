package com.ugustavob.gogym.infrastructure.graphql.excepion;

import com.ugustavob.gogym.domain.exception.ConflictException;
import com.ugustavob.gogym.domain.exception.EquipmentNotFoundException;
import com.ugustavob.gogym.domain.exception.ExerciseNotFoundException;
import com.ugustavob.gogym.domain.exception.MuscleGroupNotFoundExeption;
import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.util.Map;

@ControllerAdvice
public class GlobalGraphQLExceptionHandler {

    @GraphQlExceptionHandler(RuntimeException.class)
    public GraphQLError handleRuntimeException(RuntimeException ex) {
        return GraphqlErrorBuilder.newError()
                .message("Ocorreu um erro interno no servidor")
                .extensions(Map.of("code", "INTERNAL_SERVER_ERROR"))
                .build();
    }

    @GraphQlExceptionHandler(MuscleGroupNotFoundExeption.class)
    public GraphQLError handleMuscleGroupNotFoundException(MuscleGroupNotFoundExeption ex) {
        return GraphqlErrorBuilder.newError()
                .message(ex.getMessage())
                .extensions(Map.of("code", "NOT_FOUND", "status", 404))
                .build();
    }

    @GraphQlExceptionHandler(EquipmentNotFoundException.class)
    public GraphQLError handleEquipmentNotFoundException(EquipmentNotFoundException ex) {
        return GraphqlErrorBuilder.newError()
                .message(ex.getMessage())
                .extensions(Map.of("code", "NOT_FOUND", "status", 404))
                .build();
    }

    @GraphQlExceptionHandler(ExerciseNotFoundException.class)
    public GraphQLError handleExerciseNotFoundException(ExerciseNotFoundException ex) {
        return GraphqlErrorBuilder.newError()
                .message(ex.getMessage())
                .extensions(Map.of("code", "NOT_FOUND", "status", 404))
                .build();
    }

    @GraphQlExceptionHandler(AuthenticationException.class)
    public GraphQLError handleAuthenticationException(AuthenticationException ex) {
        return GraphqlErrorBuilder.newError()
                .message("Acesso negado: é necessário estar autenticado para realizar esta operação.")
                .extensions(Map.of("code", "UNAUTHENTICATED", "status", 401))
                .build();
    }

    @GraphQlExceptionHandler(AccessDeniedException.class)
    public GraphQLError handleAccessDeniedException(AccessDeniedException ex) {
        return GraphqlErrorBuilder.newError()
                .message("Acesso negado: não tem permissões suficientes para executar esta ação.")
                .extensions(Map.of("code", "FORBIDDEN", "status", 403))
                .build();
    }

    @GraphQlExceptionHandler(ConflictException.class)
    public GraphQLError handleConflictException(ConflictException ex) {
        return GraphqlErrorBuilder.newError()
                .message(ex.getMessage())
                .extensions(Map.of("code", "CONFLICT", "status", 409))
                .build();
    }
}
