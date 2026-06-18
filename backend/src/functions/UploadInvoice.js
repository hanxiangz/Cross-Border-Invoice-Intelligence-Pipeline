const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

const storageConnection = process.env.AzureWebJobsStorage || process.env.AZURE_STORAGE_CONNECTION_STRING;
const uploadContainer = 'uploads';

app.http('UploadInvoice', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('UploadInvoice request started');

        // Log request headers for debugging
        context.log(`Request headers: ${JSON.stringify(request.headers)}`);

        if (!storageConnection) {
            context.log('ERROR: Azure storage connection string not configured');
            return {
                status: 500,
                body: { error: 'Azure storage connection string is not configured.' }
            };
        }

        // Parse the request body as JSON
        let body;
        try {
            body = await request.json();
            context.log(`Successfully parsed JSON body`);
            context.log(`fileName: ${body.fileName}`);
            context.log(`contentType: ${body.contentType}`);
            context.log(`Base64 length: ${body.content?.length || 0}`);
            
            // Log first 20 characters of Base64 to verify it's valid
            if (body.content) {
                context.log(`Base64 preview: ${body.content.substring(0, 30)}...`);
            }
        } catch (error) {
            context.log(`ERROR parsing JSON: ${error.message}`);
            return {
                status: 400,
                body: { 
                    error: 'Invalid JSON payload. Please ensure content-type is application/json.',
                    details: error.message
                }
            };
        }

        // Validate required fields
        if (!body || !body.fileName || !body.content) {
            context.log('ERROR: Missing fileName or content in request body');
            context.log(`body: ${JSON.stringify(body)}`);
            return {
                status: 400,
                body: { 
                    error: 'Request must include fileName and base64 content.',
                    received: {
                        hasFileName: !!body?.fileName,
                        hasContent: !!body?.content
                    }
                }
            };
        }

        // Check if Base64 content is valid (starts with expected patterns)
        const validBase64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
        const base64Clean = body.content.replace(/\s/g, '');
        if (!validBase64Pattern.test(base64Clean.substring(0, 100))) {
            context.log(`WARNING: Base64 content appears invalid. Preview: ${base64Clean.substring(0, 30)}`);
            // Don't fail here — let Buffer.from handle it
        }

        const fileName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const blobName = `${Date.now()}-${fileName}`;
        const contentType = body.contentType || 'application/octet-stream';

        // 🔧 TEMPORARY TEST MODE: Uncomment this block to test without uploading to Blob Storage
        /*
        context.log('TEST MODE: Returning payload without uploading');
        return {
            status: 200,
            body: {
                success: true,
                testMode: true,
                receivedFileName: fileName,
                contentType: contentType,
                base64Length: body.content.length,
                base64Preview: body.content.substring(0, 50)
            }
        };
        */

        try {
            context.log(`Attempting to upload to Blob Storage...`);
            context.log(`Container: ${uploadContainer}`);
            context.log(`Blob name: ${blobName}`);
            
            const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnection);
            const containerClient = blobServiceClient.getContainerClient(uploadContainer);
            
            context.log(`Creating container if it doesn't exist...`);
            await containerClient.createIfNotExists();

            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            
            context.log(`Converting Base64 to buffer...`);
            const buffer = Buffer.from(body.content, 'base64');
            context.log(`Buffer size: ${buffer.length} bytes`);

            context.log(`Uploading to blob storage...`);
            await blockBlobClient.uploadData(buffer, {
                blobHTTPHeaders: {
                    blobContentType: contentType
                }
            });

            context.log(`✅ Uploaded file to blob: ${blobName}`);
            context.log(`URL: ${blockBlobClient.url}`);

            return {
                status: 200,
                body: {
                    success: true,
                    blobName,
                    url: blockBlobClient.url,
                    fileSize: buffer.length
                }
            };
        } catch (error) {
            context.log(`❌ ERROR uploading file: ${error.message}`);
            context.log(`Error details: ${JSON.stringify(error)}`);
            return {
                status: 500,
                body: { 
                    error: error.message,
                    details: error.stack || 'No stack trace available'
                }
            };
        }
    }
});