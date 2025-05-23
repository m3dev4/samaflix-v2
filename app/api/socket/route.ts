import { Server as NetServer } from 'http';
import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';

// Extension du type Server pour inclure la propriété io
interface ExtendedServer extends NetServer {
  io?: SocketIOServer;
}

// Variable globale pour stocker l'instance de socket.io
let io: SocketIOServer | null = null;

// Interface pour les données utilisateur
interface User {
  id: string;
  name: string;
}

// Interface pour les messages
interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: number;
  type: string;
  reactions?: {
    [emoji: string]: string[];
  };
}

// Interface pour les données de salle
interface Room {
  users: Map<string, User>;
  messages: Message[];
}

// Stocker les informations des salles
const rooms = new Map<string, Room>();

// Initialiser le serveur socket.io
function initSocketServer(res: any) {
  if (io) return io;

  // Typage correct du serveur HTTP avec extension
  const httpServer: ExtendedServer = res.socket.server;

  // Initialiser le socketPath une seule fois
  if (!httpServer.io) {
    console.log('Initialisation du serveur Socket.IO');
    
    // Créer une instance de socket.io avec les options CORS appropriées
    io = new SocketIOServer(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Stocker l'instance dans le serveur HTTP pour une réutilisation
    httpServer.io = io;

    // Gérer les connexions socket
    io.on('connection', (socket) => {
      console.log(`Utilisateur connecté: ${socket.id}`);

      // Gérer la jointure d'un utilisateur à une salle
      socket.on('userJoined', ({ roomId, username }: { roomId: string; username: string }) => {
        socket.join(roomId);
        
        // Initialiser la salle si elle n'existe pas
        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            users: new Map<string, User>(),
            messages: []
          });
        }
        
        // Ajouter l'utilisateur à la salle
        const room = rooms.get(roomId)!;
        room.users.set(socket.id, { id: socket.id, name: username });
        
        // Envoyer la mise à jour du nombre d'utilisateurs à tous les clients dans la salle
        io?.to(roomId).emit('userCountUpdate', { 
          count: room.users.size 
        });
        
        console.log(`${username} a rejoint la salle ${roomId}. Total: ${room.users.size}`);
      });

      // Gérer l'envoi d'un message
      socket.on('sendMessage', ({ 
        roomId, 
        message, 
        sender, 
        type = 'text' 
      }: { 
        roomId: string; 
        message: string; 
        sender: User; 
        type?: string;
      }) => {
        if (!rooms.has(roomId)) return;
        
        const room = rooms.get(roomId)!;
        const messageObj: Message = {
          id: Date.now().toString(),
          content: message,
          sender,
          timestamp: Date.now(),
          type
        };
        
        room.messages.push(messageObj);
        
        // Diffuser le message à tous les utilisateurs dans la salle
        io?.to(roomId).emit('newMessage', messageObj);
      });

      // Gérer l'envoi d'une réaction
      socket.on('sendReaction', ({ 
        roomId, 
        emoji, 
        sender 
      }: { 
        roomId: string; 
        emoji: string; 
        sender: User;
      }) => {
        if (!rooms.has(roomId)) return;
        
        const messageObj: Message = {
          id: Date.now().toString(),
          content: emoji,
          sender,
          timestamp: Date.now(),
          type: 'reaction'
        };
        
        // Diffuser la réaction à tous les utilisateurs dans la salle
        io?.to(roomId).emit('newMessage', messageObj);
      });

      // Gérer l'ajout d'une réaction à un message spécifique
      socket.on('addReaction', ({ 
        roomId, 
        messageId, 
        emoji, 
        senderId, 
        senderName 
      }: { 
        roomId: string; 
        messageId: string; 
        emoji: string; 
        senderId: string; 
        senderName: string;
      }) => {
        if (!rooms.has(roomId)) return;
        
        const room = rooms.get(roomId)!;
        const message = room.messages.find(msg => msg.id === messageId);
        
        if (message) {
          if (!message.reactions) {
            message.reactions = {};
          }
          
          if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
          }
          
          // Toggle de la réaction
          const userIndex = message.reactions[emoji].indexOf(senderId);
          if (userIndex === -1) {
            message.reactions[emoji].push(senderId);
          } else {
            message.reactions[emoji].splice(userIndex, 1);
            if (message.reactions[emoji].length === 0) {
              delete message.reactions[emoji];
            }
          }
          
          // Diffuser la mise à jour de la réaction
          io?.to(roomId).emit('messageReaction', {
            messageId,
            emoji,
            senderId,
            senderName
          });
        }
      });

      // Récupérer les messages d'une salle
      socket.on('getMessages', ({ roomId }: { roomId: string }, callback: (response: { messages: Message[] }) => void) => {
        if (!rooms.has(roomId)) {
          callback({ messages: [] });
          return;
        }
        
        const room = rooms.get(roomId)!;
        callback({ messages: room.messages });
      });

      // Gérer la déconnexion
      socket.on('disconnect', () => {
        console.log(`Utilisateur déconnecté: ${socket.id}`);
        
        // Rechercher et mettre à jour toutes les salles où cet utilisateur était présent
        for (const [roomId, room] of rooms.entries()) {
          if (room.users.has(socket.id)) {
            const username = room.users.get(socket.id)?.name || 'Inconnu';
            room.users.delete(socket.id);
            
            console.log(`${username} a quitté la salle ${roomId}. Restants: ${room.users.size}`);
            
            // Envoyer la mise à jour du nombre d'utilisateurs
            io?.to(roomId).emit('userCountUpdate', { 
              count: room.users.size 
            });
            
            // Supprimer la salle si elle est vide
            if (room.users.size === 0) {
              rooms.delete(roomId);
              console.log(`Salle ${roomId} supprimée car vide`);
            }
          }
        }
      });
    });
  }
  
  return io;
}

// Gestionnaire pour les requêtes GET
export async function GET(req: NextRequest, res: any) {
  try {
    initSocketServer(res);
    return new Response('Socket.IO est prêt', { status: 200 });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Socket.IO:', error);
    return new Response('Erreur lors de l\'initialisation de Socket.IO', { status: 500 });
  }
}