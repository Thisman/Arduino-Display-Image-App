// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs')
const serialport = require('serialport')
const {dialog} = require('electron').remote

const connetToPort = () => {
	const systemInfoBlock = document.getElementById('system-info')
	try {
		const port = new serialport('COM4', {
			baudRate: 250000
		})

		port.on('open', (err) => {
			if(err) systemInfoBlock.innerHTML = err
			else systemInfoBlock.innerHTML = 'Port COM4 connected'
		})
		return port
	} catch (error) {
		systemInfoBlock.innerHTML = error
	}
}

const parseFileData = (data) => {
	// WOW super mega cycle
	for(let i = 0; i < data.length; i++) {
		const frame = data[i]
		for(let y = 0; y < frame.length; y++) {
			const row = frame[y]
			for(let x = 0; x < row.length; x++) {
				if(typeof row[x] != 'number') throw new Error()
			}
		}
	}
}

window.nativeUtils = {
	dialog: dialog,
	port: connetToPort(),
	
	saveFile: (path, data) => {
		const fileData = JSON.stringify({data})

		try {
			fs.writeFileSync(path, fileData)
			dialog.showMessageBox({
				title: 'Arduino Image App',
				message: 'Файл сохранен'
			})
		} catch (error) {
			dialog.showMessageBox({
				title: 'Arduino Image App [Ошибка]',
				message: error.message
			})
		}
	},
	loadFile: (path, callback = f => f) => {
		try {
			const fileData = fs.readFileSync(path, 'utf8')
			const frames = JSON.parse(fileData).data

			if(!frames) return new Error()

			parseFileData(frames)

			return frames
		} catch (error) {
			dialog.showMessageBox({
				title: 'Arduino Image App [Ошибка]',
				message: error.message
			})
		}
	}
}