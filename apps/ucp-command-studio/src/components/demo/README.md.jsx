# UCP Demo System - README

## Overview
The UCP Command Studio includes a comprehensive demo system with guided examples and one-click workflows. This system helps users understand the Universal Command Protocol without needing prior knowledge.

## Components

### 1. Example Library (`components/examples/ucpExamples.js`)
A curated collection of 8 production-ready UCP workflows covering:
- **AI Generation**: Creating packets from natural language
- **Execution**: Running deterministic calculations
- **AI Content**: Generating marketing copy with OpenAI
- **Data Processing**: Validation and transformation
- **Performance**: Cached lookups
- **Complex Workflows**: Multi-step operations
- **Offline Transport**: QR code simulation
- **Security**: Encrypted payload handling

#### Adding New Examples
```javascript
{
  id: "unique-id",
  title: "Display Title",
  description: "What this example demonstrates",
  category: "Category Name",
  intent: "Natural language description (for packet creation)",
  params: {
    // MUST be an object/dictionary, never a string
    param1: "value1",
    param2: { nested: "object" }
  },
  demo_tags: ["Tag1", "Tag2"]
}
```

**CRITICAL**: `params` must ALWAYS be an object. Never use strings or primitives directly.

### 2. Validation Utilities (`components/utils/validation.js`)
Schema-compliant normalization functions that ensure:
- `params` is always an object/dictionary
- `result` is always an object/dictionary
- No "Input should be a valid dictionary" errors

Key functions:
- `normalizeObject(value, fallbackKey)` - Converts any value to valid object
- `normalizeParams(params)` - Specifically for execution parameters
- `normalizeResult(result)` - Specifically for execution results
- `validateRequiredFields(obj, fields)` - Check required fields present

### 3. Run Full Demo (`components/demo/RunFullDemo.jsx`)
One-click end-to-end workflow that:
1. Creates a demo project
2. Generates a command packet using AI
3. Executes the packet with example parameters
4. Verifies the result

Shows live progress with status indicators for each step.

### 4. Enhanced Pages

#### ExecutePacket
- Example dropdown at top
- Auto-populates parameters from selected example
- Remembers last selected example (localStorage)
- "Suggested next step" guidance
- Normalized result handling

#### CreatePacket (via IntentInput)
- Example dropdown to pre-fill intent
- Loads realistic UCP scenarios
- Reduces friction for new users

## Environment Requirements

### Required Environment Variables
```bash
OPENAI_API_KEY=sk-...  # Required for Core.InvokeLLM flows
```

Set this in your deployment environment or `.env` file. Without it, AI-powered features will fail.

### Optional Configuration
```javascript
// Store Google Sheets ID for automatic sync
localStorage.setItem('sheets_spreadsheet_id', 'your-sheet-id');
```

## Usage Patterns

### For End Users
1. **Quick Start**: 
   - Go to Dashboard → Click "Run Full Demo"
   - Observe complete workflow execution

2. **Guided Execution**:
   - Navigate to "Execute Packet"
   - Select an example from dropdown
   - Parameters auto-fill
   - Click "Execute Command"

3. **Packet Creation**:
   - Go to "Create Packet"
   - Select example intent
   - AI extracts schema automatically
   - Review and save

### For Developers

#### Adding Custom Examples
Edit `components/examples/ucpExamples.js`:

```javascript
export const UCP_EXAMPLES = [
  ...existing,
  {
    id: "my-custom-workflow",
    title: "Custom Workflow",
    description: "Description here",
    category: "My Category",
    intent: "Natural language intent for packet creation",
    params: {
      // Always an object
      my_param: "value"
    },
    demo_tags: ["Custom"]
  }
];
```

#### Using Validation in Custom Code
```javascript
import { normalizeResult, normalizeParams } from "@/components/utils/validation";

// Before saving to database
const safeResult = normalizeResult(rawAIOutput);
await base44.entities.PacketExecution.update(id, { result: safeResult });

// Before sending to backend
const safeParams = normalizeParams(userInput);
await base44.functions.invoke('myFunction', safeParams);
```

## Troubleshooting

### "Input should be a valid dictionary"
**Cause**: Sending a string or non-object to a field expecting an object.

**Fix**: Use `normalizeResult()` or `normalizeParams()` before saving/sending.

### Demo Execution Fails
1. Check `OPENAI_API_KEY` is set
2. Verify organization_id exists on user
3. Check browser console for detailed errors
4. Ensure example `params` are objects, not strings

### Parameters Not Auto-Filling
1. Ensure example has `params` field as object
2. Check selected example ID matches schema keys
3. Verify localStorage is accessible (not in incognito)

## Schema Compliance

All examples and execution flows ensure:
```json
{
  "input_params": {},  // Always object
  "result": {},        // Always object
  "metadata": {}       // Always object
}
```

Never:
```json
{
  "input_params": "string",  // ❌ Invalid
  "result": null,            // ❌ Invalid
  "metadata": [...]          // ❌ Invalid (array)
}
```

## Production Deployment Checklist

- [ ] Set `OPENAI_API_KEY` environment variable
- [ ] Verify all examples have object-based `params`
- [ ] Test "Run Full Demo" completes without errors
- [ ] Confirm execution results are valid objects
- [ ] Check error messages are user-friendly
- [ ] Validate localStorage persists example selection
- [ ] Test on mobile (portrait mode shows rotate message)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables are set
3. Review example structure matches schema
4. Ensure validation utilities are imported correctly

The system is designed to be self-guiding - users should never see cryptic error messages or empty required fields.