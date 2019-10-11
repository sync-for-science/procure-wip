const express = require('express');
const app = express();
const cors = require("cors");
const aws = require("aws-sdk");

// Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file or env vars
// IAM config for this user must support PUT to the S3 bucket specified in config.
require('dotenv').config();

const config = {
	port: 8000,
	name: "Test research project",
	destinationDir: "uploads",
	infoUrl: "http://google.com",
	successMessage: "Thank you - your information has been transmitted!",

	//requires an AWS bucket with CORS enabled
	bucket: "procure-test1",

	expires: 60*60 //one hour

	// continueLabel: "Link records with your account" ,
	// continueUrl:  "http://google.com"
};

const s3 = new aws.S3({signatureVersion: 'v4'});

app.use(cors());

app.get("/manifest/:userid", (req, res) => {
	const fileName = req.params.userid + "-" + (new Date()).getTime() + ".zip";
	const params = {
		Bucket: config.bucket,
		Key: fileName,
		ContentType: "application/zip",
		Expires: config.expires
	};
	s3.getSignedUrl("putObject", params, (error, uploadUrl) => {
		if (error) {
			console.log(error)
			res.status(500).send("An error occurred generating a signed url.")
		} else {
			res.send({
				name: config.name,
				uploadUrl: uploadUrl,
				infoUrl: config.infoUrl,
				continueLabel: config.continueLabel,
				continueUrl: config.continueUrl,
				successMessage: config.successMessage
			})
		}
	});
})
 
app.listen(config.port, () => console.log(`Upload server listening on port ${config.port}!`))