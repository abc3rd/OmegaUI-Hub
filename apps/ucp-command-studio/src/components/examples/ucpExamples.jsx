/**
 * UCP Example Workflows Library
 * Production-ready examples for Universal Command Protocol workflows.
 */

export const UCP_EXAMPLES = [
  {
    id: "generate-packet-weather",
    title: "Generate Weather Command Packet",
    description: "Create a UCP packet from natural language intent using AI",
    category: "AI Generation",
    intent: "Create a command that fetches current weather for a given city and returns temperature, conditions, and humidity",
    demo_tags: ["AI", "PacketCreation"],
    params: {
      city: "San Francisco"
    }
  },
  {
    id: "execute-calculation",
    title: "Execute Math Calculation Packet",
    description: "Run a validated packet with deterministic parameters",
    category: "Execution",
    command: "math_calculator",
    params: {
      operation: "add",
      numbers: [42, 58],
      precision: 2
    },
    demo_tags: ["Execution", "Deterministic"]
  },
  {
    id: "ai-content-generation",
    title: "AI Content Generation",
    description: "Generate marketing copy using OpenAI via UCP packet",
    category: "AI Execution",
    command: "generate_content",
    params: {
      prompt: "Write a compelling product description for noise-canceling headphones",
      tone: "professional",
      max_length: 150
    },
    demo_tags: ["AI", "OpenAI", "Content"]
  },
  {
    id: "data-validation",
    title: "Validate & Transform Data",
    description: "Execute packet that validates JSON schema and transforms data",
    category: "Data Processing",
    command: "validate_transform",
    params: {
      input_data: {
        user_id: "usr_12345",
        email: "user@example.com",
        status: "active"
      },
      validation_rules: {
        required_fields: ["user_id", "email"]
      }
    },
    demo_tags: ["Validation", "Transform"]
  },
  {
    id: "cached-lookup",
    title: "Cached Deterministic Lookup",
    description: "Execute packet with caching enabled for repeated queries",
    category: "Performance",
    command: "cached_lookup",
    params: {
      query_type: "user_profile",
      query_id: "usr_98765",
      cache_ttl: 3600
    },
    demo_tags: ["Caching", "Performance"]
  },
  {
    id: "multi-step-workflow",
    title: "Multi-Step Workflow Execution",
    description: "Run a packet that chains multiple operations",
    category: "Complex Workflow",
    command: "workflow_chain",
    params: {
      steps: [
        { action: "fetch_data", source: "api" },
        { action: "transform", format: "json" },
        { action: "validate", schema_ref: "v1" }
      ],
      rollback_on_error: true
    },
    demo_tags: ["Workflow", "Complex"]
  },
  {
    id: "qr-transport-simulation",
    title: "Offline QR Transport",
    description: "Simulate packet transport via QR code for offline scenarios",
    category: "Offline Transport",
    command: "qr_transport",
    params: {
      packet_id: "pkt_demo_001",
      transport_method: "qr_code",
      compression: true,
      metadata: {
        device: "mobile",
        timestamp: new Date().toISOString()
      }
    },
    demo_tags: ["Offline", "QR", "Transport"]
  },
  {
    id: "large-payload-encryption",
    title: "Encrypted Large Payload",
    description: "Package and encrypt large data payload for secure transport",
    category: "Security",
    command: "encrypt_payload",
    params: {
      data_size_mb: 2.5,
      encryption_algorithm: "AES-256-GCM",
      key_id: "key_prod_001",
      payload_preview: {
        type: "encrypted",
        algorithm: "AES-256-GCM",
        iv: "placeholder_iv_base64",
        ciphertext: "placeholder_encrypted_data"
      }
    },
    demo_tags: ["Security", "Encryption", "LargePayload"]
  }
];

export function getExample(id) {
  return UCP_EXAMPLES.find(ex => ex.id === id);
}

export function getExamplesByCategory(category) {
  return UCP_EXAMPLES.filter(ex => ex.category === category);
}

export function getExamplesByTag(tag) {
  return UCP_EXAMPLES.filter(ex => ex.demo_tags?.includes(tag));
}

export function getCategories() {
  return [...new Set(UCP_EXAMPLES.map(ex => ex.category))];
}