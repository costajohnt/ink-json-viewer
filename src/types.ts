/**
 * All JSON-representable value types, plus special detected types.
 */
export type JsonValueType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'null'
	| 'object'
	| 'array'
	| 'undefined'
	| 'date'
	| 'regexp'
	| 'bigint'
	| 'map'
	| 'set'
	| 'function'
	| 'symbol'
	| 'circular'
	| 'unknown';

/**
 * A single node in the flattened tree. Every visible line in the
 * rendered output corresponds to exactly one JsonNode.
 */
export type JsonNode = {
	/** Unique stable identifier (JSON path, e.g. "$.users[0].name") */
	id: string;

	/** Depth level (0 = root). Used for indentation. */
	depth: number;

	/** The value type of this node */
	type: JsonValueType;

	/** Property key (for object children) or array index. undefined for root. */
	key: string | number | undefined;

	/** The raw value at this node. */
	value: unknown;

	/** Whether this node is expandable (container with children) */
	isExpandable: boolean;

	/** Number of direct children. 0 for leaves. */
	childCount: number;

	/** Parent node id. undefined for root. */
	parentId: string | undefined;

	/** Ordered array of direct child node ids. Empty for leaves. */
	childIds: string[];

	/** Whether this is a circular reference. */
	isCircular: boolean;
};

/**
 * Tracks which nodes are expanded. Keyed by node id.
 * true = expanded, absent = collapsed.
 */
export type ExpandState = ReadonlyMap<string, boolean>;

/**
 * A row in the visible output. Most rows map 1:1 to a JsonNode,
 * but closing brackets are synthetic rows.
 */
export type VisibleRow = {
	/** The node this row represents */
	nodeId: string;

	/** Display depth (for indentation) */
	depth: number;

	/** Row kind */
	kind: 'node' | 'closing-bracket';

	/** For closing-bracket rows, the bracket character. */
	closingBracket?: '}' | ']';

	/** Global index in the visible rows array */
	index: number;
};

/** Color theme for the JSON viewer */
export type JsonViewerTheme = {
	colors: {
		string: string;
		number: string;
		boolean: string;
		null: string;
		key: string;
		bracket: string;
		expandIcon: string;
		focusIndicator: string;
		focusedRowPrefix: string;
		searchMatch: string;
		circular: string;
		truncation: string;
		preview: string;
	};
};

/** Props for the JsonViewer component */
export type JsonViewerProps = {
	/** The JSON value to render. Accepts any JS value. */
	data: unknown;

	/**
	 * Number of depth levels to expand on initial render.
	 * 0 = fully collapsed, Infinity = fully expanded.
	 * @default 1
	 */
	defaultExpandDepth?: number;

	/**
	 * Maximum number of visible lines before virtual scrolling kicks in.
	 * @default 20
	 */
	maxHeight?: number;

	/**
	 * Whether to show the outermost brackets for the root value.
	 * @default true
	 */
	showRootBraces?: boolean;

	/**
	 * Alphabetically sort object keys.
	 * @default false
	 */
	sortKeys?: boolean;

	/**
	 * Enable keyboard navigation and interaction.
	 * @default true
	 */
	enableKeyboard?: boolean;

	/**
	 * Called when the user presses Enter on a leaf node.
	 */
	onSelect?: (path: string, value: unknown) => void;

	/**
	 * Partial theme overrides. Merged with default theme.
	 */
	theme?: Partial<JsonViewerTheme>;

	/**
	 * Number of spaces per indentation level.
	 * @default 2
	 */
	indentWidth?: number;

	/**
	 * Maximum string length before truncation.
	 * @default 120
	 */
	maxStringLength?: number;

	/**
	 * Whether the component is focused/active for keyboard input.
	 * @default true
	 */
	isActive?: boolean;

	/**
	 * Root label to display (e.g., the variable name).
	 */
	rootLabel?: string;
};

/** Internal tree state */
export type TreeState = {
	nodes: readonly JsonNode[];
	nodeIndex: ReadonlyMap<string, JsonNode>;
	expandState: ExpandState;
	focusedNodeId: string | undefined;
	focusedRowIndex: number;
	visibleRows: readonly VisibleRow[];
	visibleFromIndex: number;
	visibleToIndex: number;
	maxHeight: number;
	searchQuery: string;
	searchMatches: readonly string[];
	searchMatchIndex: number;
	isSearching: boolean;
};

/** Reducer actions */
export type TreeAction =
	| {type: 'focus-next'}
	| {type: 'focus-previous'}
	| {type: 'focus-first'}
	| {type: 'focus-last'}
	| {type: 'toggle-expand'}
	| {type: 'expand-focused'}
	| {type: 'collapse-focused'}
	| {type: 'expand-all'}
	| {type: 'collapse-all'}
	| {type: 'move-to-parent'}
	| {type: 'move-to-first-child'}
	| {type: 'set-search-query'; query: string}
	| {type: 'next-search-match'}
	| {type: 'previous-search-match'}
	| {type: 'enter-search'}
	| {type: 'exit-search'}
	| {
			type: 'reset';
			nodes: readonly JsonNode[];
			expandState: ExpandState;
			maxHeight: number;
	  };
