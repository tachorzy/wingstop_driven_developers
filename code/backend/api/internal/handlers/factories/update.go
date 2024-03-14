package factories

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"net/http"
)

func NewUpdateFactoryHandler(db DynamoDBClient) *Handler {
	return &Handler{
		DynamoDB: db,
	}
}

var UpdateExpressionBuilder = func(update expression.UpdateBuilder) (expression.Expression, error) {
	return expression.NewBuilder().WithUpdate(update).Build()
}

func (h Handler) HandleUpdateFactoryRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var factory Factory
	if err := json.Unmarshal([]byte(request.Body), &factory); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       fmt.Sprintf("Error parsing JSON body: %s", err.Error()),
		}, nil
	}

	key := map[string]types.AttributeValue{
		"factoryId": &types.AttributeValueMemberS{Value: factory.FactoryID},
	}

	var updateBuilder expression.UpdateBuilder
	if factory.Name != nil {
		updateBuilder = updateBuilder.Set(expression.Name("name"), expression.Value(*factory.Name))
	}
	if factory.Description != nil {
		updateBuilder = updateBuilder.Set(expression.Name("description"), expression.Value(*factory.Description))
	}
	if factory.Location != nil {
		if factory.Location.Longitude != nil {
			updateBuilder = updateBuilder.Set(expression.Name("location.longitude"), expression.Value(*factory.Location.Longitude))
		}
		if factory.Location.Latitude != nil {
			updateBuilder = updateBuilder.Set(expression.Name("location.latitude"), expression.Value(*factory.Location.Latitude))
		}
	}

	expr, err := UpdateExpressionBuilder(updateBuilder)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
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
			Body:       fmt.Sprintf("Error updating item into DynamoDB: %s", err.Error()),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       fmt.Sprintf("factoryId %s updated successfully", factory.FactoryID),
	}, nil
}