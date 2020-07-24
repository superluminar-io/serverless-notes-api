export const request = (tableName: string): string => `
{ 
  "TableName": "${tableName}",
  "Item": {
    "id": {
      "S": "$context.requestId"
    },
    "text": {
      "S": "$input.path('$.text')"
    }
  }
}
`;

export const response = `
{
  "id": "$context.requestId"
}
`;
