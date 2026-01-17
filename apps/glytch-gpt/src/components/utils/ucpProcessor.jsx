/**
 * UCP (Universal Communication Protocol) Processor
 * Implements a deterministic instruction packet layer for token efficiency
 * 
 * NOTE: This is a structural simulation demonstrating UCP principles
 * without exposing proprietary implementation details
 */

export class UCPProcessor {
    static PACKET_STORAGE_KEY = 'glytch_ucp_packets';
    static MAX_PROMPT_LENGTH = 10000;

    /**
     * Intent categories for packet classification
     */
    static INTENT_CATEGORIES = {
        SUMMARIZE: 'summarize',
        ANALYZE: 'analyze',
        GENERATE: 'generate',
        TRANSLATE: 'translate',
        EXPLAIN: 'explain',
        CODE: 'code',
        CHAT: 'chat',
        QUESTION: 'question'
    };

    /**
     * Analyze prompt to determine intent category
     */
    static analyzeIntent(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('summar') || lowerPrompt.includes('brief')) {
            return this.INTENT_CATEGORIES.SUMMARIZE;
        }
        if (lowerPrompt.includes('analyz') || lowerPrompt.includes('evaluat')) {
            return this.INTENT_CATEGORIES.ANALYZE;
        }
        if (lowerPrompt.includes('generat') || lowerPrompt.includes('creat') || lowerPrompt.includes('write')) {
            return this.INTENT_CATEGORIES.GENERATE;
        }
        if (lowerPrompt.includes('translat') || lowerPrompt.includes('convert')) {
            return this.INTENT_CATEGORIES.TRANSLATE;
        }
        if (lowerPrompt.includes('explain') || lowerPrompt.includes('how') || lowerPrompt.includes('what')) {
            return this.INTENT_CATEGORIES.EXPLAIN;
        }
        if (lowerPrompt.includes('code') || lowerPrompt.includes('function') || lowerPrompt.includes('program')) {
            return this.INTENT_CATEGORIES.CODE;
        }
        if (lowerPrompt.includes('?')) {
            return this.INTENT_CATEGORIES.QUESTION;
        }
        
        return this.INTENT_CATEGORIES.CHAT;
    }

    /**
     * Extract constraints from prompt
     */
    static extractConstraints(prompt) {
        const constraints = [];
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('bullet') || lowerPrompt.includes('list')) {
            constraints.push('bullet_points');
        }
        if (lowerPrompt.includes('detail') || lowerPrompt.includes('comprehensive')) {
            constraints.push('detailed');
        }
        if (lowerPrompt.includes('brief') || lowerPrompt.includes('concise') || lowerPrompt.includes('short')) {
            constraints.push('concise');
        }
        if (lowerPrompt.includes('formal')) {
            constraints.push('formal_tone');
        }
        if (lowerPrompt.includes('casual') || lowerPrompt.includes('friendly')) {
            constraints.push('casual_tone');
        }
        if (lowerPrompt.includes('neutral')) {
            constraints.push('neutral_tone');
        }
        if (lowerPrompt.includes('example')) {
            constraints.push('include_examples');
        }
        if (lowerPrompt.includes('step') || lowerPrompt.includes('process')) {
            constraints.push('step_by_step');
        }
        
        return constraints;
    }

    /**
     * Generate deterministic packet ID
     */
    static generatePacketId(intent, constraints) {
        const constraintStr = constraints.sort().join('_');
        const hash = this.simpleHash(`${intent}_${constraintStr}`);
        return `${intent}_${hash}_v1`;
    }

    /**
     * Simple hash function for packet ID generation
     */
    static simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36).substring(0, 8);
    }

    /**
     * Compile a UCP packet from a prompt
     */
    static compilePacket(prompt) {
        if (prompt.length > this.MAX_PROMPT_LENGTH) {
            throw new Error(`Prompt exceeds maximum length of ${this.MAX_PROMPT_LENGTH} characters`);
        }

        const intent = this.analyzeIntent(prompt);
        const constraints = this.extractConstraints(prompt);
        const packetId = this.generatePacketId(intent, constraints);

        const packet = {
            packet_id: packetId,
            intent,
            constraints,
            created_at: new Date().toISOString(),
            version: 1,
            // Metadata about packet structure (not actual instructions)
            metadata: {
                optimization_level: constraints.length > 0 ? 'high' : 'medium',
                reusable: true,
                estimated_token_savings: '20-35%'
            }
        };

        return packet;
    }

    /**
     * Store packet in local cache
     */
    static storePacket(packet) {
        try {
            const packets = this.getStoredPackets();
            packets[packet.packet_id] = packet;
            localStorage.setItem(this.PACKET_STORAGE_KEY, JSON.stringify(packets));
            return true;
        } catch (error) {
            console.error('Error storing packet:', error);
            return false;
        }
    }

    /**
     * Retrieve stored packets
     */
    static getStoredPackets() {
        try {
            const stored = localStorage.getItem(this.PACKET_STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error retrieving packets:', error);
            return {};
        }
    }

    /**
     * Check if packet exists in cache
     */
    static packetExists(packetId) {
        const packets = this.getStoredPackets();
        return packets.hasOwnProperty(packetId);
    }

    /**
     * Extract delta (user-specific content) from prompt
     * This is the variable part that changes between uses
     */
    static extractDelta(prompt, packet) {
        // Remove instruction words and constraints
        let delta = prompt;
        
        // Remove common instruction patterns
        const instructionPatterns = [
            /please /gi,
            /can you /gi,
            /could you /gi,
            /i want you to /gi,
            /make sure to /gi,
            /be sure to /gi,
            /in bullet points/gi,
            /step by step/gi,
            /in detail/gi,
            /briefly/gi,
            /concisely/gi
        ];
        
        instructionPatterns.forEach(pattern => {
            delta = delta.replace(pattern, '');
        });
        
        // Clean up extra whitespace
        delta = delta.replace(/\s+/g, ' ').trim();
        
        return delta;
    }

    /**
     * Apply UCP compression to prompt
     * This simulates the token reduction effect of UCP
     */
    static applyUCPCompression(prompt) {
        let compressed = prompt;
        
        // Compression strategy 1: Abbreviate common instruction phrases
        const compressionMap = {
            'please provide': 'provide',
            'can you': '',
            'could you': '',
            'i want you to': '',
            'i would like you to': '',
            'make sure to': '',
            'be sure to': '',
            'it is important that': '',
            'please note that': '',
            'keep in mind that': '',
            'remember to': '',
            'don\'t forget to': '',
            'in bullet points': '[bullets]',
            'in bullet point format': '[bullets]',
            'step by step': '[steps]',
            'in detail': '[detail]',
            'detailed': '[detail]',
            'comprehensive': '[detail]',
            'briefly': '[brief]',
            'concisely': '[brief]',
            'in a concise manner': '[brief]',
            'for example': 'e.g.',
            'such as': 'e.g.',
            'that is': 'i.e.',
            'in other words': 'i.e.',
            'with examples': '[+ex]',
            'including examples': '[+ex]'
        };
        
        Object.entries(compressionMap).forEach(([full, abbr]) => {
            const regex = new RegExp(full, 'gi');
            compressed = compressed.replace(regex, abbr);
        });
        
        // Compression strategy 2: Remove redundant phrases
        compressed = compressed.replace(/\s+/g, ' ').trim();
        
        // Compression strategy 3: Optimize punctuation
        compressed = compressed.replace(/\s*,\s*/g, ',');
        compressed = compressed.replace(/\s*\.\s*/g, '. ');
        
        return compressed;
    }

    /**
     * Process prompt with UCP
     * Returns compressed prompt and packet info
     */
    static processPrompt(prompt) {
        // Step 1: Compile packet
        const packet = this.compilePacket(prompt);
        
        // Step 2: Check if packet exists
        const packetExists = this.packetExists(packet.packet_id);
        
        if (!packetExists) {
            // First time using this pattern - store packet
            this.storePacket(packet);
        }
        
        // Step 3: Extract delta
        const delta = this.extractDelta(prompt, packet);
        
        // Step 4: Apply compression
        const compressedPrompt = this.applyUCPCompression(prompt);
        
        return {
            original_prompt: prompt,
            compressed_prompt: compressedPrompt,
            packet,
            delta,
            is_new_packet: !packetExists,
            token_reduction_estimate: Math.floor(
                ((prompt.length - compressedPrompt.length) / prompt.length) * 100
            )
        };
    }

    /**
     * Get packet statistics
     */
    static getPacketStats() {
        const packets = this.getStoredPackets();
        const packetArray = Object.values(packets);
        
        return {
            total_packets: packetArray.length,
            by_intent: packetArray.reduce((acc, p) => {
                acc[p.intent] = (acc[p.intent] || 0) + 1;
                return acc;
            }, {}),
            cache_size: JSON.stringify(packets).length
        };
    }

    /**
     * Clear all stored packets
     */
    static clearPackets() {
        try {
            localStorage.removeItem(this.PACKET_STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing packets:', error);
            return false;
        }
    }
}

export default UCPProcessor;