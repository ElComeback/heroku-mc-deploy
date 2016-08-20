request = require('request').defaults({ 'auth': { 'bearer': process.env.DROPBOX_API_TOKEN } });
fs = require('fs');
archiver = require('archiver');

// MAIN
process.on('SIGTERM', () => {
	console.log('uploading');
  uploadWorld();
  process.exit(0);
});

setInterval(uploadWorld, 4 * 3600 * 1000); // 4 hours

// FUNCTIONS
function uploadWorld() {
	output = getUploadStream('/world.zip');
	archive = archiver('zip');
	archive.on('error', err => {throw err;});
	archive.pipe(output);
	archive.directory('world', '');
	archive.finalize();
}

function getUploadStream(path) {
	callback = function (error, response, body) {
		if(error || response.statusCode != 200) {
			console.log(response.statusCode);
			console.log(body);
		} else {
			console.log(`file successfully uploaded: ${path}`);
		}
	};
	return request.post({
		url: 'https://content.dropboxapi.com/2/files/upload',
		headers: {
			'Dropbox-API-Arg': JSON.stringify({
				'path': path,
				'autorename': false,
				'mute': true,
				'mode': {'.tag':'overwrite'}
			}),
			'Content-Type': 'application/octet-stream'
		}
	}, callback);
}