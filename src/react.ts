import { useMemo, useState } from "react"
import { LiveEditClient } from "./client"

export function useClient<T>(wsURL: string) {
  const [connected, setConnected] = useState(false)

  // Create a websocket
  const { client, ws } = useMemo(() => {
    const ws = new WebSocket(wsURL)

    const client = new LiveEditClient<T>(msg => ws.send(JSON.stringify(msg)))

    ws.onopen = e => {
      client.connected = true
      setConnected(true)
    }

    ws.onclose = e => {
      client.connected = true
      setConnected(true)
    }

    ws.onmessage = e => {
      client.handleMessage(JSON.parse(e.data))
    }

    return { client, ws }
  }, [wsURL])

  return client
}

// type Props<T, F extends keyof T> = {
//   client: LiveEditClient<T>
//   type: F
//   id: string,
//   children: (value: T) => React.ReactNode
// }

// export function LiveEditor(props: Props) {

// }
