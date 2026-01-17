// Demo Packets for UCP Runner - Extended with advanced control flow examples

export const getDemoPackets = (demoEndpoint = 'https://httpbin.org/post') => [
  // Basic HTTP POST Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_http_post",
    ttl_seconds: 86400,
    required_drivers: ["http"],
    permissions: ["network"],
    meta: {
      name: "Demo Lead Submit",
      owner: "Omega UI, LLC",
      description: "Demonstrates HTTP POST with JSON payload"
    },
    ops: [
      {
        op: "http.post",
        id: "lead_submit",
        args: {
          url: demoEndpoint,
          json: {
            name: "Jane Doe",
            email: "jane@example.com",
            source: "UCP-Runner-Demo",
            timestamp: new Date().toISOString()
          }
        }
      },
      {
        op: "notify.show",
        id: "success_toast",
        args: {
          title: "Lead Submitted",
          body: "HTTP POST completed successfully"
        }
      }
    ],
    signature: null
  },

  // Local Storage Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_local_storage",
    ttl_seconds: 86400,
    required_drivers: ["local_storage"],
    permissions: ["storage"],
    meta: {
      name: "Local Storage Demo",
      owner: "Omega UI, LLC",
      description: "Demonstrates local key-value storage operations"
    },
    ops: [
      {
        op: "local.put",
        id: "store_user",
        args: {
          key: "demo_user_id",
          value: "usr_" + Date.now()
        }
      },
      {
        op: "local.get",
        id: "retrieve_user",
        args: {
          key: "demo_user_id"
        }
      },
      {
        op: "local.put",
        id: "store_session",
        args: {
          key: "demo_session",
          value: "session_active"
        }
      },
      {
        op: "notify.show",
        id: "storage_toast",
        args: {
          title: "Storage Complete",
          body: "User ID stored and retrieved successfully"
        }
      }
    ],
    signature: null
  },

  // Notification Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_notifications",
    ttl_seconds: 86400,
    required_drivers: ["notification"],
    permissions: ["notifications"],
    meta: {
      name: "Notification Demo",
      owner: "Omega UI, LLC",
      description: "Demonstrates notification/toast functionality"
    },
    ops: [
      {
        op: "notify.show",
        id: "welcome_notif",
        args: {
          title: "Welcome to UCP",
          body: "Universal Command Protocol is ready"
        }
      },
      {
        op: "notify.show",
        id: "info_notif",
        args: {
          title: "Demo Running",
          body: "This is a demonstration of the notify driver"
        }
      },
      {
        op: "notify.show",
        id: "complete_notif",
        args: {
          title: "Demo Complete",
          body: "All notifications sent successfully"
        }
      }
    ],
    signature: null
  },

  // NEW: Conditional Execution Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_conditional",
    ttl_seconds: 86400,
    required_drivers: ["http", "local_storage", "notification"],
    permissions: ["network", "storage", "notifications"],
    meta: {
      name: "Conditional Logic Demo",
      owner: "Omega UI, LLC",
      description: "Demonstrates conditional execution based on previous op results"
    },
    ops: [
      {
        op: "http.get",
        id: "check_api",
        args: {
          url: "https://httpbin.org/status/200"
        }
      },
      {
        type: "conditional",
        id: "status_check",
        condition: {
          op: "eq",
          left: "{{opId.check_api.status}}",
          right: 200
        },
        then: [
          {
            op: "local.put",
            id: "save_success",
            args: {
              key: "api_status",
              value: "healthy"
            }
          },
          {
            op: "notify.show",
            id: "success_notify",
            args: {
              title: "API Healthy",
              body: "The API returned status 200"
            }
          }
        ],
        else: [
          {
            op: "local.put",
            id: "save_failure",
            args: {
              key: "api_status",
              value: "unhealthy"
            }
          },
          {
            op: "notify.show",
            id: "failure_notify",
            args: {
              title: "API Issue",
              body: "The API returned an unexpected status"
            }
          }
        ]
      },
      {
        op: "local.get",
        id: "final_status",
        args: {
          key: "api_status"
        }
      }
    ],
    signature: null
  },

  // NEW: Loop Execution Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_loop",
    ttl_seconds: 86400,
    required_drivers: ["local_storage", "notification", "transform"],
    permissions: ["storage", "notifications"],
    meta: {
      name: "Loop Execution Demo",
      owner: "Omega UI, LLC",
      description: "Demonstrates foreach loops and iteration over data"
    },
    ops: [
      {
        op: "notify.show",
        id: "start_loop",
        args: {
          title: "Starting Loop",
          body: "Processing 5 items..."
        }
      },
      {
        type: "loop",
        id: "process_items",
        count: 5,
        as: "item",
        indexAs: "idx",
        ops: [
          {
            op: "local.put",
            id: "store_item",
            args: {
              key: "loop_item_{{var.idx}}",
              value: "processed_{{var.idx}}"
            }
          },
          {
            op: "wait.delay",
            id: "pause",
            args: {
              ms: 200
            }
          }
        ]
      },
      {
        op: "local.increment",
        id: "increment_counter",
        args: {
          key: "loop_run_count",
          by: 1
        }
      },
      {
        op: "notify.show",
        id: "loop_complete",
        args: {
          title: "Loop Complete",
          body: "All 5 items processed successfully"
        }
      }
    ],
    signature: null
  },

  // NEW: Parallel Execution Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_parallel",
    ttl_seconds: 86400,
    required_drivers: ["http", "notification"],
    permissions: ["network", "notifications"],
    meta: {
      name: "Parallel Execution Demo",
      owner: "Omega UI, LLC",
      description: "Demonstrates parallel execution of independent operations"
    },
    ops: [
      {
        op: "notify.show",
        id: "start_parallel",
        args: {
          title: "Starting Parallel Ops",
          body: "Executing 3 HTTP requests simultaneously..."
        }
      },
      {
        type: "parallel",
        id: "parallel_requests",
        continueOnError: true,
        ops: [
          {
            op: "http.get",
            id: "req_1",
            args: {
              url: "https://httpbin.org/delay/1"
            }
          },
          {
            op: "http.get",
            id: "req_2",
            args: {
              url: "https://httpbin.org/delay/1"
            }
          },
          {
            op: "http.get",
            id: "req_3",
            args: {
              url: "https://httpbin.org/delay/1"
            }
          }
        ]
      },
      {
        op: "notify.show",
        id: "parallel_complete",
        args: {
          title: "Parallel Complete",
          body: "All 3 requests completed (would take 3s sequentially, ~1s parallel)"
        }
      }
    ],
    signature: null
  },

  // NEW: Try-Catch Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_try_catch",
    ttl_seconds: 86400,
    required_drivers: ["http", "local_storage", "notification"],
    permissions: ["network", "storage", "notifications"],
    meta: {
      name: "Error Handling Demo",
      owner: "Omega UI, LLC",
      description: "Demonstrates try-catch error handling"
    },
    ops: [
      {
        type: "try",
        id: "risky_operation",
        ops: [
          {
            op: "http.get",
            id: "might_fail",
            args: {
              url: "https://httpbin.org/status/500"
            }
          },
          {
            type: "conditional",
            id: "check_response",
            condition: {
              op: "neq",
              left: "{{opId.might_fail.status}}",
              right: 200
            },
            then: [
              {
                op: "local.put",
                id: "force_error",
                args: {
                  key: "should_fail",
                  value: "{{opId.nonexistent.field}}"
                }
              }
            ]
          }
        ],
        catch: [
          {
            op: "local.put",
            id: "log_error",
            args: {
              key: "last_error",
              value: "{{var.errorMessage}}"
            }
          },
          {
            op: "notify.show",
            id: "error_notify",
            args: {
              title: "Error Caught",
              body: "Operation failed but was handled gracefully"
            }
          }
        ],
        finally: [
          {
            op: "notify.show",
            id: "cleanup_notify",
            args: {
              title: "Cleanup Complete",
              body: "Finally block executed regardless of success/failure"
            }
          }
        ]
      }
    ],
    signature: null
  },

  // NEW: Advanced Data Transform Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_transform",
    ttl_seconds: 86400,
    required_drivers: ["transform", "local_storage", "notification"],
    permissions: ["storage", "notifications"],
    meta: {
      name: "Data Transform Demo",
      owner: "Omega UI, LLC",
      description: "Demonstrates data transformation operations"
    },
    ops: [
      {
        op: "transform.set",
        id: "create_data",
        args: {
          value: [
            { name: "Alice", score: 85, active: true },
            { name: "Bob", score: 92, active: true },
            { name: "Charlie", score: 78, active: false },
            { name: "Diana", score: 95, active: true }
          ]
        }
      },
      {
        op: "transform.filter",
        id: "filter_active",
        args: {
          items: "{{opId.create_data.value}}",
          field: "active",
          op: "eq",
          value: true
        }
      },
      {
        op: "transform.reduce",
        id: "sum_scores",
        args: {
          items: "{{opId.filter_active.items}}",
          op: "sum",
          field: "score"
        }
      },
      {
        op: "transform.reduce",
        id: "avg_score",
        args: {
          items: "{{opId.filter_active.items}}",
          op: "avg",
          field: "score"
        }
      },
      {
        op: "local.put",
        id: "store_stats",
        args: {
          key: "team_stats",
          value: {
            total_score: "{{opId.sum_scores.result}}",
            average_score: "{{opId.avg_score.result}}",
            active_members: "{{opId.filter_active.count}}"
          }
        }
      },
      {
        op: "notify.show",
        id: "transform_complete",
        args: {
          title: "Transform Complete",
          body: "Filtered {{opId.filter_active.count}} active members, avg score: {{opId.avg_score.result}}"
        }
      }
    ],
    signature: null
  },

  // NEW: LLM Integration Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_llm",
    ttl_seconds: 86400,
    required_drivers: ["llm", "local_storage", "notification"],
    permissions: ["network", "storage", "notifications"],
    meta: {
      name: "LLM Integration Demo",
      owner: "Omega UI, LLC",
      description: "Demonstrates AI/LLM operations with token tracking"
    },
    ops: [
      {
        op: "notify.show",
        id: "llm_start",
        args: {
          title: "LLM Demo Starting",
          body: "Calling AI to generate and analyze content..."
        }
      },
      {
        op: "llm.invoke",
        id: "generate_ideas",
        args: {
          prompt: "Generate 3 creative product name ideas for a mobile app that helps people track their daily water intake. Return as a JSON array of strings.",
          json_schema: {
            type: "object",
            properties: {
              ideas: { type: "array", items: { type: "string" } }
            }
          }
        }
      },
      {
        op: "local.put",
        id: "save_ideas",
        args: {
          key: "llm_generated_ideas",
          value: "{{opId.generate_ideas.response}}"
        }
      },
      {
        op: "llm.summarize",
        id: "summarize_demo",
        args: {
          text: "The Universal Command Protocol (UCP) is a revolutionary approach to deterministic command execution. It provides cryptographic verification of execution through SHA-256 hashing, supports conditional logic, loops, parallel execution, and now integrates with large language models for AI-powered operations. UCP tracks token usage to help optimize costs and improve efficiency.",
          max_length: 50
        }
      },
      {
        op: "notify.show",
        id: "llm_complete",
        args: {
          title: "LLM Demo Complete",
          body: "Check the receipt for token usage stats!"
        }
      }
    ],
    signature: null
  },

  // NEW: Complex Workflow Demo
  {
    ucp_version: "0.1",
    id: "pkt_demo_complex_workflow",
    ttl_seconds: 86400,
    required_drivers: ["http", "local_storage", "notification", "transform"],
    permissions: ["network", "storage", "notifications"],
    meta: {
      name: "Complex Workflow Demo",
      owner: "Omega UI, LLC",
      description: "Demonstrates a multi-step workflow with conditionals, loops, and error handling"
    },
    ops: [
      {
        op: "notify.show",
        id: "workflow_start",
        args: {
          title: "Workflow Started",
          body: "Executing complex multi-step process..."
        }
      },
      {
        op: "local.increment",
        id: "init_counter",
        args: {
          key: "workflow_runs",
          by: 1
        }
      },
      {
        type: "try",
        id: "main_workflow",
        ops: [
          {
            op: "http.get",
            id: "fetch_config",
            args: {
              url: "https://httpbin.org/json"
            }
          },
          {
            type: "conditional",
            id: "check_fetch",
            condition: {
              op: "eq",
              left: "{{opId.fetch_config.ok}}",
              right: "true"
            },
            then: [
              {
                op: "local.put",
                id: "save_config",
                args: {
                  key: "fetched_config",
                  value: "{{opId.fetch_config.response}}"
                }
              },
              {
                type: "loop",
                id: "process_batch",
                count: 3,
                as: "batch",
                indexAs: "batchIdx",
                ops: [
                  {
                    op: "local.put",
                    id: "batch_item",
                    args: {
                      key: "batch_{{var.batchIdx}}",
                      value: "processed"
                    }
                  },
                  {
                    op: "wait.delay",
                    id: "batch_delay",
                    args: {
                      ms: 100
                    }
                  }
                ]
              }
            ],
            else: [
              {
                op: "notify.show",
                id: "fetch_failed",
                args: {
                  title: "Fetch Failed",
                  body: "Could not retrieve configuration"
                }
              }
            ]
          }
        ],
        catch: [
          {
            op: "local.put",
            id: "workflow_error",
            args: {
              key: "workflow_last_error",
              value: "{{var.errorMessage}}"
            }
          }
        ],
        finally: [
          {
            op: "local.put",
            id: "workflow_complete_time",
            args: {
              key: "workflow_last_complete",
              value: new Date().toISOString()
            }
          }
        ]
      },
      {
        op: "notify.show",
        id: "workflow_end",
        args: {
          title: "Workflow Complete",
          body: "Multi-step process finished. Run count: {{opId.init_counter.value}}"
        }
      }
    ],
    signature: null
  }
];

export const DEMO_SCRIPT = [
  {
    step: 1,
    title: "Load Demo Pack",
    description: "Click 'Load Demo Pack' to import 10 demo packets including conditionals, loops, parallel, and LLM examples."
  },
  {
    step: 2,
    title: "Try Conditional Logic",
    description: "Open 'Conditional Logic Demo' to see if-then-else execution based on HTTP response status."
  },
  {
    step: 3,
    title: "Explore Loops",
    description: "Run 'Loop Execution Demo' to see foreach iteration with progress tracking."
  },
  {
    step: 4,
    title: "Test Parallel Execution",
    description: "Run 'Parallel Execution Demo' to see 3 HTTP requests execute simultaneously."
  },
  {
    step: 5,
    title: "See Error Handling",
    description: "Run 'Error Handling Demo' to see try-catch-finally in action with graceful error recovery."
  },
  {
    step: 6,
    title: "Try LLM Integration",
    description: "Run 'LLM Integration Demo' to see AI-powered operations with token tracking."
  },
  {
    step: 7,
    title: "Review Token Stats",
    description: "Examine receipts showing token usage, savings, and efficiency metrics."
  }
];

export default { getDemoPackets, DEMO_SCRIPT };