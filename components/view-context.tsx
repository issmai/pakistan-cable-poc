"use client"

import * as React from "react"



interface ViewContextValue {
    isAgentOpen: boolean
    setIsAgentOpen: (isOpen: boolean) => void
}

const ViewContext = React.createContext<ViewContextValue | undefined>(undefined)

export function ViewProvider({ children }: { children: React.ReactNode }) {
    const [isAgentOpen, setIsAgentOpen] = React.useState(false)

    return (
        <ViewContext.Provider value={{ isAgentOpen, setIsAgentOpen }}>
            {children}
        </ViewContext.Provider>
    )
}

export function useView() {
    const context = React.useContext(ViewContext)
    if (!context) {
        throw new Error("useView must be used within a ViewProvider")
    }
    return context
}
