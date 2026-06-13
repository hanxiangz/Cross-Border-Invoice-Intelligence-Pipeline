const { app } = require('@azure/functions');

app.storageBlob('ProcessBlobUpload', {
    path: 'uploads/{name}',
    connection: 'AzureWebJobsStorage',
    handler: async (blob, context) => {
        context.log(`Blob trigger function processed blob\n Name:${context.triggerMetadata.name}\n Size: ${blob.length} Bytes`);
    }
});