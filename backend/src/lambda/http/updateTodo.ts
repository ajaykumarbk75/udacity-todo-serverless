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

  logger.info('Updating todo...')
  // 1. Check if user is allowed to edit the selected item - if not, return an adequate error message incl. status code
  if (!(await isUserAllowedToAccessTodo(userId, todoId))) {
    logger.error('User not allowed to update specified todo')
    return {
      statusCode: 403,
      headers: {},
      body: ''
    }
  }

  // 2. Update the item
  await updateTodo(userId, todoId, updatedTodo)
  logger.info('Todo updated.')
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
