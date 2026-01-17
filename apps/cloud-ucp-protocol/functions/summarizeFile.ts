import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const CHUNK_SIZE = 50000; // ~50KB text chunks for context window
const OVERLAP = 5000;     // 5KB overlap

// UCP Token estimation algorithm (patent-style)
function estimateTokens(text) {
  if (!text || text.trim() === '') return 0;
  
  let tokens = 0;
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  for (const word of words) {
    if (/^[.,!?;:'"()\[\]{}]+$/.test(word)) {
      tokens += word.length;
      continue;
    }
    if (/^\d+$/.test(word)) {
      tokens += word.length <= 3 ? 1 : word.length <= 6 ? 2 : Math.ceil(word.length / 3);
      continue;
    }
    if (/[\[\]:_]/.test(word)) {
      tokens += Math.ceil(word.length / 5);
      continue;
    }
    const cleanWord = word.replace(/[.,!?;:'"()\[\]{}]/g, '');
    const punctCount = word.length - cleanWord.length;
    if (cleanWord.length <= 4) tokens += 1;
    else if (cleanWord.length <= 8) tokens += 2;
    else if (cleanWord.length <= 12) tokens += 3;
    else tokens += Math.ceil(cleanWord.length / 4);
    tokens += punctCount;
  }
  
  tokens += (text.match(/\n/g) || []).length;
  return Math.max(1, Math.round(tokens));
}

// Call local LLM (LM Studio / Ollama style)
async function callLocalLLM(provider, systemPrompt, userContent, maxTokens = 512) {
  const endpoint = provider.api_endpoint || 'http://100.119.81.65:1234/v1/chat/completions';
  
  const headers = { 'Content-Type': 'application/json' };
  if (provider.api_key) {
    headers['Authorization'] = `Bearer ${provider.api_key}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: provider.model_name || 'local-model',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.3,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM Error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileTransferId, fileContent, force = false } = await req.json();

    if (!fileTransferId) {
      return Response.json({ error: 'fileTransferId is required' }, { status: 400 });
    }

    // Check if summary already exists
    const existingSummaries = await base44.asServiceRole.entities.FileSummary.filter({ 
      file_transfer_id: fileTransferId 
    });
    
    if (existingSummaries.length > 0 && !force) {
      const existing = existingSummaries[0];
      if (existing.status === 'ready') {
        return Response.json(existing);
      }
    }

    // Get file transfer record
    const transfers = await base44.asServiceRole.entities.FileTransfer.filter({ id: fileTransferId });
    if (transfers.length === 0) {
      return Response.json({ error: 'File transfer not found' }, { status: 404 });
    }
    const fileTransfer = transfers[0];

    // Get default AI provider
    const providers = await base44.asServiceRole.entities.ApiProvider.filter({ created_by: user.email });
    const defaultProvider = providers.find(p => p.is_default) || providers[0];

    if (!defaultProvider) {
      return Response.json({ 
        error: 'No AI provider configured. Please add one in settings.' 
      }, { status: 400 });
    }

    // Create or update summary record as processing
    let summaryRecord;
    if (existingSummaries.length > 0) {
      await base44.asServiceRole.entities.FileSummary.update(existingSummaries[0].id, {
        status: 'processing'
      });
      summaryRecord = existingSummaries[0];
    } else {
      summaryRecord = await base44.entities.FileSummary.create({
        file_transfer_id: fileTransferId,
        file_name: fileTransfer.file_name,
        status: 'processing'
      });
    }

    // If no content provided, fetch from URL
    let textContent = fileContent;
    if (!textContent && fileTransfer.file_url) {
      try {
        const fileResponse = await fetch(fileTransfer.file_url);
        textContent = await fileResponse.text();
      } catch (e) {
        await base44.asServiceRole.entities.FileSummary.update(summaryRecord.id, {
          status: 'error',
          error_message: 'Failed to fetch file content'
        });
        return Response.json({ error: 'Failed to fetch file content' }, { status: 500 });
      }
    }

    if (!textContent || textContent.trim().length === 0) {
      await base44.asServiceRole.entities.FileSummary.update(summaryRecord.id, {
        status: 'error',
        error_message: 'No text content to summarize'
      });
      return Response.json({ error: 'No text content to summarize' }, { status: 400 });
    }

    // Chunk the content
    const chunks = [];
    let position = 0;
    while (position < textContent.length) {
      const end = Math.min(position + CHUNK_SIZE, textContent.length);
      chunks.push(textContent.slice(position, end));
      position = end - OVERLAP;
      if (position >= textContent.length - OVERLAP) break;
    }
    if (chunks.length === 0) chunks.push(textContent);

    // Process each chunk
    const chunkSummaries = [];
    let totalOriginalTokens = 0;
    let totalUcpTokens = 0;

    const systemPrompt = `You are an AI assistant that understands the Universal Command Protocol (UCP).
Execute the instruction encoded in the UCP header.
You will receive document text between [DATA:START] and [DATA:END].

Task:
- Summarize the content in clear bullet points.
- Focus on the main entities, dates, decisions, and obligations.
- If this is a chunk of a larger document, produce a chunk-level summary that can be merged later.
- Be concise but comprehensive.`;

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const ucpCommand = `[UCP:SUMMARIZE][FORMAT:BULLET][MOD:CONCISE][SCOPE:FILE_CHUNK][CHUNK:${i + 1}/${chunks.length}]
[DATA:START]
${chunkText}
[DATA:END]`;

      const originalTokens = estimateTokens(chunkText);
      const ucpTokens = estimateTokens(ucpCommand);
      totalOriginalTokens += originalTokens;
      totalUcpTokens += ucpTokens;

      try {
        const summary = await callLocalLLM(defaultProvider, systemPrompt, ucpCommand, 512);
        chunkSummaries.push(summary);
      } catch (e) {
        console.error(`Chunk ${i + 1} failed:`, e);
        chunkSummaries.push(`[Chunk ${i + 1} summarization failed]`);
      }
    }

    // Merge chunk summaries into final summary
    let finalSummary;
    if (chunkSummaries.length === 1) {
      finalSummary = chunkSummaries[0];
    } else {
      const mergePrompt = `You are an AI assistant that merges chunk-level summaries into a single coherent summary.
- Avoid repetition
- Group related points
- Maintain bullet point format
- Preserve key information from all chunks`;

      const mergeUcpCommand = `[UCP:SUMMARIZE][FORMAT:BULLET][MOD:DETAIL][SCOPE:FILE_FINAL]
[DATA:START]
${chunkSummaries.join('\n\n---\n\n')}
[DATA:END]`;

      const mergeOriginalTokens = estimateTokens(chunkSummaries.join('\n'));
      const mergeUcpTokens = estimateTokens(mergeUcpCommand);
      totalOriginalTokens += mergeOriginalTokens;
      totalUcpTokens += mergeUcpTokens;

      try {
        finalSummary = await callLocalLLM(defaultProvider, mergePrompt, mergeUcpCommand, 1024);
      } catch (e) {
        console.error('Merge failed:', e);
        finalSummary = chunkSummaries.join('\n\n');
      }
    }

    const savingsPercentage = totalOriginalTokens > 0 
      ? Math.round(((totalOriginalTokens - totalUcpTokens) / totalOriginalTokens) * 100 * 10) / 10
      : 0;

    // Update summary record
    await base44.asServiceRole.entities.FileSummary.update(summaryRecord.id, {
      summary: finalSummary,
      chunk_summaries: chunkSummaries,
      status: 'ready',
      original_tokens: totalOriginalTokens,
      ucp_tokens: totalUcpTokens,
      savings_percentage: savingsPercentage,
      model_used: `${defaultProvider.provider_name} - ${defaultProvider.model_name}`,
      chunks_processed: chunks.length
    });

    return Response.json({
      id: summaryRecord.id,
      file_transfer_id: fileTransferId,
      file_name: fileTransfer.file_name,
      summary: finalSummary,
      chunk_summaries: chunkSummaries,
      status: 'ready',
      original_tokens: totalOriginalTokens,
      ucp_tokens: totalUcpTokens,
      savings_percentage: savingsPercentage,
      model_used: `${defaultProvider.provider_name} - ${defaultProvider.model_name}`,
      chunks_processed: chunks.length
    });

  } catch (error) {
    console.error('Summarization Error:', error);
    return Response.json({ 
      error: error.message || 'Summarization failed' 
    }, { status: 500 });
  }
});