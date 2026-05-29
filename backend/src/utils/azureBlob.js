const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions,
} = require('@azure/storage-blob');
const path = require('path');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'skillsphere-uploads';

if (!connectionString) {
    console.warn('Azure Storage connection string not configured. Blob uploads disabled.');
}

// Parse storage account name and key from the connection string
function parseConnectionString(connStr) {
    const parts = {};
    connStr.split(';').forEach((part) => {
        const idx = part.indexOf('=');
        if (idx !== -1) {
            parts[part.slice(0, idx)] = part.slice(idx + 1);
        }
    });
    return {
        accountName: parts['AccountName'],
        accountKey: parts['AccountKey'],
    };
}

/**
 * Upload a buffer to Azure Blob Storage and return the blob name (not the full URL).
 * We store only the blob name so we can always generate fresh SAS URLs later.
 */
async function uploadBuffer(buffer, originalName, contentType) {
    if (!connectionString) {
        throw new Error('Azure Storage not configured');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Generate a unique blob name using timestamp + sanitized filename
    const ext = path.extname(originalName) || '';
    const baseName = path.basename(originalName, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const blobName = `${Date.now()}-${baseName}${ext}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const uploadOptions = {
        blobHTTPHeaders: { blobContentType: contentType || 'application/octet-stream' },
    };
    await blockBlobClient.uploadData(buffer, uploadOptions);

    // Return the internal blob reference (azblob://container/blob)
    // SAS URLs are generated on demand by generateSasUrl()
    return `azblob://${containerName}/${blobName}`;
}

/**
 * Given a stored URL/path, generate a time-limited SAS URL (1 hour by default).
 * Handles three formats:
 *   1. azblob://container/blobName  — our new format
 *   2. Full https://....blob.core.windows.net/container/blobName — legacy format
 *   3. Relative /uploads/... path — local dev, returned as-is
 */
function generateSasUrl(storedUrl, expiryMinutes = 60) {
    if (!storedUrl) return '';

    // Local path or no connection string: return as-is
    if (storedUrl.startsWith('/uploads/') || !connectionString) {
        return storedUrl;
    }

    let blobName;

    if (storedUrl.startsWith('azblob://')) {
        // Format: azblob://container/blobName
        const withoutScheme = storedUrl.slice('azblob://'.length);
        const slashIdx = withoutScheme.indexOf('/');
        blobName = withoutScheme.slice(slashIdx + 1);
    } else if (storedUrl.startsWith('https://') && storedUrl.includes('.blob.core.windows.net/')) {
        // Legacy full URL format (https://<account>.blob.core.windows.net/container/blob)
        const urlObj = new URL(storedUrl);
        // pathname = /containerName/blobName
        const parts = urlObj.pathname.split('/').filter(Boolean);
        // parts[0] = containerName, parts[1..] = blobName
        blobName = parts.slice(1).join('/');
    } else {
        // Unknown format: return unchanged
        return storedUrl;
    }

    try {
        const { accountName, accountKey } = parseConnectionString(connectionString);
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

        const expiresOn = new Date();
        expiresOn.setMinutes(expiresOn.getMinutes() + expiryMinutes);

        const sasToken = generateBlobSASQueryParameters(
            {
                containerName,
                blobName,
                permissions: BlobSASPermissions.parse('r'), // read-only
                expiresOn,
            },
            sharedKeyCredential
        ).toString();

        return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
    } catch (err) {
        console.error('Failed to generate SAS URL:', err.message);
        return storedUrl; // fallback to stored URL
    }
}

module.exports = { uploadBuffer, generateSasUrl };
