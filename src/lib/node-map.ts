import type {JsonNode} from '../types.js';

/**
 * Build a Map of node id to JsonNode for O(1) lookup.
 */
export function buildNodeIndex(nodes: readonly JsonNode[]): Map<string, JsonNode> {
	return new Map(nodes.map(n => [n.id, n]));
}
