const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const config = {
	port: 8000,
	speed: 3000,
	destinationDir: "uploaded_files",
	name: "Test research project",
	infoUrl: "http://google.com",
	successMessage: "Thank you - your information has been transmitted!",
	continueLabel: "Return to research portal",
	continueUrl:  "http://google.com"
};

app.use(cors());

app.get("/manifest/:userid", (req, res) => {
	const fileName = req.params.userid + "-" + (new Date()).getTime() + ".zip";
	const uploadUrl = req.protocol + '://' + req.get('host') + "/" + fileName;
	res.send({
		name: config.name,
		uploadUrl: uploadUrl,
		infoUrl: config.infoUrl,
		continueLabel: config.continueLabel,
		continueUrl: config.continueUrl,
		successMessage: config.successMessage
	})
})
 
app.put("/:fileName", bodyParser.raw({inflate:false, limit: "5mb"}), (req, res) => {
	const filePath = path.join(__dirname, config.destinationDir, req.params.fileName)
	fs.writeFile(filePath, req.body, "binary", (err) => {
		if (err) {
			console.log(err)
			res.status(500).send("An error occurred saving the file on the server.")
		} else {
			console.log(`Saved upload to ${filePath}`)
			setTimeout( () => {
				res.sendStatus(200);

			}, config.speed);
		}
	});
});

app.listen(config.port, () => console.log(`Upload server listening on port ${config.port}!`))