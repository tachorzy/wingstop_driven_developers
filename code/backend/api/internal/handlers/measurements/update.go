package measurements

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"wdd/api/internal/types"
	"wdd/api/internal/wrappers"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	ddbtypes "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func NewUpdateMeasurementHandler(db types.DynamoDBClient) *Handler {
	return &Handler{
		DynamoDB: db,
	}
}

func (h Handler) HandleUpdateMeasurementRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var measurement types.Measurement
	headers := map[string]string{
		"Access-Control-Allow-Origin": "*",
		"Content-Type":                "application/json",
	}

	if err := json.Unmarshal([]byte(request.Body), &measurement); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Headers:    headers,
			Body:       fmt.Sprintf("Error parsing JSON body: %s", err.Error()),
		}, nil
	}

	key := map[string]ddbtypes.AttributeValue{
		"measurementId": &ddbtypes.AttributeValueMemberS{Value: measurement.MeasurementID},
	}

	var updateBuilder expression.UpdateBuilder
	if measurement.Frequency != nil {
		updateBuilder = updateBuilder.Set(expression.Name("frequency"), expression.Value(measurement.Frequency))
	}
	if measurement.GeneratorFunction != "" {
		updateBuilder = updateBuilder.Set(expression.Name("generatorFunction"), expression.Value(measurement.GeneratorFunction))
	}
	if measurement.LowerBound != nil {
		updateBuilder = updateBuilder.Set(expression.Name("lowerBound"), expression.Value(measurement.LowerBound))
	}
	if measurement.UpperBound != nil {
		updateBuilder = updateBuilder.Set(expression.Name("upperBound"), expression.Value(measurement.UpperBound))
	}
	if measurement.Precision != nil {
		updateBuilder = updateBuilder.Set(expression.Name("precision"), expression.Value(measurement.Precision))
	}

	expr, err := wrappers.UpdateExpressionBuilder(updateBuilder)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("Failed to build update expression: %s", err.Error()),
		}, nil
	}

	input := &dynamodb.UpdateItemInput{
		Key:                       key,
		TableName:                 aws.String(TABLENAME),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		UpdateExpression:          expr.Update(),
	}

	if _, err = h.DynamoDB.UpdateItem(ctx, input); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("Error updating item into DynamoDB: %s", err.Error()),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Headers:    headers,
		Body:       fmt.Sprintf("measurementId %s updated successfully", measurement.MeasurementID),
	}, nil
}
