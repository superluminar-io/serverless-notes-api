export const request = (tableName: string): string => `
{
  "TableName": "${tableName}",
  "Key": {
    "id": {
      "S": "$input.params('id')"
    }
  },
  "UpdateExpression": "set #text = :text",
  "ExpressionAttributeNames": {
    "#text": "text"
  },
  "ExpressionAttributeValues": {
    ":text": { "S": "$input.path('$.text')" }
  },
  "ReturnValues" : "ALL_NEW"
}
`;

export const response = `
#set($inputRoot = $input.path('$'))
{
  "id": "$inputRoot.Attributes.id.S",
  "text": "$inputRoot.Attributes.text.S"
}
`;
