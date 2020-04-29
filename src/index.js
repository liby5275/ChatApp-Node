const path = require('path')
const http = require('http')
const express = require('express')
const socket = require('socket.io')
const userDependency = require('./user')
const roomDependency = require('./room')


const app = express()
const httpserver = http.createServer(app)
const io = socket(httpserver)

const dynamicPath = path.join(__dirname, '../public')
app.use(express.static(dynamicPath))


io.on('connect', (socket) => {

    let username = ''
    let userroom = ''

    socket.emit('message', 'Welcome to the Chat App')

    socket.on('joined', async ({ name, room }, callback) => {
        const _id = socket.id

        console.log('                            ')
        console.log('                            ')
        console.log('                            ')
        console.log('INCOMIGN REQ WITH ' + name + ' AND ' + room)
        const isLocked = roomDependency.isRoomLocked(room)
        if (isLocked) {
            console.log('room is locked now ' + room)
            socket.emit('warning', 'this room is locked by the user. create new room')
        } else {
            console.log('room is not locked ' + room)
            await userDependency.isUsernameAlreadyTaken(name, room, async (istaken) => {
                if (istaken) {
                    socket.emit('warning', 'name already taken in this room!. take another one')
                } else {
                    console.log('combo is not taken already')
                    //room is not locked. username is not taken inside the room. So good to go
                    username = name
                    userroom = room
                    await userDependency.addUser(username, userroom, _id)
                    await roomDependency.addRoom(room)
                    socket.join(room)
                    socket.broadcast.to(room).emit('joinmessage', name)
                    callback('delivered')

                    //emit to list the users under this room
                    io.to(room).emit('userlist', {
                        room: room,
                        userList: userDependency.getUsersInaRoom(room)
                    })

                    socket.emit('joincompleted', name)
                }
            })
        }

    })

    socket.on('location', (coords, callback) => {
        socket.join(userroom)
        io.to(userroom).emit('coords', coords.latitude, coords.longitude, username)
        callback()
    })


    socket.on('messageFromUser', messageText => {
        const time = new Date().getTime()
        socket.join(userroom)
        io.to(userroom).emit('messageFromUser', messageText, time, username)
    })

    socket.on('disconnect', () => {
        const _id = socket.id
        console.log('disconnecting id is ' + username)
        userDependency.removeUser(_id)
        const countOfusersInthisroom = userDependency.findCountOfUsersInaRoom(userroom)
        console.log('count of users in this room is ' + countOfusersInthisroom)
        if (countOfusersInthisroom < 1) {
            //remove room
            console.log('about to remove the room ' + userroom)
            roomDependency.removeRoom(userroom)
        }
        roomDependency.getRoomList()
        socket.join(userroom)
        io.to(userroom).emit('disconnect', username)
        io.to(userroom).emit('userlist', {
            room: userroom,
            userList: userDependency.getUsersInaRoom(userroom)
        })
    })

    socket.on('lock', () => {
        const _id = socket.id
        //const roomname = userDependency.fetchUser(_id)// same canbe acheived by simply taking 'userroom'
        roomDependency.lockRoom(userroom)
        socket.join(userroom)
        io.to(userroom).emit('lockedthegroup')
    })


})

const port = process.env.PORT || 3000
httpserver.listen(port, () => {
    console.log('port started')
})