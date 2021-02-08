import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIdIndex = process.env.CREATED_AT_INDEX
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
        IndexName: this.createdAtIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async getTodo(userId: string, todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise()
    return result.Item as TodoItem
  }

  async updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
  ): Promise<TodoUpdate> {
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': updateTodoRequest.name,
          ':dueDate': updateTodoRequest.dueDate,
          ':done': updateTodoRequest.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      })
      .promise()
    return result.Attributes as TodoUpdate
  }

  async updateAttachmentLinkOfTodo(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ): Promise<TodoUpdate> {
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
    return result.Attributes as TodoUpdate
  }

  async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise()

    return result.Attributes as TodoItem
  }
}

function createDynamoDBClient(): DocumentClient {
  return new AWS.DynamoDB.DocumentClient()
}
