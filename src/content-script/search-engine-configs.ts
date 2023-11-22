export interface SearchEngine {
  chatWindowSelector: string[]
  domTextareaSelector: string
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, SearchEngine> = {
  bard: {
    chatWindowSelector: ['chat-window'],
    domTextareaSelector: 'text-input-field_textarea',
  },
}
