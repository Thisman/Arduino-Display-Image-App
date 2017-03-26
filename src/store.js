import {combineReducers} from 'redux'

const INIT_FRAMES = 'INIT_FRAMES'
const CLEAR_FRAME = 'CLEAR_FRAME'
const CREATE_FRAME = 'CREATE_FRAME'
const CHANGE_FRAME = 'CHANGE_FRAME'
const DELETE_FRAME = 'DELETE_FRAME'
const CHANGE_CURRENT_FRAME = 'CHANGE_CURRENT_FRAME'

const createEmptyFrame = (width, height) => {
    const frame = []
    for(let y = 0; y < height; y++) {
        frame[y] = []
        for(let x = 0; x < width; x++)
            frame[y][x] = 0
    }

    return frame
}

const initialState = {
    frames: [],
    frame: [],
    currentFrame: 0,
    width: 0,
    height: 0,
}

function gifMaker(state = initialState, action) {
    const {type, payload} = action

    switch (type) {
        case INIT_FRAMES: {
            const {frames} = state
            const {width, height} = payload
            const newFrame = createEmptyFrame(width, height)

            frames.push(newFrame)

            return {
                ...state,
                width,
                height,
                frames,
            }
        }
        case CREATE_FRAME: {
            let {currentFrame} = state
            const {width, height, frames} = state
            const newFrame = createEmptyFrame(width, height)
            
            frames.push(newFrame)
            currentFrame = frames.length - 1

            return {
                ...state,
                frames,
                currentFrame,
            }
        }
        case CLEAR_FRAME: {
            const {frames, width, height, currentFrame} = state
            frames[currentFrame] = createEmptyFrame(width, height)

            return {
                ...state,
                frames: [...frames]
            }
        }
        case CHANGE_FRAME: {
            /**
            *   Начало координата с левого нижнего угла
            */
            const {currentFrame, frames} = state
            const {x, y} = payload
            const frame = [...frames[currentFrame]]
            const frameRow = [...frame[y]]

            frameRow[x] = +!frame[y][x]
            frame[y] = frameRow
            frames[currentFrame] = frame

            return {
                ...state,
                frames: [...frames]
            }
            return state
        }
        case CHANGE_CURRENT_FRAME: {
            const {index} = payload
            const frame = state.frames[index]

            return {
                ...state,
                currentFrame: index,
                frame: [...frame]
            }
        }
        case DELETE_FRAME: {
            let {currentFrame, frames} = state
            if(frames.length == 1) return state

            const newFrames = [
                ...frames.slice(0, currentFrame),
                ...frames.slice(currentFrame + 1),
            ]

            currentFrame--
            if(currentFrame < 0) currentFrame = 0

            return {
                ...state,
                currentFrame,
                frames: newFrames
            }
        }
        default: return state
    }
}


export default function createReducers() {
    return combineReducers({gifMaker})
}

export const initFrames = (width, height) => ({
    type: INIT_FRAMES,
    payload: {width, height}
})
export const createFrame = () => ({
    type: CREATE_FRAME
})
export const clearFrame = () => ({
    type: CLEAR_FRAME
})
export const changeFrame = (x, y) => ({
    type: CHANGE_FRAME,
    payload: {x, y}
})
export const deleteFrame = () => ({
    type: DELETE_FRAME
})
export const changeCurrentFrame = (index) => ({
    type: CHANGE_CURRENT_FRAME,
    payload: {index}
})