import { observer } from "mobx-react-lite";

const CommandSpace = observer(function CommandSpace() {
	return (<div>
		<input type="text" placeholder="intent" style={{
			"width" : "50%",
			"border": "2px solid",
			"margin": "10px",
			"padding": "5px",
		}}>

		</input>
	</div>);
});

export default CommandSpace;