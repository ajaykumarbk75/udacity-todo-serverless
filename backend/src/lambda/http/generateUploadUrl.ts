import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

import {
  getAttachmentLinkForTodo,
  getSignedUrl,
  updateAttachmentLinkOfTodo
} from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  // 1. Get signed url
  const signedUrl: string = getSignedUrl(todoId)

  // 2. Update todo item to contain attachmentUrl
  const attachmentUrl: string = getAttachmentLinkForTodo(todoId)
  await updateAttachmentLinkOfTodo(userId, todoId, attachmentUrl)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ uploadUrl: signedUrl })
  }
}
