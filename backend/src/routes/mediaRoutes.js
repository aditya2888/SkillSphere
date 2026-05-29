const express = require('express');
const router = express.Router();
const { generateSasUrl } = require('../utils/azureBlob');

/**
 * GET /api/media/sas?url=<encodedStoredUrl>
 * Returns a JSON { signedUrl } with a time-limited SAS URL for the given stored blob reference.
 * The frontend uses this to display images and videos.
 */
router.get('/sas', (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ message: 'url query parameter is required' });
    }

    try {
        const signedUrl = generateSasUrl(decodeURIComponent(url), 120); // 2-hour SAS
        return res.json({ signedUrl });
    } catch (err) {
        console.error('SAS generation error:', err.message);
        return res.status(500).json({ message: 'Failed to generate media URL' });
    }
});

/**
 * GET /api/media/redirect?url=<encodedStoredUrl>
 * Redirects directly to the SAS URL — useful for simple <img src="..."> usage.
 */
router.get('/redirect', (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send('url parameter is required');
    }

    try {
        const signedUrl = generateSasUrl(decodeURIComponent(url), 120);
        return res.redirect(302, signedUrl);
    } catch (err) {
        console.error('SAS redirect error:', err.message);
        return res.status(500).send('Failed to generate media URL');
    }
});

module.exports = router;
