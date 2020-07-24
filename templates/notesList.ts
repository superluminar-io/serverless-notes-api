export const request = (tableName: string): string => `
{
  "TableName": "${tableName}"
}
`;

export const response = `
#set($inputRoot = $input.path('$'))
{
  "notes": [
    #foreach($elem in $inputRoot.Items) {
        "id": "$elem.id.S",
        "text": "$elem.text.S"
    }#if($foreach.hasNext),#end
    #end
  ]
}
`;
