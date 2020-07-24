export const request = (tableName: string): string => `
{
  "TableName": "${tableName}",
  "Key": {
    "id": {
      "S": "$input.params('id')"
    }
  },
  "ReturnValues": "ALL_OLD"
}
`;

export const response = `
#set($inputRoot = $input.path('$'))
{
  "id": "$inputRoot.Attributes.id.S",
  "text": "$inputRoot.Attributes.text.S"
}
`;
