package properties

import (
	"context"
	"errors"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	ddbtypes "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"net/http"
	"testing"
	"wdd/api/internal/mocks"
	"wdd/api/internal/wrappers"
)

func TestHandleCreatePropertyRequest_BadJSON(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{}

	handler := NewCreatePropertyHandler(mockDDBClient)

	request := events.APIGatewayProxyRequest{
		Body: `{"propertyId": "1", "measurementId":"1", "name":"test", "value":"invalid", "unit":"feet"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreatePropertyRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status code %d for bad JSON, got %d", http.StatusBadRequest, response.StatusCode)
	}
}

func TestHandleCreatePropertyRequest_MarshalMapError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{}

	handler := NewCreatePropertyHandler(mockDDBClient)

	originalMarshalMap := wrappers.MarshalMap

	defer func() { wrappers.MarshalMap = originalMarshalMap }()

	wrappers.MarshalMap = func(interface{}) (map[string]ddbtypes.AttributeValue, error) {
		return nil, errors.New("mock error")
	}

	request := events.APIGatewayProxyRequest{
		Body: `{"propertyId": "1", "measurementId":"1", "name":"test", "value":1.0, "unit":"feet"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreatePropertyRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for marshalling factory to DynamoDB format, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleCreatePropertyRequest_PutItemError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		PutItemFunc: func(ctx context.Context, params *dynamodb.PutItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error) {
			return nil, errors.New("mock dynamodb error")
		},
	}

	handler := NewCreatePropertyHandler(mockDDBClient)

	request := events.APIGatewayProxyRequest{
		Body: `{"propertyId": "1", "measurementId":"1", "name":"test", "value":1.0, "unit":"feet"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreatePropertyRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for DynamoDB put item error, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleCreatePropertyRequest_JSONMarshalError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		PutItemFunc: func(ctx context.Context, params *dynamodb.PutItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error) {
			return &dynamodb.PutItemOutput{}, nil
		},
	}

	handler := NewCreatePropertyHandler(mockDDBClient)

	request := events.APIGatewayProxyRequest{
		Body: `{"propertyId": "1", "measurementId":"1", "name":"test", "value":1.0, "unit":"feet"}`,
	}

	originalFactoryJSONMarshal := wrappers.JSONMarshal

	defer func() { wrappers.JSONMarshal = originalFactoryJSONMarshal }()

	wrappers.JSONMarshal = func(v interface{}) ([]byte, error) {
		return nil, errors.New("mock marshal error")
	}

	ctx := context.Background()
	response, err := handler.HandleCreatePropertyRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for marshalling property in JSON format, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleCreatePropertyRequest_Success(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		PutItemFunc: func(ctx context.Context, params *dynamodb.PutItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error) {
			return &dynamodb.PutItemOutput{}, nil
		},
	}

	handler := NewCreatePropertyHandler(mockDDBClient)

	request := events.APIGatewayProxyRequest{
		Body: `{"propertyId": "1", "measurementId":"1", "name":"test", "value":1.0, "unit":"feet"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreatePropertyRequest(ctx, request)

	if err != nil {
		t.Fatalf("Did not expect an error, got %v", err)
	}

	if response.StatusCode != http.StatusOK {
		t.Errorf("Expected status code %d for successful creation, got %d", http.StatusOK, response.StatusCode)
	}
}
