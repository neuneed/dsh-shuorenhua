/**
 * Shuorenhua action button mounted into `conversation.chat.assistant-actions`.
 * Appears beside the built-in copy/branch actions on each completed assistant message.
 */
import React from 'react';
export interface ShuorenhuaButtonProps {
    messageId?: string;
    useChat?: (selector: (snapshot: any) => any) => any;
    t?: (key: string) => string;
}
export declare function ShuorenhuaButton({ messageId, useChat, t, }: ShuorenhuaButtonProps): React.ReactElement;
