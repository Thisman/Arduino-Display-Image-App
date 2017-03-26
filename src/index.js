// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import React from 'react'
import ReactDom from "react-dom"
import logger from "redux-logger"
import {Provider, connect} from 'react-redux'
import {createStore, applyMiddleware} from "redux"

import "./style.css"

import createReducers, {
    initFrames,
    clearFrame,
    createFrame,
    changeFrame,
    deleteFrame,
    changeCurrentFrame,
} from "./store.js"

import {transformFrameToBin} from "./utils.js"

let enhancer = null
if('production' !== process.env.NODE_ENV)
    enhancer = applyMiddleware(logger)

const store = createStore(createReducers(), enhancer)

class Cell extends React.Component {
    shouldComponentUpdate(props) {
        return this.props['data-is-active'] != props['data-is-active']
    }
    render() {
        return (
            <div className='table-cell'
                {...this.props}
            />
        )
    }
}

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
        this.handleSendFrame = this.handleSendFrame.bind(this)
        this.handleClearFrame = this.handleClearFrame.bind(this)
        this.handleChooseFrame = this.handleChooseFrame.bind(this)
        this.handleStopAnimation = this.handleStopAnimation.bind(this)
        this.handleStartAnimation = this.handleStartAnimation.bind(this)
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
                    <button className='button' onClick={this.handleSendFrame}>
                        Send
                    </button>
                    <button className='button' onClick={this.handleClearFrame}>
                        Clear
                    </button>
                    <button className='button' onClick={this.props.createFrame}>
                        New Frame
                    </button>
                    {frames.length &&
                        <button className='button' onClick={this.props.deleteFrame}>
                            Delete Frame
                        </button>
                    }
                    {!!isAnimationInProgress &&
                        <button className='button' onClick={this.handleStopAnimation}>
                            Stop Animation
                        </button>
                    }
                    {!isAnimationInProgress &&
                        <button className='button' onClick={this.handleStartAnimation}>
                            Start Animation
                        </button>
                    }
                </div>
                <div className ='table'>
                    {frame.map( (f, y) =>
                        <div className='table-row' key={y}>
                            {f.map( (c, x) =>
                                <Cell key={x}
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
                        <div key={k}
                            data-index={k}
                            className='saved-frame'
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
    handleSendFrame() {
        const {serialport} = window
        const {frameWidth} = this.state
        const {frame} = this.props

        serialport.port.write(
            transformFrameToBin(frame),
            function() {}
        )
    }
    handleChooseFrame(e) {
        const target = e.currentTarget
        const index = +target.getAttribute('data-index')

        this.props.changeCurrentFrame(index)
    }
    handleStartAnimation() {

        const {frames} = this.props

        const animationHandler = () => {
            let {frameInAnimation, isAnimationInProgress} = this.state
            const frame = frames[frameInAnimation]

            serialport.port.write(transformFrameToBin(frame), () => {
                frameInAnimation++
                if(frameInAnimation >= frames.length)
                    frameInAnimation = 0
                
                if(!isAnimationInProgress) return
                setTimeout(() => {
                    this.setState({frameInAnimation})
                    animationHandler()
                }, 500)
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
}

const maptStateToProps = ({gifMaker}) => ({
    frames: gifMaker.frames,
    currentFrame: gifMaker.currentFrame,
    frame: gifMaker.frames[gifMaker.currentFrame],
})
const mapDispatchToProps = dispatch => ({
    initFrames: (...args) => dispatch(initFrames(...args)),
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
