import React from "react";
import {Spinner} from 'reactstrap';

export default () => {

	return <div className="text-center" style={{margin:"3rem"}}>
		<Spinner style={{ width:"3rem", height:"3rem", margin:"1rem"}} />
		<h4>Loading</h4>
	</div>

}