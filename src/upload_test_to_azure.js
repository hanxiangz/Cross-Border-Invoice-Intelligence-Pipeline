const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const settingsPath = path.join(__dirname, 'local.settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const conn = settings.Values && settings.Values.AzureWebJobsStorage;
    if (!conn) {
      console.error('AzureWebJobsStorage not found in local.settings.json');
      process.exit(2);
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(conn);
    const containerName = 'uploads';  // The container that ProcessBlobUpload listens to
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists();

    const blobName = `test-upload-${Date.now()}.txt`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const content = `Test file uploaded at ${new Date().toISOString()}\n\nYour local ProcessBlobUpload function should trigger on this blob!`;

    await blockBlobClient.upload(content, Buffer.byteLength(content));
    console.log(`✅ Uploaded blob to Azure: ${blobName}`);
    console.log(`📁 Container: ${containerName}`);
    console.log(`💻 Local ProcessBlobUpload function should log this upload in ~5 seconds...`);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
