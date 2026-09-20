/**
 * Pop-up Modal dialog for Shuorenhua (说人话).
 * Displays real-time AI humanization with streaming typewriter output,
 * single unified mode, comparison stats, one-click copy, and ESC dismissal.
 */
import React from 'react';
export interface ShuorenhuaModalProps {
    open: boolean;
    onClose: () => void;
    originalText: string;
    /** Assistant message id; the rewrite cache is keyed by it together with the text. */
    messageId?: string;
    t?: (key: string) => string;
}
export declare function ShuorenhuaModal({ open, onClose, originalText, messageId, t, }: ShuorenhuaModalProps): React.ReactPortal | null;
