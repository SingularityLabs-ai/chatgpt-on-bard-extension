export interface SearchEngine {
  // inputQuery: string[]
  // bodyQuery: string[]
  sidebarContainerQuery: string[]
  appendContainerQuery: string[]
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, SearchEngine> = {
  bard: {
    // inputQuery: ["textarea"],
    // bodyQuery: ['textarea'],
    sidebarContainerQuery: ['chat-window'],
    appendContainerQuery: [],
  },
}
