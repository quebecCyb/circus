import { io } from 'socket.io-client';

class ChatClient {
    socket: any;
    constructor(url, namespace) {
        this.socket = io(`${url}/${namespace}`);
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
        console.log('Connected to the chat server');
        });

        this.socket.on('disconnect', () => {
        console.log('Disconnected from the chat server');
        });

        this.socket.on('joinedRoom', (room) => {
        console.log(`Joined room ${room}`);
        });

        this.socket.on('leftRoom', (room) => {
        console.log(`Left room ${room}`);
        });

        this.socket.on('receiveMessage', (message) => {
        console.log(`New message: ${message}`);
        });

        this.socket.on('gameStarted', () => {
        console.log('Game started');
        });

        this.socket.on('voting', (data) => {
        console.log(`Voting update: ${data}`);
        });

        this.socket.on('eraseDesk', () => {
        console.log('Desk erased');
        });

        this.socket.on('addCard', (card) => {
        console.log(`Received card: ${card}`);
        });

        this.socket.on('gameEnded', (winner) => {
        console.log(`Game ended. Winner: ${winner}`);
        });
    }

    joinRoom(room) {
        this.socket.emit('joinRoom', { room });
    }

    leaveRoom(room) {
        this.socket.emit('leaveRoom', room);
    }

    sendMessage(room, message) {
        this.socket.emit('sendMessage', { room, message });
    }

    addCardToDesk(room, card, username) {
        this.socket.emit('addCardToDesk', { room, card, username });
    }
}

// Example usage
const chatClient = new ChatClient('http://localhost:4100', 'chat');
chatClient.joinRoom('testRoom');
chatClient.sendMessage('testRoom', 'Hello, world!');
