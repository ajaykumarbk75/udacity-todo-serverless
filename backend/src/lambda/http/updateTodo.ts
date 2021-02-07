import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {
  isUserAllowedToAccessTodo,
  updateTodo
} from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  // 1. Check if user is allowed to edit the selected item - if not, return an adequate error message incl. status code
  if (!isUserAllowedToAccessTodo(userId, todoId)) {
    return {
      statusCode: 403,
      headers: {},
      body: ''
    }
  }
  // 2. Update the item
  await updateTodo(todoId, updatedTodo)
  return {
    statusCode: 204,
    headers: {},
    body: ''
  }
}
