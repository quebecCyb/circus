
const CLIENT_ROUTE = { // client to server
    JOIN: 'joinRoom',
    START: 'start',
    LEFT: 'leaveRoom',
    MSG: 'sendMessage',

    PLAY: 'play',
    VOTE: 'vote',
}


const SERVER_ROUTE = { // server to client
    JOIN: 'joined',
    STARTED: 'start',
    LEFT: 'left',
    MSG: 'receiveMessage',

    TURN: 'turn',
    VOTE: 'vote',
}

