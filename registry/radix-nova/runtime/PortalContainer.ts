import * as React from "react"

// The consuming runtime owns portal placement. Registry primitives consume
// this injected container and must not infer a host from document.body.
export const PortalContainerContext =
  React.createContext<HTMLElement | null>(null)

export function usePortalContainer() {
  return React.useContext(PortalContainerContext)
}
