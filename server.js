// Custom Socket.io Server for CartMate
// Handles real-time features alongside Next.js

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })

    // Initialize Socket.io
    const io = new Server(server, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    })

    // Socket.io connection handling
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        // Join a specific shopping list room
        socket.on('join-list', (listId) => {
            socket.join(listId)
            console.log(`User ${socket.id} joined list ${listId}`)

            // Notify others in the room
            socket.to(listId).emit('user-joined', {
                userId: socket.id,
                timestamp: new Date(),
            })
        })

        // Leave a shopping list room
        socket.on('leave-list', (listId) => {
            socket.leave(listId)
            console.log(`User ${socket.id} left list ${listId}`)

            // Notify others in the room
            socket.to(listId).emit('user-left', {
                userId: socket.id,
                timestamp: new Date(),
            })
        })

        // Handle item updates (add, toggle, edit, delete)
        socket.on('item-updated', (data) => {
            const { listId, item, action, actor } = data
            console.log(`Item ${action} in list ${listId}:`, item.name || item.id)

            // Broadcast to all users in the list except sender
            socket.to(listId).emit('item-updated', {
                item,
                action,
                actor,
                timestamp: new Date(),
            })
        })

        // Handle chat messages
        socket.on('send-message', (data) => {
            const { listId, message, user } = data
            console.log(`Message in list ${listId} from ${user.name}:`, message.message)

            // Broadcast message to all users in the list including sender
            io.to(listId).emit('new-message', {
                message,
                user,
                timestamp: new Date(),
            })
        })

        // Handle typing indicators
        socket.on('typing-start', (data) => {
            const { listId, user } = data
            socket.to(listId).emit('user-typing', {
                user,
                isTyping: true,
            })
        })

        socket.on('typing-stop', (data) => {
            const { listId, user } = data
            socket.to(listId).emit('user-typing', {
                user,
                isTyping: false,
            })
        })

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })
    })

    server.once('error', (err) => {
        console.error(err)
        process.exit(1)
    })

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
        console.log('> Socket.io server running')
    })
})
