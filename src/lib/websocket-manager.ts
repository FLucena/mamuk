'use client';

/**
 * WebSocket Manager for better bfcache compatibility
 * 
 * This utility helps manage WebSocket connections to improve
 * back/forward cache compatibility by properly closing connections
 * when the page is about to be cached and restoring them when needed.
 */

interface WebSocketWithMetadata {
  socket: WebSocket;
  id: string;
  url: string;
  autoReconnect: boolean;
  lastMessage?: any;
}

class WebSocketManager {
  private sockets: Map<string, WebSocketWithMetadata> = new Map();
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.initialized) return;
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Listen for page transitions
    window.addEventListener('pagehide', this.handlePageHide);
    window.addEventListener('pageshow', this.handlePageShow);
    
    // Listen for custom events
    document.addEventListener('mamuk:suspend-connections', this.suspendAll);
    document.addEventListener('mamuk:resume-connections', this.resumeAll);
    
    this.initialized = true;
  }

  /**
   * Create and register a WebSocket connection
   */
  public connect(url: string, options: { 
    id?: string, 
    autoReconnect?: boolean,
    onOpen?: (event: Event) => void,
    onMessage?: (event: MessageEvent) => void,
    onClose?: (event: CloseEvent) => void,
    onError?: (event: Event) => void
  } = {}): WebSocket {
    const id = options.id || `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const autoReconnect = options.autoReconnect !== undefined ? options.autoReconnect : true;
    
    // Create the WebSocket
    const socket = new WebSocket(url);
    
    // Store metadata
    this.sockets.set(id, {
      socket,
      id,
      url,
      autoReconnect
    });
    
    // Set up event handlers
    if (options.onOpen) socket.addEventListener('open', options.onOpen);
    
    if (options.onMessage) {
      const messageHandler = (event: MessageEvent) => {
        // Store the last message for potential reconnection
        try {
          const metadata = this.sockets.get(id);
          if (metadata) {
            metadata.lastMessage = event.data;
            this.sockets.set(id, metadata);
          }
        } catch (e) {
          console.error('Error storing last message:', e);
        }
        
        options.onMessage!(event);
      };
      
      socket.addEventListener('message', messageHandler);
    }
    
    if (options.onClose) socket.addEventListener('close', options.onClose);
    if (options.onError) socket.addEventListener('error', options.onError);
    
    return socket;
  }

  /**
   * Close and remove a WebSocket connection
   */
  public disconnect(idOrSocket: string | WebSocket): void {
    let id: string | undefined;
    
    if (typeof idOrSocket === 'string') {
      id = idOrSocket;
    } else {
      // Find the id by socket reference
      id = Array.from(this.sockets.entries())
        .find(([_, value]) => value.socket === idOrSocket)?.[0];
    }
    
    if (id && this.sockets.has(id)) {
      const { socket } = this.sockets.get(id)!;
      
      if (socket.readyState === WebSocket.OPEN || 
          socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, 'Client disconnecting');
      }
      
      this.sockets.delete(id);
    }
  }

  /**
   * Close all WebSocket connections
   */
  public disconnectAll(): void {
    Array.from(this.sockets.values()).forEach(({ socket }) => {
      if (socket.readyState === WebSocket.OPEN || 
          socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, 'Client disconnecting all');
      }
    });
    
    this.sockets.clear();
  }

  /**
   * Suspend all connections (for bfcache)
   */
  private suspendAll = (): void => {
    // Store connection info but close the actual sockets
    Array.from(this.sockets.values()).forEach(metadata => {
      if (metadata.socket.readyState === WebSocket.OPEN) {
        metadata.socket.close(1000, 'Page suspending for bfcache');
      }
    });
  }

  /**
   * Resume all connections that were auto-reconnect enabled
   */
  private resumeAll = (): void => {
    // Reconnect sockets that were previously connected
    Array.from(this.sockets.entries()).forEach(([id, metadata]) => {
      if (metadata.autoReconnect) {
        // Replace the old socket with a new one
        const newSocket = new WebSocket(metadata.url);
        
        // Update the metadata
        metadata.socket = newSocket;
        this.sockets.set(id, metadata);
      }
    });
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      // Page is being hidden, potentially for bfcache
      this.suspendAll();
    } else if (document.visibilityState === 'visible') {
      // Page is visible again
      this.resumeAll();
    }
  }

  /**
   * Handle page hide event (page is about to be unloaded or put in bfcache)
   */
  private handlePageHide = (event: PageTransitionEvent): void => {
    // If the page is being stored in bfcache (persisted)
    if (event.persisted) {
      this.suspendAll();
    }
  }

  /**
   * Handle page show event (page has been loaded or restored from bfcache)
   */
  private handlePageShow = (event: PageTransitionEvent): void => {
    // If the page was restored from bfcache
    if (event.persisted) {
      this.resumeAll();
    }
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('pagehide', this.handlePageHide);
    window.removeEventListener('pageshow', this.handlePageShow);
    document.removeEventListener('mamuk:suspend-connections', this.suspendAll);
    document.removeEventListener('mamuk:resume-connections', this.resumeAll);
    
    this.disconnectAll();
    this.initialized = false;
  }
}

// Export singleton instance
export const wsManager = typeof window !== 'undefined' ? new WebSocketManager() : null;

// Export for strongly typed imports
export default WebSocketManager; 