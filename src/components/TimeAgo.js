import React from "react";
import {format} from "timeago.js";

export default class TimeAgo extends React.Component {

	constructor(props) {
		super(props);
		this.state= {timeAgo: format(this.props.time)}
	}

	componentDidMount() {
		this.interval = setInterval(() => {
		this.setState({timeAgo: format(this.props.time)});
		}, (this.props.refreshMinutes||1)*60000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		return this.state.timeAgo
	}

}