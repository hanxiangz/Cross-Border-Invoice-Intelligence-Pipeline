const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

const storageConnection = process.env.AzureWebJobsStorage || process.env.AZURE_STORAGE_CONNECTION_STRING;
const uploadContainer = 'uploads';

app.http('UploadInvoice', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('UploadInvoice request started');

        if (!storageConnection) {
            context.log('ERROR: Azure storage connection string not configured');
            return {
                status: 500,
                body: { error: 'Azure storage connection string is not configured.' }
            };
        }

        const body = request.body;
        if (!body || !body.fileName || !body.content) {
            return {
                status: 400,
                body: { error: 'Request must include fileName and base64 content.' }
            };
        }

        const fileName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const blobName = `${Date.now()}-${fileName}`;
        const contentType = body.contentType || 'application/octet-stream';

        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnection);
            const containerClient = blobServiceClient.getContainerClient(uploadContainer);
            await containerClient.createIfNotExists();

            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const buffer = Buffer.from(body.content, 'base64');

            await blockBlobClient.uploadData(buffer, {
                blobHTTPHeaders: {
                    blobContentType: contentType
                }
            });

            context.log(`Uploaded file to blob: ${blobName}`);

            return {
                status: 200,
                body: {
                    success: true,
                    blobName,
                    url: blockBlobClient.url
                }
            };
        } catch (error) {
            context.log(`ERROR uploading file: ${error.message}`);
            return {
                status: 500,
                body: { error: error.message }
            };
        }
    }
});
