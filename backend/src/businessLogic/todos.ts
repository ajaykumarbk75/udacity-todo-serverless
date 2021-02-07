import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodosAccess } from '../dataLayer/todosAcces'

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
