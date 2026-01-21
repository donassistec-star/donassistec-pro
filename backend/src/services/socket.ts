import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

let io: SocketServer | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });

    // Join room para notificações específicas
    socket.on("join-room", (room: string) => {
      socket.join(room);
      console.log(`Cliente ${socket.id} entrou na sala: ${room}`);
    });

    // Leave room
    socket.on("leave-room", (room: string) => {
      socket.leave(room);
      console.log(`Cliente ${socket.id} saiu da sala: ${room}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO não foi inicializado!");
  }
  return io;
};

// Helper para enviar notificações
export const sendNotification = (room: string, event: string, data: any) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};
