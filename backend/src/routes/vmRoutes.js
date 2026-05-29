/**
 * Azure VM Management Routes
 * Protected — requires authentication (admin use)
 *
 * GET  /api/vm          — list all VMs in resource group
 * POST /api/vm/:name/start   — start a VM
 * POST /api/vm/:name/stop    — stop/deallocate a VM
 * POST /api/vm/:name/restart — restart a VM
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { listVMs, startVM, stopVM, restartVM, isVMConfigured } = require('../utils/azureVM');
const { trackEvent } = require('../utils/appInsights');

// GET /api/vm — List all VMs with their status
router.get('/', protect, async (req, res) => {
  try {
    if (!isVMConfigured()) {
      return res.json({
        configured: false,
        message: 'Azure VM credentials not configured. Add AZURE_SUBSCRIPTION_ID, AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET to .env',
        vms: [],
      });
    }
    const result = await listVMs();
    res.json(result);
  } catch (err) {
    console.error('[AzureVM] List error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/vm/:name/start
router.post('/:name/start', protect, async (req, res) => {
  try {
    const result = await startVM(req.params.name);
    trackEvent('VMStarted', { vmName: req.params.name, userId: req.user.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/vm/:name/stop
router.post('/:name/stop', protect, async (req, res) => {
  try {
    const result = await stopVM(req.params.name);
    trackEvent('VMStopped', { vmName: req.params.name, userId: req.user.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/vm/:name/restart
router.post('/:name/restart', protect, async (req, res) => {
  try {
    const result = await restartVM(req.params.name);
    trackEvent('VMRestarted', { vmName: req.params.name, userId: req.user.id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
