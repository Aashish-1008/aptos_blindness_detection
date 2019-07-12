var fs = require("fs"),
	csv = require('csvtojson'),
	request = require('request');

var localPath = "./data/train.csv";

var validCount = 0,
	inValidCount = 0;

var request_data = {
	url: "http://dev-api.skyl.ai/api/organisations/aed9f2/projects/47c513/data-sets/b25911/collect-form-data",
	project_id: "47c513",
	project_access_token: "XXXXXXXX-XXXX-XXXX-XXXXX-eb57XXXXXXXX"
};


function uploadDataToSkyl(imageFileLocation, category) {
	return new Promise(function(resolve, reject) {
		var formData = {
			category: category,
			image: fs.createReadStream(imageFileLocation)
		};

		request.post({
			url: request_data.url,
			formData: formData,
			headers: {
				project_id: request_data.project_id,
				project_access_token: request_data.project_access_token
			},
		}, function optionalCallback(err, httpResponse, body) {
			if (err) {
				console.log(err)
				return reject(err);
			} else {
				console.log(body)
				return resolve(body)
			}
		});

	});
}

csv({
	noheader: false
}).fromStream(fs.createReadStream(localPath)).subscribe((json) => {
	return new Promise((resolve, reject) => {
		var imageFileLocation = "./images/",
			category;
		if (json["diagnosis"] == 0)
			category = "No_DR"
		else if (json["diagnosis"] == 1)
			category = "Mild"
		else if (json["diagnosis"] == 2)
			category = "Moderate"
		else if (json["diagnosis"] == 3)
			category = "Severe"
		else if (json["diagnosis"] == 4)
			category = "Proliferative_DR"

		imageFileLocation = imageFileLocation + json["id_code"] + ".png"
		uploadDataToSkyl(imageFileLocation, category).then(function(skylResponse) {
			return resolve(json)
		}).catch(function(err) {
			return reject(err)
		})

	});
}, function(err) {
	console.log(err)
}, function(completedObj) {
	console.log("DONE.")
});