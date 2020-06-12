const port = 7070;
const host = '127.0.0.1';

const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);
const {Client} = require('pg')
const moment = require('moment')

const client = new Client({
    user: "creebindooz",
    password: "Go4itall12",
    host: "localhost",
    port: 5432,
    database: "chatter"
})

app.use(express.json())

server.listen(port);
console.log("listening on port: " + port)


app.get('/', (req, res) => {
	res.send('<h1>Hello world</h1>');
	// console.log(req.headers)
});

// usernames which are currently connected to the chat
var display_names = {};

// rooms which are currently available in chat
var rooms = ['Home'];
// chats = {'Chat1':[]}
client.query("SELECT * from chat", (err,result) =>{
	console.log("What the heck?")
	if (err){
		console.log(err)
	}else{
		console.log("Rooms set to: " + result.rows)
		rooms = result.rows
	}
})

io.on('connection', (socket) => {

	socket.on('USERINIT', (data) =>{
		console.log("Name change to: " + JSON.stringify(data))

		var into = ' ('
		var values = '('
		Object.keys(data).forEach((o)=>{
			into+=o+','
			if (o.search('id') > 0){
				values += data[o] + ','
			}else{
				values += '\''+ data[o] + '\','
			}
		})
		into = into.slice(0,-1) + ')'
		values = values.slice(0,-1) + ')'
		q = "INSERT INTO consumer" + into + " VALUES " + values;
		
		console.log(q)
		client.query(q, (err,result) =>{
			if (err){
				console.log(err)
			}else{
				console.log(result)
			}
		})  
		
		socket.display_name = data.display_name
		sendUserInfo(socket,data)
		socket.emit('updaterooms', rooms);
	})
	
	socket.on('USERINFO', (data) =>{
		console.log("Name change to: " + JSON.stringify(data))

		var set = ''
		Object.keys(data).forEach((o)=>{
			set+=' ' + o+' = '
			if (o.search('id') < 0){
				set += '\''+ data[o] + '\','
			}
		})
		set = set.slice(0,-1)
		q = "UPDATE consumer SET " + set

		if (data.consumer_id){
			q +=" WHERE consumer_id = " + data.consumer_id;
		}

		console.log(q)
		client.query(q, (err,result) =>{
			if (err){
				console.log(err)
			}else{
				console.log(result)
			}
		}) 
		socket.display_name = data.display_name
		if (data.consumer_id){
			socket.consumer_id = data.consumer_id
		}
		socket.emit('updaterooms', rooms);
		sendUserInfo(socket,data)
	})

	socket.on('sendChat', function (data) {
		console.log(socket.display_name + " said to room " + socket.room + ": " + data)
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', data);
		// chats[socket.room].push(data)
		// axios.post(`http://tcp.chrisdizenzo.com:4000/sql/comment`,{ 
		// 	message: data.text,
		// 	consumer_id: data.consumer_id,
		// 	chat_id: socket.room.slice(-1)
		//  })
		//   .then(response => response.status)
		//   .catch(err => console.warn(err));
	});
	
	socket.on('switchRoom', (newroom) => {
		if (rooms.indexOf(newroom) == -1){
			console.log("Rooms is: " + rooms)
			console.log("Adding room: " + newroom)
			rooms.push(newroom)
			// chats[newroom] = []
			console.log("Rooms is now: " + rooms)
		// 	axios.post(`http://tcp.chrisdizenzo.com:4000/sql/chat`,{ 
		// 	name: newroom,
		//  })
		}
		console.log(socket.display_name + " joined room: " + newroom + " and left room " + socket.room)
		socket.leave(socket.room);
		socket.join(newroom);
		// socket.emit('updatechat' , 'Server' , 'you connected to ' + newroom)
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', {text: String(socket.display_name + " has just Joined!"), color: 'bg-blue-500', time: moment()});
		socket.emit('updaterooms', rooms);
	})

	socket.on('disconnect', function(){
		delete display_names[socket.display_name];
		// update list of users in chat, client-side
		// io.sockets.emit('updateusers', display_name);
		// echo globally that this client has left
		socket.leave(socket.room);
	});
});

sendUserInfo = function (socket,data){
	q = "SELECT * FROM consumer WHERE "
	if (data.consumer_id){
		q+= "consumer_id = " + data.consumer_id + " AND"
	}
	if (data.display_name){
		q+= "display_name = \'" + data.display_name + "\' AND"
	}
	if (data.color){
		q+= "color = \'" + data.color + "\' AND"
	}
	q = q.slice(0,-3) + "LIMIT 1"
	
	console.log(q)
	client.query(q, (err,result) =>{
		if (err){
			console.log(err)
		}else{
			console.log(result)
			// socket.emit('USERINFO',result)
		}
	})
}
