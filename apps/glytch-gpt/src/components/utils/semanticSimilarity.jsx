/**
 * Semantic Similarity Utility
 * Compares semantic equivalence between two text outputs
 */

export class SemanticSimilarity {
    /**
     * Calculate cosine similarity between two texts using word vectors
     * This is a simplified approach using word frequency
     */
    static calculateCosineSimilarity(text1, text2) {
        const words1 = this.tokenize(text1);
        const words2 = this.tokenize(text2);
        
        // Create word frequency vectors
        const allWords = new Set([...words1, ...words2]);
        const vector1 = [];
        const vector2 = [];
        
        allWords.forEach(word => {
            vector1.push(words1.filter(w => w === word).length);
            vector2.push(words2.filter(w => w === word).length);
        });
        
        // Calculate cosine similarity
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
        
        if (magnitude1 === 0 || magnitude2 === 0) return 0;
        
        return dotProduct / (magnitude1 * magnitude2);
    }

    /**
     * Calculate Jaccard similarity (intersection over union)
     */
    static calculateJaccardSimilarity(text1, text2) {
        const words1 = new Set(this.tokenize(text1));
        const words2 = new Set(this.tokenize(text2));
        
        const intersection = new Set([...words1].filter(w => words2.has(w)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    /**
     * Calculate Levenshtein distance ratio
     */
    static calculateLevenshteinSimilarity(text1, text2) {
        const distance = this.levenshteinDistance(text1, text2);
        const maxLength = Math.max(text1.length, text2.length);
        
        if (maxLength === 0) return 1;
        
        return 1 - (distance / maxLength);
    }

    /**
     * Levenshtein distance algorithm
     */
    static levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Tokenize text into words
     */
    static tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    /**
     * Calculate comprehensive similarity score
     * Returns a weighted average of multiple metrics
     */
    static calculateSimilarity(text1, text2) {
        const cosine = this.calculateCosineSimilarity(text1, text2);
        const jaccard = this.calculateJaccardSimilarity(text1, text2);
        
        // Weighted average (cosine is more reliable for semantic similarity)
        const similarity = (cosine * 0.7) + (jaccard * 0.3);
        
        return {
            similarity: Math.round(similarity * 100),
            cosine: Math.round(cosine * 100),
            jaccard: Math.round(jaccard * 100),
            rating: this.getRating(similarity)
        };
    }

    /**
     * Get qualitative rating for similarity score
     */
    static getRating(similarity) {
        if (similarity >= 0.95) return 'Excellent';
        if (similarity >= 0.85) return 'Very Good';
        if (similarity >= 0.75) return 'Good';
        if (similarity >= 0.60) return 'Fair';
        return 'Low';
    }

    /**
     * Get color code for similarity rating
     */
    static getColorForRating(rating) {
        switch (rating) {
            case 'Excellent': return 'text-green-500';
            case 'Very Good': return 'text-green-400';
            case 'Good': return 'text-yellow-500';
            case 'Fair': return 'text-orange-500';
            default: return 'text-red-500';
        }
    }
}

export default SemanticSimilarity;