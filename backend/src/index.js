const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: true,
});

require('./functions/httpTrigger1');
require('./functions/ProcessBlobUpload');
require('./functions/UploadInvoice');
