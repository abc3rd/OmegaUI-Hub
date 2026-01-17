// UCP Command Type Templates with 7 standard command types

export const UCP_COMMAND_TYPES = {
  SUMMARIZE: {
    id: 'SUMMARIZE',
    name: 'Summarize',
    description: 'Condense content into key points',
    icon: 'FileText',
    color: 'cyan',
    defaultArgs: {
      length: 'medium', // short, medium, long
      format: 'bullets' // bullets, paragraph, numbered
    }
  },
  TRANSLATE: {
    id: 'TRANSLATE',
    name: 'Translate',
    description: 'Convert text between languages',
    icon: 'Languages',
    color: 'violet',
    defaultArgs: {
      source_lang: 'auto',
      target_lang: 'en'
    }
  },
  GENCODE: {
    id: 'GENCODE',
    name: 'Generate Code',
    description: 'Create code from natural language',
    icon: 'Code',
    color: 'emerald',
    defaultArgs: {
      language: 'javascript',
      style: 'modern'
    }
  },
  EXPLAIN: {
    id: 'EXPLAIN',
    name: 'Explain',
    description: 'Break down complex concepts',
    icon: 'HelpCircle',
    color: 'amber',
    defaultArgs: {
      audience: 'general', // beginner, general, expert
      depth: 'moderate'
    }
  },
  ANALYZE: {
    id: 'ANALYZE',
    name: 'Analyze',
    description: 'Extract insights and patterns',
    icon: 'BarChart3',
    color: 'blue',
    defaultArgs: {
      type: 'general', // sentiment, statistical, comparative
      output_format: 'structured'
    }
  },
  REWRITE: {
    id: 'REWRITE',
    name: 'Rewrite',
    description: 'Rephrase with different tone or style',
    icon: 'RefreshCw',
    color: 'rose',
    defaultArgs: {
      tone: 'professional', // casual, professional, formal, creative
      preserve_meaning: true
    }
  },
  LIST: {
    id: 'LIST',
    name: 'List/Extract',
    description: 'Extract items or create lists',
    icon: 'ListOrdered',
    color: 'teal',
    defaultArgs: {
      format: 'array',
      deduplicate: true
    }
  }
};

export const generateCommandPacket = (commandType, input, customArgs = {}) => {
  const cmd = UCP_COMMAND_TYPES[commandType];
  if (!cmd) throw new Error(`Unknown command type: ${commandType}`);

  const timestamp = Date.now();
  const packetId = `pkt_${commandType.toLowerCase()}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    ucp_version: "0.1",
    id: packetId,
    ttl_seconds: 3600,
    required_drivers: ["llm", "transform"],
    permissions: ["network"],
    meta: {
      name: `${cmd.name} Command`,
      owner: "UCP Runner",
      description: cmd.description,
      command_type: commandType,
      created_at: new Date().toISOString()
    },
    ops: [
      {
        op: "llm.invoke",
        id: "process_command",
        args: {
          command: commandType,
          input: input,
          ...cmd.defaultArgs,
          ...customArgs
        }
      },
      {
        op: "transform.set",
        id: "format_output",
        args: {
          value: "{{opId.process_command.result}}"
        }
      }
    ],
    signature: null
  };
};

export const getCommandTemplates = () => {
  return Object.values(UCP_COMMAND_TYPES).map(cmd => ({
    id: `tpl_cmd_${cmd.id.toLowerCase()}`,
    name: `${cmd.name} Command`,
    intent: cmd.description,
    category: 'Commands',
    tags: [cmd.id.toLowerCase(), 'llm', 'ai'],
    packetJson: JSON.stringify(generateCommandPacket(cmd.id, '{{input}}'), null, 2),
    baselinePromptTokens: 200,
    baselineCompletionTokens: 150,
    commandType: cmd.id
  }));
};

export default { UCP_COMMAND_TYPES, generateCommandPacket, getCommandTemplates };