package main

import (
	"context"
	"github.com/aws/aws-lambda-go/events"
	"testing"
)

func TestBadJSON(t *testing.T) {
	request := events.APIGatewayProxyRequest{
		Body: `{"name":"Name", "location": "Invalid", "description":"Description"}`,
	}

	ctx := context.Background()
	response, err := HandleRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != 400 {
		t.Errorf("Expected StatusCode 400 for bad JSON, got %d", response.StatusCode)
	}
}
