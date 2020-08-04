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

#if(!$inputRoot.toString().contains("Item"))
#set($context.responseOverride.status = 404)
{
  "message":"Note not found"
}
#else
{
  "id": "$inputRoot.Item.id.S",
  "text": "$inputRoot.Item.text.S"
}
#end
`;
