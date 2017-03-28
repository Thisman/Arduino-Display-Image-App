import React from "react"

export default class Cell extends React.Component {
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