export const transformFrameToBin = (frame) => {
	const rowsLength = frame.length 
	const columnsLength = frame[0].length
	let binStr = ''

	for(let y = rowsLength - 1; y >= 0; y--) {
		for(let x = 0; x < columnsLength; x++)
			binStr += frame[y][x].toString()
	}

	return binStr
}