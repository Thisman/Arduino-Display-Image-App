import React from 'react'
import ReactDom from "react-dom"
import logger from "redux-logger"
import {Provider, connect} from 'react-redux'
import {createStore, applyMiddleware} from "redux"

import "./style.css"

import createReducers, {
    loadFrames,
    initFrames,
    clearFrame,
    createFrame,
    changeFrame,
    deleteFrame,
    changeCurrentFrame,
} from "./store.js"

import {transformFrameToBin} from "./utils.js"

import Button from "./components/Button/"
import TableCell from "./components/TableCell/"
import Frame from "./components/Frame/"

let enhancer = null
if('production' !== process.env.NODE_ENV)
    enhancer = applyMiddleware(logger)

const store = createStore(createReducers(), enhancer)

class App extends React.Component {
    constructor() {
        super()

        this.state = {
            frameWidth: 32,
            frameHeight: 8,
            frameInAnimation: 0,
            isAnimationInProgress: false
        }

        this.handleClick = this.handleClick.bind(this)
        this.handleSaveAsFile = this.handleSaveAsFile.bind(this)
        this.handleClearFrame = this.handleClearFrame.bind(this)
        this.handleChooseFrame = this.handleChooseFrame.bind(this)
        this.handleStopAnimation = this.handleStopAnimation.bind(this)
        this.handleStartAnimation = this.handleStartAnimation.bind(this)
        this.handleLoadFrameAsFile = this.handleLoadFrameAsFile.bind(this)
    }
    componentDidMount() {
        this.props.initFrames(
            this.state.frameWidth,
            this.state.frameHeight
        )
    }
    render() {
        const {frame, frames, currentFrame} = this.props
        const {frameInAnimation, isAnimationInProgress} = this.state

        if(!frame) return null

        return (
            <div className='app'>
                <div className='controls'>
                    <Button onClick={this.handleClearFrame}>
                        Clear
                    </Button>
                    <Button onClick={this.props.createFrame}>
                        New Frame
                    </Button>
                    <Button onClick={this.handleSaveAsFile}>
                        Save Frames as File
                    </Button>
                    <Button onClick={this.handleLoadFrameAsFile}>
                        Load Frames as File
                    </Button>
                    {frames.length &&
                        <Button onClick={this.props.deleteFrame}>
                            Delete Frame
                        </Button>
                    }
                    {!!isAnimationInProgress &&
                        <Button onClick={this.handleStopAnimation}>
                            Stop Animation
                        </Button>
                    }
                    {!isAnimationInProgress &&
                        <Button onClick={this.handleStartAnimation}>
                            Start Animation
                        </Button>
                    }
                </div>
                <div className ='table'>
                    {frame.map( (f, y) =>
                        <div className='table-row' key={y}>
                            {f.map( (c, x) =>
                                <TableCell key={x}
                                    data-x={x}
                                    data-y={y}
                                    data-is-active={!!frame[y][x]}
                                    onClick={this.handleClick}
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className='frames-list'>
                    {frames.map( (f, k) =>
                        <Frame key={k}
                            data-index={k}
                            data-is-active={currentFrame == k}
                            data-in-animation={
                                isAnimationInProgress &&
                                frameInAnimation == k
                            }
                            onClick={this.handleChooseFrame}
                        />
                    )}
                </div>
            </div>
        )
    }

    handleClick(e) {
        const target = e.currentTarget
        const x = target.getAttribute('data-x')
        const y = target.getAttribute('data-y')

        this.props.changeFrame(x, y)
    }
    handleClearFrame() {

        this.props.clearFrame()
    }
    handleChooseFrame(e) {
        const target = e.currentTarget
        const index = +target.getAttribute('data-index')

        this.props.changeCurrentFrame(index)
    }
    handleStartAnimation() {
        const {nativeUtils} = window
        const {frames} = this.props

        const animationHandler = () => {
            let {frameInAnimation, isAnimationInProgress} = this.state
            const frame = frames[frameInAnimation]
            let timeout;

            nativeUtils.port.write(transformFrameToBin(frame), () => {
                frameInAnimation++
                if(frameInAnimation >= frames.length)
                    frameInAnimation = 0
                
                if(!isAnimationInProgress)
                    return clearTimeout(timeout)

                timeout = setTimeout(() => {
                    this.setState({frameInAnimation})
                    animationHandler()
                }, 250)
            })
        }

        this.setState({isAnimationInProgress: true}, animationHandler)
    }
    handleStopAnimation() {
        this.setState({
            isAnimationInProgress: false,
            frameInAnimation: 0
        })
    }
    handleSaveAsFile() {
        const {nativeUtils} = window
        const {frames} = this.props
        
        const pathToSave = nativeUtils.dialog.showSaveDialog()

        if(!pathToSave) return

        nativeUtils.saveFile(pathToSave, frames)
    }
    handleLoadFrameAsFile() {
        const {nativeUtils} = window
        
        const pathToLoad = nativeUtils.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: 'Frames', extensions: ['json']}],
        })

        if(!pathToLoad) return

        const framesFromFile = nativeUtils.loadFile(pathToLoad[0])

        if(!framesFromFile) return

        this.props.loadFrames(framesFromFile)
    }
}

const maptStateToProps = ({gifMaker}) => ({
    frames: gifMaker.frames,
    currentFrame: gifMaker.currentFrame,
    frame: gifMaker.frames[gifMaker.currentFrame],
})
const mapDispatchToProps = dispatch => ({
    initFrames: (...args) => dispatch(initFrames(...args)),
    loadFrames: (...args) => dispatch(loadFrames(...args)),
    clearFrame: (...args) => dispatch(clearFrame(...args)),
    changeFrame: (...args) => dispatch(changeFrame(...args)),
    deleteFrame: (...args) => dispatch(deleteFrame(...args)),
    createFrame: (...args) => dispatch(createFrame(...args)),
    changeCurrentFrame: (...args) => dispatch(changeCurrentFrame(...args)),
})
const ConnectedApp = connect(maptStateToProps, mapDispatchToProps)(App)

ReactDom.render(
    <Provider store={store}>
        <ConnectedApp />
    </Provider>,
    document.getElementById('root')
)
