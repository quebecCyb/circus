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
            console.log(`join: ${username}`.JSON);
        });

        this.socket.on('left', (username) => {
            console.log(`left: ${username}`.JSON);
        });

        this.socket.on('start', () => {
            console.log('start');
        });

        this.socket.on('turn', () => {
            console.log('turn');
        });

        this.socket.on('vote', (data) => {
            console.log(`vote: ${data}`.JSON);
        });

        this.socket.on('addCard', (card) => {
            console.log(`card: ${card}`.JSON);
        });

        this.socket.on('finish', (winner) => {
            console.log(`winner: ${winner}`.JSON);
        });
    }

    joinRoom(session) {
        this.socket.emit('joinRoom', { session });
    }

    leaveRoom(session) {
        this.socket.emit('leaveRoom', { session });
    }

    sendMessage(session, message) {
        this.socket.emit('sendMessage', { session, message });
    }

    start(session) {
        this.socket.emit('start', { session });
    }

    play(username, card) {
        this.socket.emit('play', { username, card });
    }

    vote(username, usernameFor) {
        this.socket.emit('vote', { username, usernameFor });
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

