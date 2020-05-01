'use strict';

var {execFileSync} = require('child_process');
var {readFileSync, writeFileSync} = require('fs');

// closing node when parent process is killed
process.stdin.resume();
process.stdin.on('end', () => process.exit());

function observe(message, push, done) {
	let close;
	const exception = e => {
		push({
			type: 'exception',
			error: e.message
		});
		close();
	};
	close = () => {
		process.removeListener('uncaughtException', exception);
		done();
		close = () => {};
	};
	process.addListener('uncaughtException', exception);

	if(message.type === 'native_client_available'){
		let message = {type: 'native_client_available'};
		push(message);
		close();
	}
	else if(message.type === 'get_available_dms') {
		//todo: sanitize user input if possible
		let availableDMs = [];
		execFileSync("FlashGot.exe", ['-o', 'availableDMs']);
		let file = readFileSync('availableDMs', {encoding: 'utf8', flag: 'r'});
		let lines = file.split('\n');
		for(let line of lines){
			if(line.indexOf('|OK') !== -1){
				let DMName = line.split("|")[0].trim();
				availableDMs.push(DMName);
			}
		}
		let message = {type: 'available_dms', availableDMs: availableDMs};
		push(message);
		close();
	}
	else if (message.type === 'download'){
		let url = message.url;
		let referer = message.referer || '';
		let cookies = message.cookies || '';
		let dmName = message.dmName;
		let filename = message.filename;
		let postData = message.postData || '';

		let header = `1;${dmName};0;;`;
		let job = header + "\n"
					+ referer + "\n"
					+ url + "\n"
					+ filename + "\n"
					+ cookies + "\n"
					+ postData + "\n";
		writeFileSync("flashgot.fgt", job, {encoding: 'utf8'});
		execFileSync("flashgot.exe", ['flashgot.fgt']);
	}
	else{
		push({type: 'unsupported'});
		close();
	}
}
/* message passing */
var nativeMessage = require('./messaging');
process.stdin
	.pipe(new nativeMessage.Input())
	.pipe(new nativeMessage.Transform(observe))
	.pipe(new nativeMessage.Output())
	.pipe(process.stdout);