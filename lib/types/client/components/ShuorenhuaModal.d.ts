/**
 * Pop-up Modal dialog for Shuorenhua (说人话).
 * Displays humanized text, comparison stats, mode switcher, one-click copy, and ESC dismissal.
 */
import React from 'react';
export interface ShuorenhuaModalProps {
    open: boolean;
    onClose: () => void;
    originalText: string;
    t?: (key: string) => string;
}
export declare function ShuorenhuaModal({ open, onClose, originalText, t, }: ShuorenhuaModalProps): React.ReactPortal | null;
