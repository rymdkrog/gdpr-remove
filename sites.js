/**
 * Site configuration for GDPR removal requests.
 *
 * To add a new site, add an entry to the SITES array below:
 *
 * {
 *   name: "Example Site",            // Display name
 *   domain: "example.com",           // Domain to match (including subdomains)
 *   email: "gdpr@example.com",       // Email to send GDPR request to
 *   dataController: "Example AB",    // Legal entity name
 *   orgNumber: "123456-7890",        // Organization number
 * }
 *
 * Don't forget to also add "*://*.example.com/*" to host_permissions in manifest.json.
 */

const SITES = [
  {
    name: "Aftonbladet",
    domain: "aftonbladet.se",
    email: "annonsval@schibsted.se",
    dataController: "Schibsted News Media AB",
    orgNumber: "559343-3666",
  },
];
