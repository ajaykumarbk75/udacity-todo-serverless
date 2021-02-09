import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

import {
  getAttachmentLinkForTodo,
  getSignedUrl,
  isUserAllowedToAccessTodo,
  updateAttachmentLinkOfTodo
} from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  logger.info(
    `generateUploadUrl.ts: user ${userId} wants to attach a file to todo ${todoId} and requests a signed url`
  )

  // 1. Check if user is allowed to access the selected todo - if not, return an adequate error message incl. status code
  const isUserAllowed: Boolean = await isUserAllowedToAccessTodo(userId, todoId)
  logger.info(
    `generateUploadUrl.ts: User ${userId} is allowed to access todo ${todoId}: ${isUserAllowed}`
  )
  if (!isUserAllowed) {
    logger.info(
      `generateUploadUrl.ts: Signed URL for todo ${todoId} and user ${userId} has not been created because of insufficient permissions`
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

  // 2. Get signed url
  const signedUrl: string = getSignedUrl(todoId)

  // 3. Update todo item to contain attachmentUrl
  const attachmentUrl: string = getAttachmentLinkForTodo(todoId)
  await updateAttachmentLinkOfTodo(userId, todoId, attachmentUrl)
  logger.info(
    `generateUploadUrl.ts: Signed URL for todo ${todoId} and user ${userId} has been created: ${signedUrl}`
  )

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ uploadUrl: signedUrl })
  }
}
