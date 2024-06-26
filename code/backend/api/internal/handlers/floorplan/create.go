package floorplan

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
)

func NewCreateFloorPlanHandler(db types.DynamoDBClient, s3Uploader types.S3Uploader) *Handler {
	return &Handler{
		DynamoDB:   db,
		S3Uploader: s3Uploader,
	}
}

func (h Handler) HandleCreateFloorPlanRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	headers := map[string]string{
		"Content-Type":                 "application/json",
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "*",
	}

	var floorplan types.Floorplan
	if err := wrappers.JSONUnmarshal([]byte(request.Body), &floorplan); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Headers:    headers,
			Body:       fmt.Sprintf("error unmarshalling floorplan data: %s", err.Error()),
		}, nil
	}

	floorplan.DateCreated = time.Now().Format(time.RFC3339)

	decodedImageData, err := wrappers.Base64DecodeString(floorplan.ImageData)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("Error decoding image data: %s", err.Error()),
		}, nil
	}

	imageFileName := fmt.Sprintf("floorplans/%s.jpg", floorplan.FloorplanID)
	_, err = h.S3Uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      aws.String("wingstopdrivenbucket"),
		Key:         aws.String(imageFileName),
		Body:        bytes.NewReader(decodedImageData),
		ContentType: aws.String("image/jpeg"),
	})
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("Error uploading image to S3: %s", err.Error()),
		}, nil
	}

	floorplan.ImageData = fmt.Sprintf("https://%s.s3.amazonaws.com/%s", "wingstopdrivenbucket", imageFileName)

	av, err := wrappers.MarshalMap(floorplan)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("Error marshalling floorplan to DynamoDB format: %s", err.Error()),
		}, nil
	}

	_, err = h.DynamoDB.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(TABLENAME),
		Item:      av,
	})

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("Error inserting floorplan into DynamoDB: %s", err.Error()),
		}, nil
	}

	responseBody, err := wrappers.JSONMarshal(map[string]interface{}{
		"message":   fmt.Sprintf("floorplanId %s created successfully", floorplan.FloorplanID),
		"factoryId": floorplan.FloorplanID,
	})

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("Error marshalling response body: %s", err.Error()),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Headers:    headers,
		Body:       string(responseBody),
	}, nil
}
