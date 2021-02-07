import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async getTodo(todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: { todoId }
      })
      .promise()
    return result.Item as TodoItem
  }

  async updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
  ): Promise<TodoUpdate> {
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { todoId },
        UpdateExpression:
          'set name = :name and dueDate = :dueDate and done = :done',
        ExpressionAttributeValues: {
          ':name': updateTodoRequest.name,
          ':dueDate': updateTodoRequest.dueDate,
          ':done': updateTodoRequest.done
        }
      })
      .promise()
    return result.Attributes as TodoUpdate
  }

  async deleteTodo(todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { todoId }
      })
      .promise()

    return result.Attributes as TodoItem
  }
}

function createDynamoDBClient(): DocumentClient {
  return new AWS.DynamoDB.DocumentClient()
}
