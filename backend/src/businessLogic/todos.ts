import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()

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
  const todo: TodoItem = await todosAccess.getTodo(todoId)
  if (todo.userId === userId) return true
  return false
}

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {
  const updatedTodo = await todosAccess.updateTodo(todoId, updateTodoRequest)
  return updatedTodo
}

export async function deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
  const item = await todosAccess.deleteTodo(userId, todoId)
  return item
}
