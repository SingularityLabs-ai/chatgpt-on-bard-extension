export interface SearchEngine {
  chatWindowSelector: string[]
  promptTextareaSelector: string
  promptSendButtonSelector: string
  userQueriesListSelector: string
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, SearchEngine> = {
  bard: {
    chatWindowSelector: ['chat-window'],
    promptTextareaSelector: 'text-input-field_textarea',
    userQueriesListSelector: 'div.user-query-container',
    promptSendButtonSelector: 'send-button-container',
  },
}
