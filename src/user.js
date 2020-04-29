var userList = []

const addUser = (name, room, id) => {
    console.log('adding user to the list '+name)
    const user = { id, name, room }
    userList.push(user)
}


const removeUser = (id) => {

    const tempUserList = userList.filter((user) => {
        return id != user.id
    })
    userList = tempUserList
}

const fetchUser = function(id) {
    let roomname  =''
    userList.forEach(user => {
        if(user.id === id){
            console.log(user)  
            roomname = user.room
        } 
    })
    return roomname
}

const fetchUSerList = () => {
    userList.forEach(user => {
        console.log(user.id + ' ' + user.name + ' ' + user.room)
    })
}

const isUsernameAlreadyTaken = function (name, room, callbacknameValidation) {
    console.log('about to check if user already taken for '+name+' and '+room)

    userList.forEach(user=>{
        if(user.name === name && user.room === room){
            console.log('this combo is taken alrady')
            callbacknameValidation(true)
        }
    })
    
        callbacknameValidation(false)
    
}

const findCountOfUsersInaRoom = (room)=>{
    let count =0;
    userList.forEach(user=>{
        if(user.room === room){
            count = count + 1
        }
    })
    return count;
}

const getUsersInaRoom = function (room){
    const userListTemp = []
    userList.forEach(userObj=>{
        if(userObj.room === room){
            userListTemp.push(userObj)
        }
    })
    return userListTemp
}



module.exports = {
    isUsernameAlreadyTaken: isUsernameAlreadyTaken,
    addUser: addUser,
    removeUser: removeUser,
    fetchUser: fetchUser,
    fetchUSerList: fetchUSerList,
    findCountOfUsersInaRoom:findCountOfUsersInaRoom,
    getUsersInaRoom:getUsersInaRoom
}