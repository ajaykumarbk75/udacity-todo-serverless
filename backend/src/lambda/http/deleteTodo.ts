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
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  // 1. Check if user is allowed to access the selected todo - if not, return an adequate error message incl. status code
  const isUserAllowed: Boolean = await isUserAllowedToAccessTodo(userId, todoId)
  logger.info(
    `deleteTodo.ts: User ${userId} is allowed to access todo ${todoId}: ${isUserAllowed}`
  )
  if (!isUserAllowed) {
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }

  // 2. Delete the item
  await deleteTodo(userId, todoId)
  logger.info(
    `deleteTodo.ts: Todo ${todoId} for user ${userId} has been deleted.`
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
