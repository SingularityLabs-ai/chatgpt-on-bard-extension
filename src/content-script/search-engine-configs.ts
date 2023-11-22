export interface SearchEngine {
  chatWindowSelector: string[]
  promptTextareaSelector: string
  promptSendButtonSelector: string
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, SearchEngine> = {
  bard: {
    chatWindowSelector: ['chat-window'],
    promptTextareaSelector: 'text-input-field_textarea',
    promptSendButtonSelector: 'send-button-container',
  },
}
