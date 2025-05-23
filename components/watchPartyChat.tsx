import { useSocket } from "@/hooks/useSocket";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, X } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Message {
  id: string;
  sender: {
    name: string;
    id: string;
  };
  content: string;
  timestamp: number;
  type: "text" | "reaction";
  reactions?: {
    [emoji: string]: string[]; // tableau d'ID d'utilisateurs ayant réagi avec cet emoji
  };
}

interface WatchPartyChatProps {
  roomId: string;
  onClose: () => void;
  // États partagés avec le composant parent VideoPlayer
  messages?: Message[];
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
  userCount?: number;
  setUserCount?: React.Dispatch<React.SetStateAction<number>>;
}

const WatchPartyChat = ({ 
  roomId, 
  onClose, 
  messages: parentMessages, 
  setMessages: setParentMessages, 
  userCount: parentUserCount,
  setUserCount: setParentUserCount
}: WatchPartyChatProps) => {
  // S'assurer que tous les utilisateurs utilisent le même roomId pour la même vidéo
  // En utilisant le paramètre URL watchParty qui est partagé
  const fixedRoomId = roomId;
  // Utiliser les états fournis par le parent ou créer des états locaux si non fournis
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [localUserCount, setLocalUserCount] = useState(0);
  const { socket, isConnected } = useSocket();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // États réels à utiliser (partagés ou locaux)
  const messages = parentMessages || localMessages;
  const setMessages = setParentMessages || setLocalMessages;
  const userCount = parentUserCount !== undefined ? parentUserCount : localUserCount;
  const setUserCount = setParentUserCount || setLocalUserCount;

  useEffect(() => {
    const savedUsername = localStorage.getItem("watchParty_username");

    if (savedUsername) {
      setUsername(savedUsername);
      setIsNameSet(true);
    }
  }, []);

  // Effet pour se connecter à la salle dès que possible
  useEffect(() => {
    if (!socket || !isConnected || !fixedRoomId || !isNameSet) return;
    
    console.log(`Rejoindre la salle avec l'ID: ${fixedRoomId} en tant que ${username}`);
    socket.emit("userJoined", { roomId: fixedRoomId, username });
  }, [socket, isConnected, fixedRoomId, isNameSet, username]);

  useEffect(() => {
    if (!socket || !isConnected || !fixedRoomId) return;

    console.log('Configuration des écouteurs de socket pour la salle:', fixedRoomId);
    
    // D'abord retirer tout écouteur précédent pour éviter les doublons
    socket.off("newMessage");
    socket.off("newChatMessage");
    socket.off("userCountUpdate");
    socket.off("chatHistory");
    socket.off("messageReaction");

    // Puis configurer les nouveaux écouteurs
    socket.on("newMessage", (msg: Message) => {
      console.log('Message reçu du serveur (newMessage):', msg);
      
      // Vérifier si ce message existe déjà pour éviter les doublons
      setMessages((prev: Message[]) => {
        const messageExists = prev.some((m: Message) => 
          (m.id === msg.id) || 
          (m.content === msg.content && 
           m.sender.id === msg.sender.id && 
           Math.abs(m.timestamp - msg.timestamp) < 2000));
        
        if (messageExists) {
          console.log('Message déjà existant, ignoré:', msg);
          return prev;
        }
        
        console.log('Ajout du nouveau message:', msg);
        return [...prev, msg];
      });

      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }, 100);
    });
    
    // Écouter l'événement de mise à jour du nombre d'utilisateurs
    socket.on("userCountUpdate", (data: { count: number }) => {
      console.log('Mise à jour du nombre d\'utilisateurs:', data.count);
      setUserCount(data.count);
    });

    // Écouter les réactions aux messages
    socket.on("messageReaction", ({ messageId, emoji, senderId, senderName }: {
      messageId: string;
      emoji: string;
      senderId: string;
      senderName: string;
    }) => {
      console.log(`Réaction reçue: ${emoji} de ${senderName} pour le message ${messageId}`);
      
      setMessages((prev: Message[]) => {
        return prev.map((msg: Message) => {
          if (msg.id === messageId) {
            const updatedReactions = { ...(msg.reactions || {}) };
            if (!updatedReactions[emoji]) {
              updatedReactions[emoji] = [];
            }
            
            // Ajouter l'ID de l'utilisateur s'il n'a pas déjà réagi avec cet emoji
            if (!updatedReactions[emoji].includes(senderId)) {
              updatedReactions[emoji] = [...updatedReactions[emoji], senderId];
            } else {
              // Si c'est un toggle (retrait de réaction)
              updatedReactions[emoji] = updatedReactions[emoji].filter((id: string) => id !== senderId);
              if (updatedReactions[emoji].length === 0) {
                delete updatedReactions[emoji];
              }
            }
            
            return {
              ...msg,
              reactions: updatedReactions
            };
          }
          return msg;
        });
      });
    });
    
    console.log('Demande des messages précédents pour la salle:', fixedRoomId);
    socket.emit(
      "getMessages",
      { roomId: fixedRoomId },
      (response: { messages: Message[] }) => {
        console.log('Messages précédents reçus:', response.messages);
        setMessages(response.messages || []);
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
          }
        }, 100);
      },
    );
    return () => {
      socket.off("newMessage");
      socket.off("userCountUpdate");
      socket.off("messageReaction");
    };
  }, [socket, isConnected, fixedRoomId, setMessages, setUserCount]);

  const sendMessage = () => {
    if (!message.trim() || !socket || !isConnected || !fixedRoomId || !isNameSet)
      return;
      
    console.log('Envoi d\'un message:', message);
    // Créer l'objet message
    const newMsg: Message = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      content: message,
      sender: {
        name: username,
        id: socket.id || '',
      },
      timestamp: Date.now(),
      type: "text",
    };
    
    // IMPORTANT: Afficher le message localement pour l'expéditeur
    // car le serveur n'envoie les messages qu'aux autres utilisateurs
    setMessages((prev: Message[]) => [...prev, newMsg]);
    
    // Envoyer le message au serveur pour distribution aux autres utilisateurs
    socket.emit("sendMessage", {
      roomId: fixedRoomId,
      message,
      content: message,
      sender: {
        name: username,
        id: socket.id || '',
      },
      type: "text",
    });
    
    // Vider le champ de message après l'envoi
    setMessage("");
    // Scroller vers le bas
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Envoyer une réaction générale (pas associée à un message spécifique)
  const sendReaction = (emoji: string) => {
    if (!socket || !isConnected || !fixedRoomId || !isNameSet) return;

    socket.emit("sendReaction", {
      roomId: fixedRoomId,
      emoji,
      sender: {
        name: username,
        id: socket.id || '',
      },
    });
  };
  
  // Ajouter une réaction à un message spécifique
  const addReactionToMessage = (messageId: string, emoji: string) => {
    if (!socket || !isConnected || !fixedRoomId || !isNameSet) return;
    
    const currentSocketId = socket.id || '';
    
    // Mettre à jour localement pour une expérience utilisateur réactive
    setMessages((prev: Message[]) => {
      return prev.map((msg: Message) => {
        if (msg.id === messageId) {
          const updatedReactions = { ...(msg.reactions || {}) };
          if (!updatedReactions[emoji]) {
            updatedReactions[emoji] = [];
          }
          
          // Ajouter l'ID de l'utilisateur s'il n'a pas déjà réagi avec cet emoji
          if (!updatedReactions[emoji].includes(currentSocketId)) {
            updatedReactions[emoji] = [...updatedReactions[emoji], currentSocketId];
          } else {
            // Si l'utilisateur a déjà réagi avec cet emoji, retirer sa réaction (toggle)
            updatedReactions[emoji] = updatedReactions[emoji].filter((id: string) => id !== currentSocketId);
            if (updatedReactions[emoji].length === 0) {
              delete updatedReactions[emoji];
            }
          }
          
          return {
            ...msg,
            reactions: updatedReactions
          };
        }
        return msg;
      });
    });
    
    // Envoyer au serveur pour synchroniser avec les autres utilisateurs
    socket.emit("addReaction", {
      roomId: fixedRoomId,
      messageId,
      emoji,
      senderId: currentSocketId,
      senderName: username
    });
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    localStorage.setItem("watchParty_username", username);
    setIsNameSet(true);

    // Nous rejoignons maintenant la salle dans l'effet dédié
  };

  // Empêcher la propagation de tous les événements clavier
  // pour qu'ils n'affectent pas le lecteur vidéo quand on tape dans le chat
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Empêcher que les touches comme espace, f, etc. affectent la vidéo
    e.stopPropagation();
    
    // Envoyer le message si on appuie sur Entrée sans Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isNameSet) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-gray-800">
          <h3 className="font-semibold text-white">Rejoindre le chat</h3>
          <Button
            variant="ghost"
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1 text-xs"
          >
            <X className="h-4 w-4" /> Masquer
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <form className="w-full space-y-4" onSubmit={handleUsernameSubmit}>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-gray-400">
                Comment voulez vous-être appelé?
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre nom"
                className="bg-gray-700"
                autoFocus
              />
            </div>
            <Button className="w-full bg-player-accent hover:bg-player-accent/80">
              Rejoindre
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Chat</h3>
          <div className="flex items-center bg-gray-800 px-2 py-1 rounded-full text-xs">
            <span>👥 {userCount}</span>
          </div>
        </div>
        {/* Le bouton pour fermer le chat a été retiré - les utilisateurs doivent utiliser l'icône de conversation */}
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {/* Debug: afficher le nombre de messages */}
        <div className="text-xs text-gray-500 mb-2">
          {messages.length} message(s)
        </div>
        
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Aucun message pour le moment
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "reaction" ? "justify-center" : msg.sender.id === socket?.id ? "justify-end" : "justify-start"}`}
            >
              {msg.type === "reaction" ? (
                <div className="text-2xl">{msg.content}</div>
              ) : (
                <div
                  className={`flex max-w-[80%] ${msg.sender.id === socket?.id ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-player-accent text-white text-xs">
                      {msg.sender.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg px-3 py-2 ${msg.sender.id === socket?.id ? "bg-player-accent text-white ml-2" : "bg-gray-800 text-white"}`}
                  >
                    <div className="text-xs opacity-70 mb-1">
                      {msg.sender.name}
                    </div>
                    <div className="text-sm break-words">{msg.content}</div>
                    
                    {/* Affichage des réactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <button 
                            key={emoji}
                            onClick={() => addReactionToMessage(msg.id, emoji)}
                            className={`text-xs rounded-full px-1.5 py-0.5 flex items-center ${users.includes(socket?.id || '') ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                          >
                            <span className="mr-1">{emoji}</span>
                            <span className="text-xs">{users.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Menu pour ajouter une réaction */}
                    <div className="mt-1 flex justify-end">
                      <div className="relative group">
                        <button className="text-xs text-gray-400 hover:text-white">
                          <span className="text-xs">😊</span>
                        </button>
                        <div className="absolute right-0 bottom-full mb-1 hidden group-hover:flex bg-gray-800 rounded-lg p-1 shadow-lg z-10">
                          <div className="grid grid-cols-6 gap-1">
                            {['👍', '❤️', '😂', '😮', '😢', '👏'].map(emoji => (
                              <button 
                                key={emoji} 
                                onClick={() => addReactionToMessage(msg.id, emoji)}
                                className="hover:bg-gray-700 rounded p-1 text-base"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2 mb-2">
          {["😀", "😂", "❤️", "👍", "😮", "😢"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="text-lg hover:bg-gray-800 p-1 rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyPress={(e) => e.stopPropagation()} // Arrêter la propagation pour toutes les touches
            onKeyUp={(e) => e.stopPropagation()} // Arrêter la propagation pour les relâchements de touches
            onClick={(e) => e.stopPropagation()} // Arrêter la propagation des clics
            placeholder="Écrire un message..."
            className="bg-gray-900 border-gray-700 text-sm"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            disabled={!message.trim()}
            className="bg-player-accent hover:bg-player-accent/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WatchPartyChat;