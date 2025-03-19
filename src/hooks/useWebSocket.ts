'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { wsManager } from '@/lib/websocket-manager';
import { MessageData } from '@/types/common';

interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  autoReconnect?: boolean;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: MessageData;
  error: Event | null;
  connect: () => void;
  disconnect: () => void;
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
}

/**
 * A hook to use WebSockets with bfcache support
 */
const useWebSocket = ({
  url,
  autoConnect = true,
  autoReconnect = true,
  onOpen,
  onMessage,
  onClose,
  onError
}: UseWebSocketOptions): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageData>(null);
  const [error, setError] = useState<Event | null>(null);
  
  // Use a ref to track the instance ID for cleanup
  const socketIdRef = useRef<string | null>(null);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!wsManager || isConnected || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    const handleOpen = (event: Event) => {
      setIsConnected(true);
      setIsConnecting(false);
      onOpen?.(event);
    };
    
    const handleMessage = (event: MessageEvent) => {
      setLastMessage(event.data);
      onMessage?.(event);
    };
    
    const handleClose = (event: CloseEvent) => {
      setIsConnected(false);
      setIsConnecting(false);
      onClose?.(event);
    };
    
    const handleError = (event: Event) => {
      setError(event);
      setIsConnecting(false);
      onError?.(event);
    };
    
    // Create a unique ID for this connection
    const id = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    socketIdRef.current = id;
    
    try {
      // Create and register the socket
      const newSocket = wsManager?.connect(url, {
        id,
        autoReconnect,
        onOpen: handleOpen,
        onMessage: handleMessage,
        onClose: handleClose,
        onError: handleError
      });
      
      if (newSocket) {
        setSocket(newSocket);
      } else {
        // Handle case where wsManager is not available (SSR)
        setIsConnecting(false);
      }
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setIsConnecting(false);
      setError(new Event('error'));
    }
    
    return () => {
      if (socketIdRef.current && wsManager) {
        wsManager.disconnect(socketIdRef.current);
        socketIdRef.current = null;
      }
    };
  }, [
    url, autoReconnect, isConnected, isConnecting, 
    onOpen, onMessage, onClose, onError
  ]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (!wsManager || !socketIdRef.current) return;
    
    wsManager.disconnect(socketIdRef.current);
    socketIdRef.current = null;
    setSocket(null);
    setIsConnected(false);
    setIsConnecting(false);
  }, []);
  
  // Send data through WebSocket
  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    socket.send(data);
  }, [socket]);
  
  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      if (socketIdRef.current && wsManager) {
        wsManager.disconnect(socketIdRef.current);
      }
    };
  }, [connect, autoConnect]);
  
  return {
    socket,
    isConnected,
    isConnecting,
    lastMessage,
    error,
    connect,
    disconnect,
    send
  };
};

export default useWebSocket; 