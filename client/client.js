import { io } from 'socket.io-client';

class ChatClient {
    constructor(url, namespace, token) {
        this.socket = io(`${url}/${namespace}`, { query: {token} });
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to the chat server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from the chat server');
        });

        this.socket.on('joined', (username) => {
            console.log(`Joined room ${username}`);
        });

        this.socket.on('left', (username) => {
            console.log(`Left room ${username}`);
        });

        this.socket.on('receiveMessage', (message) => {
        console.log(`New message: ${message.message}`);
        });

        this.socket.on('start', () => {
            console.log('Game started');
        });

        this.socket.on('turn', () => {
            console.log('turn');
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

        this.socket.on('finish', (winner) => {
            console.log(`Game ended. Winner: ${winner}`);
        });
    }

    joinRoom(session) {
        this.socket.emit('joinRoom', { session });
    }

    leaveRoom(session) {
        this.socket.emit('leaveRoom', session);
    }

    sendMessage(session, message) {
        this.socket.emit('sendMessage', { session, message });
    }

    start() {
        this.socket.emit('start');
    }
}

let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhZDIiLCJpYXQiOjE3MTA2NTIyNjksImV4cCI6MTcxMDczODY2OX0.3oyU9nMArKTjpIUb7d37OyebG__0PYmG99NG98PNkrs'

// Example usage
const chatClient = new ChatClient('http://localhost:4100', 'chat', token);
chatClient.joinRoom('test');
chatClient.sendMessage('test', 'YA PRISORdeed');


// setTimeout(() => {
//     console.log('START')
//     chatClient.start()
// }, 20000)

