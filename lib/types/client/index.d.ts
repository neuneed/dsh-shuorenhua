/**
 * dsh-shuorenhua Client plugin entry for DeepSeek Harness Web UI.
 * Injects the "说人话" button into `conversation.chat.assistant-actions`.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type ShuorenhuaKey } from './locales.js';
export declare const name = "dsh-shuorenhua";
export declare const inject: string[];
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        shuorenhua: ShuorenhuaKey;
    }
}
/**
 * Apply the Client-side Shuorenhua plugin to the browser Cordis Context.
 * @param ctx - Browser Client root context.
 */
export declare function apply(ctx: ClientContext): void;
export { ShuorenhuaButton } from './components/ShuorenhuaButton.jsx';
export { ShuorenhuaModal } from './components/ShuorenhuaModal.jsx';
export * from './locales.js';
