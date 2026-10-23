const { app, output } = require('@azure/functions');
const createClient = require('@azure-rest/ai-vision-image-analysis').default;
const { AzureKeyCredential } = require('@azure/core-auth');
const { extractInvoiceData } = require('../utils/extractInvoiceData');

// Get credentials from environment variables
const key = process.env.AI_VISION_KEY;
const endpoint = process.env.AI_VISION_ENDPOINT;

// Define Cosmos DB output binding
const cosmosOutput = output.cosmosDB({
    databaseName: 'chinatrade-cosmos',
    containerName: 'ProcessingResults',
    connection: 'COSMOS_DB_CONNECTION',
    createIfNotExists: true
});

app.storageBlob('ProcessBlobUpload', {
    path: 'uploads/{name}',
    connection: 'AzureWebJobsStorage',
    extraOutputs: [cosmosOutput],
    handler: async (blob, context) => {
        const fileName = context.triggerMetadata.name;
        context.log(`Processing: ${fileName}`);
        context.log(`File size: ${blob.length} bytes`);

        if (!key || !endpoint) {
            context.log('ERROR: AI Vision credentials not set');
            const errorDoc = {
                id: fileName,
                fileName: fileName,
                status: 'error',
                error: 'AI Vision credentials not set',
                processedAt: new Date().toISOString()
            };
            context.extraOutputs.set(cosmosOutput, errorDoc);
            return;
        }

        try {
            // Create the Image Analysis client
            const credential = new AzureKeyCredential(key);
            const client = createClient(endpoint, credential);

            context.log('Calling Azure AI Vision OCR...');

            // Analyze the image Buffer directly
            const result = await client.path('/imageanalysis:analyze').post({
                body: blob,  // Pass the Buffer directly
                queryParameters: {
                    features: ['Read']  // OCR feature
                },
                contentType: 'application/octet-stream'
            });

            const iaResult = result.body;

            // Extract text from the result
            let extractedText = '';
            if (iaResult.readResult && iaResult.readResult.blocks) {
                for (const block of iaResult.readResult.blocks) {
                    for (const line of block.lines) {
                        extractedText += line.text + '\n';
                    }
                }
            }

            // Handle case where no text was extracted
            if (!extractedText || extractedText.trim().length === 0) {
                context.log('WARNING: No text extracted from image');
                const warningDoc = {
                    id: fileName,
                    fileName: fileName,
                    status: 'warning',
                    message: 'No text could be extracted from this image. It may not be an invoice.',
                    processedAt: new Date().toISOString()
                };
                context.extraOutputs.set(cosmosOutput, warningDoc);
                return;
            }

            context.log(`OCR Result:\n${extractedText}`);
            context.log(`Total characters extracted: ${extractedText.length}`);

            // Extract structured fields from the OCR text
            const extracted = extractInvoiceData(extractedText);
            const { invoiceNumber, amount, date, supplier } = extracted;

            context.log(`Invoice Number: ${invoiceNumber}`);
            context.log(`Amount: ${amount}`);
            context.log(`Date: ${date}`);
            context.log(`Supplier: ${supplier}`);

            // Save to Cosmos DB
            const doc = {
                id: fileName,
                fileName: fileName,
                extractedText: extractedText,
                invoiceNumber: invoiceNumber,
                amount: amount,
                date: date,           // ← NEW
                supplier: supplier,   // ← NEW
                processedAt: new Date().toISOString(),
                status: 'completed'
            };

            context.extraOutputs.set(cosmosOutput, doc);
            context.log(`✅ Saved to Cosmos DB: ${fileName}`);

        } catch (error) {
            context.log(`ERROR processing image: ${error.message}`);
            context.log(`Error stack: ${error.stack}`);

            const errorDoc = {
                id: fileName,
                fileName: fileName,
                status: 'error',
                error: error.message,
                processedAt: new Date().toISOString()
            };
            context.extraOutputs.set(cosmosOutput, errorDoc);
        }

        context.log(`Finished processing: ${fileName}`);
    }
});