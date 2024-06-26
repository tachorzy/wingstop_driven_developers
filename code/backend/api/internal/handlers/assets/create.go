package assets

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"time"
	"wdd/api/internal/types"
	"wdd/api/internal/wrappers"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

func NewCreateAssetHandler(db types.DynamoDBClient, s3Uploader types.S3Uploader) *Handler {
	return &Handler{
		DynamoDB:   db,
		S3Uploader: s3Uploader,
	}
}

func (h Handler) HandleCreateAssetRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	headers := getDefaultHeaders()

	var asset types.Asset
	if err := wrappers.JSONUnmarshal([]byte(request.Body), &asset); err != nil {
		return apiResponse(http.StatusBadRequest, "Error parsing JSON body: "+err.Error(), headers), nil
	}

	asset.AssetID = uuid.NewString()
	asset.DateCreated = time.Now().Format(time.RFC3339)

	if err := processAssetFiles(ctx, &asset, h.S3Uploader); err != nil {
		return apiResponse(http.StatusInternalServerError, err.Error(), headers), nil
	}

	av, err := wrappers.MarshalMap(asset)
	if err != nil {
		return apiResponse(http.StatusInternalServerError, "Error marshalling asset: "+err.Error(), headers), nil
	}

	if _, err = h.DynamoDB.PutItem(ctx, &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String("Asset"),
	}); err != nil {
		return apiResponse(http.StatusInternalServerError, "Error putting item into DynamoDB: "+err.Error(), headers), nil
	}

	responseBody, err := wrappers.JSONMarshal(asset)
	if err != nil {
		return apiResponse(http.StatusInternalServerError, "Error marshalling response body: "+err.Error(), headers), nil
	}

	return apiResponse(http.StatusOK, string(responseBody), headers), nil
}

func processAssetFiles(ctx context.Context, asset *types.Asset, uploader types.S3Uploader) error {
	if asset.ImageData != "" {
		if err := uploadToS3(ctx, asset.ImageData, fmt.Sprintf("assets/%s.jpg", asset.AssetID), "image/jpeg", uploader); err != nil {
			return fmt.Errorf("failed to upload image: %w", err)
		}
		asset.ImageData = fmt.Sprintf("https://%s.s3.amazonaws.com/assets/%s.jpg", "wingstopdrivenbucket", asset.AssetID)
	}

	if asset.ModelURL != nil && *asset.ModelURL != "" {
		if err := uploadToS3(ctx, *asset.ModelURL, fmt.Sprintf("models/%s.glb", asset.AssetID), "model/gltf-binary", uploader); err != nil {
			return fmt.Errorf("failed to upload model: %w", err)
		}
		*asset.ModelURL = fmt.Sprintf("https://%s.s3.amazonaws.com/models/%s.glb", "wingstopdrivenbucket", asset.AssetID)
	}

	return nil
}

func uploadToS3(ctx context.Context, base64Data, key, contentType string, uploader types.S3Uploader) error {
	decodedData, err := wrappers.Base64DecodeString(base64Data)
	if err != nil {
		return fmt.Errorf("Base64 decode error: %w", err)
	}

	_, err = uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      aws.String("wingstopdrivenbucket"),
		Key:         aws.String(key),
		Body:        bytes.NewReader(decodedData),
		ContentType: aws.String(contentType),
	})
	return err
}

func getDefaultHeaders() map[string]string {
	return map[string]string{
		"Content-Type":                 "application/json",
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "*",
	}
}

func apiResponse(statusCode int, body string, headers map[string]string) events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Headers:    headers,
		Body:       body,
	}
}
