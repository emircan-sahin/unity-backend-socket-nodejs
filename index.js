var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

const users = [
	// {
	// 	id: 'IDJSA9MiJfZe42XXAAAA',
	// username: '#2212'
	// 	coordinate: {
	// 		x: 0,
	// 		y: 0,
	// 		z: 0
	// 	},
	// rotation: {
	// 	x: 0,
	// 	y: 0,
	// 	z: 0
	// }
	// }
]

const dev = false;

let userIndex = 0;

io.on('connection', (socket) => {
	userIndex++;

	const player = {
		id: socket.id,
		username: '#' + userIndex,
		coordinate: {
			x: '' + Math.floor(Math.random(-7) * 7),
			y: '5',
			z: '' + Math.floor(Math.random(-11) * 11),
		},
		rotation: {
			x: 0,
			y: 0,
			z: 0
		}
	}

	console.log('a user connected / ' + socket.id);

	socket.emit('player', { player: player });

	socket.broadcast.emit('user connection', { user: player });

	users.push(player);

	socket.on('animation start', (data) => {
		console.log('animation start => ', data);

		/* float || trigger */
		const animationType = data.animationType || 'trigger';
		/* Örneğin, kendinde bir animasyon başlattın ve bu animasyonu herkesin görmesini istiyorsan kendi bağlantı kimliğini client tarafından gönder */
		const animationTarget = data.animationTarget;
		/* Örneğin: "Blend" */
		const animationName = data.animationName;
		/* (float) = .85 */
		const animationValue = data.animationValue;
		/* (float) = .3 */
		const animationStartTime = data.animationStartTime;

		dev ? io.emit('animation start', { animationType, animationTarget, animationName, animationValue, animationStartTime })
			: socket.broadcast.emit('animation start', { animationType, animationTarget, animationName, animationValue, animationStartTime });
	});

	socket.on('user rotation', (data) => {
		const clientUserIndex = users.findIndex(x => x.id === socket.id);
		users[clientUserIndex].rotation = data.rotation;
		dev ? io.emit("user rotation", { user: users[clientUserIndex] }) : socket.broadcast.emit("user rotation", { user: users[clientUserIndex] });
		// console.log('user rotation event => ', data, '/' + socket.id)
	});

	socket.on('user move', (data) => {
		const clientUserIndex = users.findIndex(x => x.id === socket.id);
		users[clientUserIndex].coordinate = data.coordinate;
		dev ? io.emit("user move", { user: users[clientUserIndex] }) : socket.broadcast.emit("user move", { user: users[clientUserIndex] });
		// console.log('user move coordinate => ', data, '/' + socket.id)
	});

	socket.on('users', () => {
		const userList = dev ? users : users.filter(x => x.id !== socket.id);
		console.log('users', userList);
		socket.emit('users', { 'users': userList });
	})

	socket.on('disconnect', () => {
		const removeIndex = users.findIndex(x => x.id === socket.id);
		console.log('remove user', users[removeIndex]);
		users.splice(removeIndex, 1);
		console.log('user disconnected / ' + socket.id);
		socket.broadcast.emit('user disconnect', { id: socket.id });
	});
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});