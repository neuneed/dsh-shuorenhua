/**
 * Shared types for dsh-shuorenhua (说人话).
 */
/** Supported humanization modes. */
export type HumanizeMode = 'natural' | 'concise' | 'code_first';
/** Options for humanize execution. */
export interface HumanizeOptions {
    /** Mode of simplification. Default is 'natural'. */
    mode?: HumanizeMode;
    /** Preserve code blocks verbatim without altering their content. Default: true. */
    preserveCode?: boolean;
}
/** Humanization statistics and metrics. */
export interface HumanizeStats {
    /** Character count of original text. */
    originalLength: number;
    /** Character count of simplified text. */
    humanizedLength: number;
    /** Compression ratio percentage (e.g. 35 for 35% saved). */
    savedPercentage: number;
    /** Count of removed conversational opening greetings. */
    removedOpeners: number;
    /** Count of removed closing polite disclaimers. */
    removedClosers: number;
    /** Count of replaced AI buzzwords / bureaucratic jargon. */
    replacedBuzzwords: number;
}
/** Result returned by the humanize engine. */
export interface HumanizeResult {
    /** The final humanized/simplified text. */
    text: string;
    /** Original input text. */
    original: string;
    /** Active mode used. */
    mode: HumanizeMode;
    /** Detailed statistics. */
    stats: HumanizeStats;
}
/** Plugin configuration schema for cordis. */
export interface ShuorenhuaConfig {
    /** Default mode when none specified. */
    defaultMode?: HumanizeMode;
    /** Whether to register the agent tool `shuorenhua_simplify`. Default: true. */
    enableTool?: boolean;
}
