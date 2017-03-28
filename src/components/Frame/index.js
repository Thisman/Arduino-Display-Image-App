import React from "react"

export default class Frame extends React.PureComponent {
	render() {
		return (
	        <div {...this.props} className='saved-frame' />
		)
	}
}