package com.ugustavob.gogym.infrastructure.graphql.excepion;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.util.Map;

@ControllerAdvice
public class GlobalGraphQLExceptionHandler {

    @GraphQlExceptionHandler(RuntimeException.class)
    public GraphQLError handleRuntimeException(RuntimeException ex) {
        return GraphqlErrorBuilder.newError()
                .message(ex.getMessage())
                .extensions(Map.of("code", "INTERNAL_SERVER_ERROR"))
                .build();
    }
}
