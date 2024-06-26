package floorplan

import (
	"context"
	"errors"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	ddbtypes "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"net/http"
	"testing"
	"wdd/api/internal/mocks"
	"wdd/api/internal/wrappers"
)

func TestHandleCreateFloorPlanRequest_BadJSON(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{}
	mockS3Uploader := &mocks.S3Uploader{}

	handler := NewCreateFloorPlanHandler(mockDDBClient, mockS3Uploader)

	request := events.APIGatewayProxyRequest{
		Body: `{"floorplanId":"1", "factoryId": "1", "imageData":1}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreateFloorPlanRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status code %d for bad JSON, got %d", http.StatusBadRequest, response.StatusCode)
	}
}

func TestHandleCreateFloorPlanRequest_Base64DecodeStringError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{}
	mockS3Uploader := &mocks.S3Uploader{}

	originalBase64DecodeString := wrappers.Base64DecodeString

	defer func() { wrappers.Base64DecodeString = originalBase64DecodeString }()

	wrappers.Base64DecodeString = func(s string) ([]byte, error) {
		return nil, errors.New("base64 decode error")
	}

	handler := NewCreateFloorPlanHandler(mockDDBClient, mockS3Uploader)

	request := events.APIGatewayProxyRequest{
		Body: `{"floorplanId":"1", "factoryId": "1", "imageData":"test image"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreateFloorPlanRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for base64 decode string, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleCreateFloorPlanRequest_UploadImageError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{}
	mockS3Uploader := &mocks.S3Uploader{
		UploadFunc: func(ctx context.Context, input *s3.PutObjectInput, opts ...func(*manager.Uploader)) (*manager.UploadOutput, error) {
			return nil, errors.New("upload error")
		},
	}

	handler := NewCreateFloorPlanHandler(mockDDBClient, mockS3Uploader)

	originalBase64DecodeString := wrappers.Base64DecodeString
	defer func() { wrappers.Base64DecodeString = originalBase64DecodeString }()
	wrappers.Base64DecodeString = func(s string) ([]byte, error) {
		return []byte(""), nil
	}

	request := events.APIGatewayProxyRequest{
		Body: `{"floorplanId":"1", "factoryId": "1", "imageData":"test image"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreateFloorPlanRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for upload image, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleCreateFloorPlanRequest_MarshalMapError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{}
	mockS3Uploader := &mocks.S3Uploader{
		UploadFunc: func(ctx context.Context, input *s3.PutObjectInput, opts ...func(*manager.Uploader)) (*manager.UploadOutput, error) {
			return &manager.UploadOutput{}, nil
		},
	}

	handler := NewCreateFloorPlanHandler(mockDDBClient, mockS3Uploader)

	originalBase64DecodeString := wrappers.Base64DecodeString
	defer func() { wrappers.Base64DecodeString = originalBase64DecodeString }()
	wrappers.Base64DecodeString = func(s string) ([]byte, error) {
		return []byte(""), nil
	}

	originalMarshalMap := wrappers.MarshalMap
	defer func() { wrappers.MarshalMap = originalMarshalMap }()
	wrappers.MarshalMap = func(interface{}) (map[string]ddbtypes.AttributeValue, error) {
		return nil, errors.New("mock marshalmap error")
	}

	request := events.APIGatewayProxyRequest{
		Body: `{"floorplanId":"1", "factoryId": "1", "imageData":"test image"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreateFloorPlanRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for marshalling floorplan to DynamoDB format, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleCreateFloorPlanRequest_PutItemError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		PutItemFunc: func(ctx context.Context, params *dynamodb.PutItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error) {
			return nil, errors.New("mock dynamodb error")
		},
	}
	mockS3Uploader := &mocks.S3Uploader{
		UploadFunc: func(ctx context.Context, input *s3.PutObjectInput, opts ...func(*manager.Uploader)) (*manager.UploadOutput, error) {
			return &manager.UploadOutput{}, nil
		},
	}

	handler := NewCreateFloorPlanHandler(mockDDBClient, mockS3Uploader)

	originalBase64DecodeString := wrappers.Base64DecodeString
	defer func() { wrappers.Base64DecodeString = originalBase64DecodeString }()
	wrappers.Base64DecodeString = func(s string) ([]byte, error) {
		return []byte(""), nil
	}

	request := events.APIGatewayProxyRequest{
		Body: `{"floorplanId":"1", "factoryId": "1", "imageData":"test image"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreateFloorPlanRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for DynamoDB put item error, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleCreateFloorPlanRequest_JSONMarshalError(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		PutItemFunc: func(ctx context.Context, params *dynamodb.PutItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error) {
			return &dynamodb.PutItemOutput{}, nil
		},
	}
	mockS3Uploader := &mocks.S3Uploader{
		UploadFunc: func(ctx context.Context, input *s3.PutObjectInput, opts ...func(*manager.Uploader)) (*manager.UploadOutput, error) {
			return &manager.UploadOutput{}, nil
		},
	}

	handler := NewCreateFloorPlanHandler(mockDDBClient, mockS3Uploader)

	originalBase64DecodeString := wrappers.Base64DecodeString
	defer func() { wrappers.Base64DecodeString = originalBase64DecodeString }()
	wrappers.Base64DecodeString = func(s string) ([]byte, error) {
		return []byte(""), nil
	}

	originalFactoryJSONMarshal := wrappers.JSONMarshal
	defer func() { wrappers.JSONMarshal = originalFactoryJSONMarshal }()
	wrappers.JSONMarshal = func(v interface{}) ([]byte, error) {
		return nil, errors.New("mock marshal error")
	}

	request := events.APIGatewayProxyRequest{
		Body: `{"floorplanId":"1", "factoryId": "1", "imageData":"test image"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreateFloorPlanRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status code %d for marshalling floorplan in JSON format, got %d", http.StatusInternalServerError, response.StatusCode)
	}
}

func TestHandleCreateFloorPlanRequest_Success(t *testing.T) {
	mockDDBClient := &mocks.DynamoDBClient{
		PutItemFunc: func(ctx context.Context, params *dynamodb.PutItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error) {
			return &dynamodb.PutItemOutput{}, nil
		},
	}
	mockS3Uploader := &mocks.S3Uploader{
		UploadFunc: func(ctx context.Context, input *s3.PutObjectInput, opts ...func(*manager.Uploader)) (*manager.UploadOutput, error) {
			return &manager.UploadOutput{}, nil
		},
	}

	handler := NewCreateFloorPlanHandler(mockDDBClient, mockS3Uploader)

	originalBase64DecodeString := wrappers.Base64DecodeString
	defer func() { wrappers.Base64DecodeString = originalBase64DecodeString }()
	wrappers.Base64DecodeString = func(s string) ([]byte, error) {
		return []byte(""), nil
	}

	request := events.APIGatewayProxyRequest{
		Body: `{"floorplanId":"1", "factoryId": "1", "imageData":"test image"}`,
	}

	ctx := context.Background()
	response, err := handler.HandleCreateFloorPlanRequest(ctx, request)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusOK {
		t.Errorf("Expected status code %d for successful creation, got %d", http.StatusOK, response.StatusCode)
	}
}
