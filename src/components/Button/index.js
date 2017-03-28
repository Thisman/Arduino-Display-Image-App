import React from "react"

export default class Button extends React.PureComponent {
	render() {
		return (
			<button {...this.props} className='button'>
				{this.props.children}
			</button>
		)
	}
}