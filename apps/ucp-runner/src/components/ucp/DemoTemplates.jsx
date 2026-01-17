// Demo Templates for UCP Runner with baseline token counts

export const getDemoTemplates = () => [
  {
    id: "tpl_lead_capture",
    name: "Lead Capture Workflow",
    intent: "Capture a lead from a form submission and notify the team",
    category: "API",
    tags: ["lead", "form", "webhook", "sales"],
    packetJson: JSON.stringify({
      ucp_version: "0.1",
      id: "pkt_lead_capture_{{timestamp}}",
      ttl_seconds: 86400,
      required_drivers: ["http", "notification"],
      permissions: ["network", "notifications"],
      meta: {
        name: "Lead Capture",
        owner: "Omega UI, LLC",
        description: "Submit lead data and notify team"
      },
      ops: [
        {
          op: "http.post",
          id: "submit_lead",
          args: {
            url: "https://httpbin.org/post",
            json: {
              lead_name: "{{lead_name}}",
              lead_email: "{{lead_email}}",
              source: "UCP Template"
            }
          }
        },
        {
          op: "notify.show",
          id: "notify_success",
          args: {
            title: "Lead Captured",
            body: "New lead submitted successfully"
          }
        }
      ],
      signature: null
    }, null, 2),
    embeddingHint: "lead capture form submission webhook notify team sales",
    baselinePromptTokens: 850,
    baselineCompletionTokens: 320
  },
  {
    id: "tpl_data_sync",
    name: "Data Synchronization",
    intent: "Sync data between systems with validation and error handling",
    category: "Data",
    tags: ["sync", "backup", "api", "cache"],
    packetJson: JSON.stringify({
      ucp_version: "0.1",
      id: "pkt_data_sync_{{timestamp}}",
      ttl_seconds: 86400,
      required_drivers: ["http", "local_storage", "notification"],
      permissions: ["network", "storage", "notifications"],
      meta: {
        name: "Data Sync",
        owner: "Omega UI, LLC",
        description: "Synchronize data with error handling"
      },
      ops: [
        {
          type: "try",
          id: "sync_workflow",
          ops: [
            {
              op: "http.get",
              id: "fetch_source",
              args: {
                url: "https://httpbin.org/json"
              }
            },
            {
              op: "local.put",
              id: "cache_data",
              args: {
                key: "sync_cache",
                value: "{{opId.fetch_source.response}}"
              }
            },
            {
              op: "http.post",
              id: "push_destination",
              args: {
                url: "https://httpbin.org/post",
                json: "{{opId.fetch_source.response}}"
              }
            }
          ],
          catch: [
            {
              op: "notify.show",
              id: "sync_error",
              args: {
                title: "Sync Failed",
                body: "Data synchronization encountered an error"
              }
            }
          ],
          finally: [
            {
              op: "local.put",
              id: "sync_timestamp",
              args: {
                key: "last_sync",
                value: "{{timestamp}}"
              }
            }
          ]
        },
        {
          op: "notify.show",
          id: "sync_complete",
          args: {
            title: "Sync Complete",
            body: "Data synchronized successfully"
          }
        }
      ],
      signature: null
    }, null, 2),
    embeddingHint: "sync synchronize data api webhook transfer backup cache",
    baselinePromptTokens: 1200,
    baselineCompletionTokens: 450
  }
];

export default { getDemoTemplates };