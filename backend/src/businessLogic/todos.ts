import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION_TIME

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  return await todosAccess.createTodo({
    todoId,
    userId,
    createdAt: new Date().toISOString(),
    ...createTodoRequest,
    done: false
  })
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
  const todos = await todosAccess.getTodos(userId)
  return todos
}

export async function isUserAllowedToAccessTodo(
  userId: string,
  todoId: string
): Promise<Boolean> {
  const todo: TodoItem = await todosAccess.getTodo(userId, todoId)
  if (todo) {
    return true
  }
  return false
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {
  const updatedTodo = await todosAccess.updateTodo(
    userId,
    todoId,
    updateTodoRequest
  )
  return updatedTodo
}

export async function updateAttachmentLinkOfTodo(
  userId: string,
  todoId: string,
  attachmentUrl: string
) {
  const updatedTodo = await todosAccess.updateAttachmentLinkOfTodo(
    userId,
    todoId,
    attachmentUrl
  )
  return updatedTodo
}

export function getAttachmentLinkForTodo(todoId: string) {
  return `https://${bucketName}.s3.amazonaws.com/${todoId}`
}

export function getSignedUrl(todoId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  const item = await todosAccess.deleteTodo(userId, todoId)
  return item
}
