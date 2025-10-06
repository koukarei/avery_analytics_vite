import ReconnectingWebSocket from 'reconnecting-websocket'

type Subscriber<R = unknown> = (message: R) => void | (() => void)

type WebSocketClientConfig = {
  urls: string[]
}

export class WebSocketClient {
  private readonly config: WebSocketClientConfig

  private readonly subscribers = new Map<string, Set<Subscriber>>()

  private readonly websockets = new Map<string, ReconnectingWebSocket>()

  // per-url outgoing message queue
  private readonly sendQueues = new Map<string, unknown[]>()

  private data: { [url: string]: unknown } | undefined

  constructor(config: WebSocketClientConfig) {
    this.config = config
    const { urls } = config
    urls.forEach((url) => {
      this.subscribers.set(url, new Set())
    })
  }

  // #1.接続先のURLに対し接続を開始し、メッセージ受信時に実行されるイベントリスナを登録
  // 受信したデータをストアに保持しつつ、登録されたサブスクライバを実行
  open = () => {
    const { urls } = this.config
    urls.forEach((url) => {
      const ws = new ReconnectingWebSocket(url)
      console.log(`connectiong... ${url}`)
      ws.addEventListener('message', (event: MessageEvent<string>) => {
        const parsedData = JSON.parse(event.data)
        this.data = { ...this.data, [url]: parsedData }
        this.subscribers.get(url)?.forEach((s) => s(parsedData))
      })
      // When the socket opens, flush any queued messages
      ws.addEventListener('open', () => {
        const queue = this.sendQueues.get(url)
        if (queue && queue.length > 0) {
          try {
            queue.forEach((m) => ws.send(JSON.stringify(m)))
            queue.length = 0
          } catch (err) {
            console.error('Failed to flush websocket send queue for', url, err)
          }
        }
      })
      this.websockets.set(url, ws)
      // ensure there's a queue initialized for this url
      if (!this.sendQueues.has(url)) this.sendQueues.set(url, [])
    })
  }

  // #2. ストアが保持している現在の値を返す
  get = <R,>(url: string) => this.data?.[url] as R

  // #3. メッセージを送信
  // send will queue messages when socket is not open yet.
  // This avoids throwing 'websocket is not ready' and ensures messages
  // are delivered when the connection becomes available.
  send = (url: string, message: unknown) => {
    const target = this.websockets.get(url)
    // message can be null/undefined; guard early
    if (message === null || message === undefined) {
      console.warn('Attempted to send empty message to', url)
      return
    }
    if (target && target.readyState === WebSocket.OPEN) {
      target.send(JSON.stringify(message))
      return
    }

    // otherwise enqueue
    const queue = this.sendQueues.get(url) ?? []
    queue.push(message)
    this.sendQueues.set(url, queue)
  }

  // #4. 接続先のURL毎にサブスクライバの登録
  subscribe = (url: string, subscriber: Subscriber | Subscriber[]) => {
    const target = this.subscribers.get(url)
    if (target) {
      if (Array.isArray(subscriber)) {
        subscriber.forEach((s) => target.add(s))
      } else {
        target.add(subscriber)
      }
    }
  }

  // #5. 接続先のURL毎にサブスクライバを解除
  unsubscribe = (url: string, subscriber: Subscriber | Subscriber[]) => {
    const target = this.subscribers.get(url)
    if (target) {
      if (Array.isArray(subscriber)) {
        subscriber.forEach((s) => target.delete(s))
      } else {
        target.delete(subscriber)
      }
    }
  }

  // #6. 接続先のクローズ
  close = () => {
    this.websockets.forEach((w, u) => {
      console.log(`closing... ${u}`)
      w.close(
        1000, 'Normal Closure by client'
      )
    })
    this.subscribers.forEach((s) => s.clear())
  }
}