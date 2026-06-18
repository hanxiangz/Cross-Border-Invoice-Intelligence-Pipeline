const { app } = require('@azure/functions');
const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { ApiKeyCredentials } = require('@azure/ms-rest-js');
const { Readable } = require('stream');

// Get credentials from environment variables
const key = process.env.AI_VISION_KEY;
const endpoint = process.env.AI_VISION_ENDPOINT;

app.storageBlob('ProcessBlobUpload', {
    path: 'uploads/{name}',
    connection: 'AzureWebJobsStorage',
    handler: async (blob, context) => {
        const fileName = context.triggerMetadata.name;
        context.log(`Processing: ${fileName}`);
        context.log(`File size: ${blob.length} bytes`);
        
        if (!key || !endpoint) {
            context.log('ERROR: AI Vision credentials not set in environment variables');
            return;
        }
        
        try {
            // Create AI Vision client
            const credentials = new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
            const client = new ComputerVisionClient(credentials, endpoint);
            
            // ✅ FIX: Convert Buffer to Readable Stream
            const stream = Readable.from(blob);
            
            // Call OCR on the image using the stream
            context.log('Calling Azure AI Vision OCR...');
            const result = await client.recognizePrintedTextInStream(true, stream);
            
            // Extract all text from the result
            let extractedText = '';
            if (result.regions) {
                for (const region of result.regions) {
                    for (const line of region.lines) {
                        for (const word of line.words) {
                            extractedText += word.text + ' ';
                        }
                        extractedText += '\n';
                    }
                }
            }
            
            context.log(`OCR Result:\n${extractedText}`);
            context.log(`Total characters extracted: ${extractedText.length}`);
            
            // Try to find invoice number (simple pattern)
            const invoiceMatch = extractedText.match(/INV-\d{3}-\d{3}/i) || extractedText.match(/发票号码[:：]\s*(\S+)/);
            const amountMatch = extractedText.match(/¥?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
            
            context.log(`Potential invoice number: ${invoiceMatch ? invoiceMatch[0] : 'Not found'}`);
            context.log(`Potential amount: ${amountMatch ? amountMatch[1] : 'Not found'}`);
            
        } catch (error) {
            context.log(`ERROR processing image: ${error.message}`);
            context.log(`Error stack: ${error.stack}`);
        }
        
        context.log(`Finished processing: ${fileName}`);
    }
});