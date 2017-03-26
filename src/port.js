const serialport = require('serialport')

const connetToPort = () => {
	const systemInfoBlock = document.getElementById('system-info')
	try {
		const port = new serialport('COM4', {
			baudRate: 115200
		})

		port.on('open', (err) => {
			if(err) systemInfoBlock.innerHTML = err
			else systemInfoBlock.innerHTML = 'Порт COM4 подключен'
		})
		return port
	} catch (error) {
		systemInfoBlock.innerHTML = error
	}
}

window.serialport = {
	static: serialport,
	port: connetToPort(),
}