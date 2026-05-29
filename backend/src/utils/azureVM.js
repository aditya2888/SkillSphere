/**
 * Azure Virtual Machine Management Utility
 * Uses @azure/arm-compute + @azure/identity (Service Principal auth)
 *
 * SETUP in .env:
 *   AZURE_SUBSCRIPTION_ID  — Your Azure Subscription ID
 *   AZURE_TENANT_ID        — Microsoft Entra ID → Tenant ID
 *   AZURE_CLIENT_ID        — App Registration → Application (client) ID
 *   AZURE_CLIENT_SECRET    — App Registration → Certificates & Secrets → New secret
 *   AZURE_VM_RESOURCE_GROUP — Resource group containing your VMs
 *
 * Azure Portal → Microsoft Entra ID → App registrations → New registration
 * Then grant it "Virtual Machine Contributor" role on your subscription.
 */

const { ComputeManagementClient } = require('@azure/arm-compute');
const { ClientSecretCredential } = require('@azure/identity');

let computeClient = null;

function getComputeClient() {
  if (computeClient) return computeClient;

  const { AZURE_SUBSCRIPTION_ID, AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET } = process.env;

  if (!AZURE_SUBSCRIPTION_ID || !AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) {
    return null;
  }

  const credential = new ClientSecretCredential(AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET);
  computeClient = new ComputeManagementClient(credential, AZURE_SUBSCRIPTION_ID);
  return computeClient;
}

const RESOURCE_GROUP = () => process.env.AZURE_VM_RESOURCE_GROUP || 'skillsphere-rg';

/**
 * List all VMs in the configured resource group with their power state.
 * Returns array of { name, location, size, status, os, id }
 */
async function listVMs() {
  const client = getComputeClient();
  if (!client) return { configured: false, vms: [] };

  const vms = [];
  try {
    for await (const vm of client.virtualMachines.list(RESOURCE_GROUP())) {
      // Get instance view for power state
      let status = 'Unknown';
      try {
        const instanceView = await client.virtualMachines.instanceView(RESOURCE_GROUP(), vm.name);
        const powerState = instanceView.statuses?.find(s => s.code?.startsWith('PowerState/'));
        status = powerState ? powerState.displayStatus : 'Unknown';
      } catch { /* instance view may fail for deallocated VMs */ }

      vms.push({
        id: vm.id,
        name: vm.name,
        location: vm.location,
        size: vm.hardwareProfile?.vmSize,
        os: vm.storageProfile?.osDisk?.osType,
        status,
      });
    }
    return { configured: true, vms };
  } catch (err) {
    console.error('[AzureVM] Failed to list VMs:', err.message);
    return { configured: true, vms: [], error: err.message };
  }
}

/**
 * Start a VM.
 */
async function startVM(vmName) {
  const client = getComputeClient();
  if (!client) throw new Error('VM management not configured');
  const poller = await client.virtualMachines.beginStart(RESOURCE_GROUP(), vmName);
  await poller.pollUntilDone();
  return { message: `VM "${vmName}" started successfully` };
}

/**
 * Stop (deallocate) a VM.
 */
async function stopVM(vmName) {
  const client = getComputeClient();
  if (!client) throw new Error('VM management not configured');
  const poller = await client.virtualMachines.beginDeallocate(RESOURCE_GROUP(), vmName);
  await poller.pollUntilDone();
  return { message: `VM "${vmName}" stopped and deallocated successfully` };
}

/**
 * Restart a VM.
 */
async function restartVM(vmName) {
  const client = getComputeClient();
  if (!client) throw new Error('VM management not configured');
  const poller = await client.virtualMachines.beginRestart(RESOURCE_GROUP(), vmName);
  await poller.pollUntilDone();
  return { message: `VM "${vmName}" restarted successfully` };
}

/**
 * Check if VM service is configured.
 */
function isVMConfigured() {
  return !!(
    process.env.AZURE_SUBSCRIPTION_ID &&
    process.env.AZURE_TENANT_ID &&
    process.env.AZURE_CLIENT_ID &&
    process.env.AZURE_CLIENT_SECRET
  );
}

module.exports = { listVMs, startVM, stopVM, restartVM, isVMConfigured };
