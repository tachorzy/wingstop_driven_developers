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

func TestHandleReadPropertyRequest_WithoutId_ScanError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		ScanFunc: func(ctx context.Context, params *dynamodb.ScanInput, optFns ...func(*dynamodb.Options)) (*dynamodb.ScanOutput, error) {
			return nil, errors.New("mock dynamodb error")
		},
	}
	handler := NewReadPropertyHandler(mockDDBClient)

	request := events.APIGatewayProxyRequest{}

	ctx := context.Background()
	response, err := handler.HandleReadPropertyRequest(ctx, request)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for DynamoDB scan error, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleReadPropertyRequest_WithoutId_UnmarshalListOfMapsError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		ScanFunc: func(ctx context.Context, params *dynamodb.ScanInput, optFns ...func(*dynamodb.Options)) (*dynamodb.ScanOutput, error) {
			items := []map[string]ddbtypes.AttributeValue{
				{
					"propertyId":    &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
					"measurementId": &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
					"name":          &ddbtypes.AttributeValueMemberS{Value: "Test Name"},
				},
			}
			return &dynamodb.ScanOutput{Items: items}, nil
		},
	}
	handler := NewReadPropertyHandler(mockDDBClient)

	originalUnmarshalListOfMaps := wrappers.UnmarshalListOfMaps

	defer func() { wrappers.UnmarshalListOfMaps = originalUnmarshalListOfMaps }()

	wrappers.UnmarshalListOfMaps = func([]map[string]ddbtypes.AttributeValue, interface{}) error {
		return errors.New("mock error")
	}

	request := events.APIGatewayProxyRequest{}

	ctx := context.Background()
	response, err := handler.HandleReadPropertyRequest(ctx, request)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for unmarshalling list of properties in DynamoDB format, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleReadPropertyRequest_WithoutId_JSONMarshalError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		ScanFunc: func(ctx context.Context, params *dynamodb.ScanInput, optFns ...func(*dynamodb.Options)) (*dynamodb.ScanOutput, error) {
			items := []map[string]ddbtypes.AttributeValue{
				{
					"propertyId":    &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
					"measurementId": &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
					"name":          &ddbtypes.AttributeValueMemberS{Value: "Test Name"},
				},
			}
			return &dynamodb.ScanOutput{Items: items}, nil
		},
	}
	handler := NewReadPropertyHandler(mockDDBClient)

	originalJSONMarshal := wrappers.JSONMarshal

	defer func() { wrappers.JSONMarshal = originalJSONMarshal }()

	wrappers.JSONMarshal = func(v interface{}) ([]byte, error) {
		return nil, errors.New("mock marshal error")
	}

	request := events.APIGatewayProxyRequest{}

	ctx := context.Background()
	response, err := handler.HandleReadPropertyRequest(ctx, request)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for marshalling property in JSON format, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleReadPropertyRequest_WithoutId_Success(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		ScanFunc: func(ctx context.Context, params *dynamodb.ScanInput, optFns ...func(*dynamodb.Options)) (*dynamodb.ScanOutput, error) {
			items := []map[string]ddbtypes.AttributeValue{
				{
					"propertyId":    &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
					"measurementId": &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
					"name":          &ddbtypes.AttributeValueMemberS{Value: "Test Name"},
				},
			}
			return &dynamodb.ScanOutput{Items: items}, nil
		},
	}
	handler := NewReadPropertyHandler(mockDDBClient)

	request := events.APIGatewayProxyRequest{}

	ctx := context.Background()
	response, err := handler.HandleReadPropertyRequest(ctx, request)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusOK {
		t.Errorf("Expected status code %d for successful read without id, got %d", http.StatusOK, response.StatusCode)
	}
}

func TestHandleReadPropertyRequest_WithId_GetItemError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		GetItemFunc: func(ctx context.Context, params *dynamodb.GetItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error) {
			return nil, errors.New("mock dynamodb error")
		},
	}
	handler := NewReadPropertyHandler(mockDDBClient)

	request := events.APIGatewayProxyRequest{
		QueryStringParameters: map[string]string{"id": "1"},
	}

	ctx := context.Background()
	response, err := handler.HandleReadPropertyRequest(ctx, request)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for DynamoDB get item error, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleReadPropertyRequest_WithId_ItemNotFound(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		GetItemFunc: func(ctx context.Context, params *dynamodb.GetItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error) {
			return &dynamodb.GetItemOutput{
				Item: nil,
			}, nil
		},
	}

	handler := NewReadPropertyHandler(mockDDBClient)

	request := events.APIGatewayProxyRequest{
		QueryStringParameters: map[string]string{"id": "1"},
	}

	ctx := context.Background()
	response, err := handler.HandleReadPropertyRequest(ctx, request)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusNotFound {
		t.Errorf("Expected status code %d for DynamoDb get item not found, got %d", http.StatusNotFound, response.StatusCode)
	}
}

func TestHandleReadPropertyRequest_WithId_UnmarshalMapError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		GetItemFunc: func(ctx context.Context, params *dynamodb.GetItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error) {
			item := map[string]ddbtypes.AttributeValue{
				"propertyId":    &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
				"measurementId": &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
				"name":          &ddbtypes.AttributeValueMemberS{Value: "Test Name"},
			}
			return &dynamodb.GetItemOutput{Item: item}, nil
		},
	}
	handler := NewReadPropertyHandler(mockDDBClient)

	originalUnmarshalMap := wrappers.UnmarshalMap

	defer func() { wrappers.UnmarshalMap = originalUnmarshalMap }()

	wrappers.UnmarshalMap = func(map[string]ddbtypes.AttributeValue, interface{}) error {
		return errors.New("mock error")
	}

	request := events.APIGatewayProxyRequest{
		QueryStringParameters: map[string]string{"id": "1"},
	}

	ctx := context.Background()
	response, err := handler.HandleReadPropertyRequest(ctx, request)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for unmarshalling property from DynamoDB format, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleReadPropertyRequest_WithId_JSONMarshalError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		GetItemFunc: func(ctx context.Context, params *dynamodb.GetItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error) {
			item := map[string]ddbtypes.AttributeValue{
				"propertyId":    &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
				"measurementId": &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
				"name":          &ddbtypes.AttributeValueMemberS{Value: "Test Name"},
			}
			return &dynamodb.GetItemOutput{Item: item}, nil
		},
	}
	handler := NewReadPropertyHandler(mockDDBClient)

	originalJSONMarshal := wrappers.JSONMarshal

	defer func() { wrappers.JSONMarshal = originalJSONMarshal }()

	wrappers.JSONMarshal = func(v interface{}) ([]byte, error) {
		return nil, errors.New("mock marshal error")
	}

	request := events.APIGatewayProxyRequest{
		QueryStringParameters: map[string]string{"id": "1"},
	}

	ctx := context.Background()
	response, err := handler.HandleReadPropertyRequest(ctx, request)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for marshalling property in JSON format, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleReadPropertyRequest_WithId_Success(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		GetItemFunc: func(ctx context.Context, params *dynamodb.GetItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error) {
			item := map[string]ddbtypes.AttributeValue{
				"propertyId":    &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
				"measurementId": &ddbtypes.AttributeValueMemberS{Value: "Test ID"},
				"name":          &ddbtypes.AttributeValueMemberS{Value: "Test Name"},
			}
			return &dynamodb.GetItemOutput{Item: item}, nil
		},
	}

	handler := NewReadPropertyHandler(mockDDBClient)

	request := events.APIGatewayProxyRequest{
		QueryStringParameters: map[string]string{"id": "1"},
	}

	ctx := context.Background()
	response, err := handler.HandleReadPropertyRequest(ctx, request)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusOK {
		t.Errorf("Expected status code %d for successful read with id, got %d", http.StatusOK, response.StatusCode)
	}
}
