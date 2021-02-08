import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { getUserId } from '../utils'
import {
  deleteTodo,
  isUserAllowedToAccessTodo
} from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  // 1. Check if user is allowed to edit the selected item - if not, return an adequate error message incl. status code
  if (!isUserAllowedToAccessTodo(userId, todoId)) {
    return {
      statusCode: 403,
      headers: {},
      body: ''
    }
  }
  // 2. Delete the item
  await deleteTodo(userId, todoId)
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
