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
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  logger.info(
    `updateTodo.ts: user ${userId} wants to update todo ${todoId} with the following data ${updatedTodo}`
  )

  // 1. Check if user is allowed to access the selected todo - if not, return an adequate error message incl. status code
  const isUserAllowed: Boolean = await isUserAllowedToAccessTodo(userId, todoId)
  logger.info(
    `updateTodo.ts: User ${userId} is allowed to access todo ${todoId}: ${isUserAllowed}`
  )
  if (!isUserAllowed) {
    logger.info(
      `updateTodo.ts: Todo ${todoId} with user ${userId} has not been updated because of insufficient permissions`
    )
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }

  // 2. Update the item
  await updateTodo(userId, todoId, updatedTodo)
  logger.info(
    `updateTodo.ts: Todo ${todoId} with user ${userId} has been updated`
  )
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
