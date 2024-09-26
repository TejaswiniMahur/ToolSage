const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// In-memory storage for tickets (replace with a database in a real application)
let tickets = [];

// Helper function to get ticket statistics by month
function getTicketStatsByMonth() {
    const stats = {};
    tickets.forEach(ticket => {
        const month = new Date(ticket.createdAt).toLocaleString('default', { month: 'long' });
        if (!stats[month]) {
            stats[month] = { raised: 0, closed: 0 };
        }
        stats[month].raised++;
        if (ticket.status === 'closed') {
            stats[month].closed++;
        }
    });
    return stats;
}

// Route to add a new ticket
app.post('/tickets', (req, res) => {
    const newTicket = {
        id: tickets.length + 1,
        title: req.body.title,
        status: 'open',
        createdAt: new Date()
    };
    tickets.push(newTicket);
    
    // Emit the updated stats to all connected clients
    io.emit('ticketStatsUpdate', getTicketStatsByMonth());
    
    res.status(201).json(newTicket);
});

// Route to get ticket statistics
app.get('/tickets/stats', (req, res) => {
    res.json(getTicketStatsByMonth());
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Send initial stats to the newly connected client
    socket.emit('ticketStatsUpdate', getTicketStatsByMonth());

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});