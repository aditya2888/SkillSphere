/**
 * Azure Application Insights - monitoring and telemetry
 * Tracks HTTP requests, dependencies, exceptions, and custom events.
 * Dashboard available in the Azure portal (Application Insights).
 *
 * Setup: set AZURE_APPINSIGHTS_CONNECTION_STRING in your environment.
 */

let client = null;

function initAppInsights() {
  const connStr = process.env.AZURE_APPINSIGHTS_CONNECTION_STRING;
  if (!connStr) {
    console.warn('[AppInsights] Connection string not configured — monitoring disabled.');
    return;
  }

  try {
    const appInsights = require('applicationinsights');
    appInsights
      .setup(connStr)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setSendLiveMetrics(true)          // live stream on Azure Portal
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .start();

    client = appInsights.defaultClient;
    client.context.tags[client.context.keys.cloudRole] = 'SkillSphere-Backend';

    console.log('[AppInsights] Application Insights initialized, live monitoring enabled.');
  } catch (err) {
    console.error('[AppInsights] Failed to initialize:', err.message);
  }
}

/**
 * Track a custom event (e.g., user enrolled, course created).
 * @param {string} name  - Event name
 * @param {object} props - Key-value properties
 */
function trackEvent(name, props = {}) {
  if (client) {
    client.trackEvent({ name, properties: props });
  }
}

/**
 * Track a custom metric.
 */
function trackMetric(name, value) {
  if (client) {
    client.trackMetric({ name, value });
  }
}

/**
 * Track an exception.
 */
function trackException(error, props = {}) {
  if (client) {
    client.trackException({ exception: error, properties: props });
  }
}

module.exports = { initAppInsights, trackEvent, trackMetric, trackException };
