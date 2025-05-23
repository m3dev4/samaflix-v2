"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Init le socket et gère les connexions
 * @returns {socket: Socket | null, isConnected: boolean, reconnect: () => void}
 *
 * @example
 * const { socket, isConnected, reconnect } = useSocket();
 *
 */

export const useSocket = () => {
  // Utiliser directement localhost:3001 pour le serveur socket
  const SOCKET_SERVER_URL = "http://localhost:3001";

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Se connecter directement au serveur socket sans chemin spécifique
    const socketIo = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socketIo;
    setSocket(socketIo);

    const onConnect = () => {
      setIsConnected(true);
    };
    const isDisconnect = () => {
      setIsConnected(false);
    };

    const onError = (error: Error) => {
      console.error("Socket io error", error);
      setIsConnected(false);
      // Tenter de se reconnecter après 2 secondes en cas d'erreur
      setTimeout(() => {
        if (socketRef.current) {
          console.log("Tentative de reconnexion automatique...");
          socketRef.current.connect();
        }
      }, 2000);
    };

    socketIo.on("connect", onConnect);
    socketIo.on("disconnect", isDisconnect);
    socketIo.on("error", onError);
    socketIo.on("connect_error", (err) => {
      console.log("Erreur de connexion:", err.message);
      // Basculer vers polling si websocket échoue
      if (err.message.includes("websocket")) {
        console.log("Basculement vers polling...");
        socketIo.io.opts.transports = ["polling"];
      }
    });

    return () => {
      socketIo.off("connect", onConnect);
      socketIo.off("disconnect", isDisconnect);
      socketIo.off("error", onError);
      socketIo.disconnect();
      socketRef.current = null;
    };
  }, []);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  return {
    socket,
    isConnected,
    reconnect,
  };
};
