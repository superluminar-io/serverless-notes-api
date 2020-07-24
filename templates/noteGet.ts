export const request = (tableName: string): string => `
{
  "TableName": "${tableName}",
  "Key": {
    "id": {
      "S": "$input.params('id')"
    }
  }
}
`;

export const response = `
#set($inputRoot = $input.path('$'))
{
  "id": "$inputRoot.Item.id.S",
  "text": "$inputRoot.Item.text.S"
}
`;
