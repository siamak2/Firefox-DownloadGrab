'use strict';

//todo: unicode in headers (content-disposition) is not supported by firefox
//todo: report:  If you send a file to FDM[3] then the filename will be empty, but it'll appear in comments, but that just how FlashGot worked, so I don't know if consider it as a bug or not.
//todo: add context menu for image/audio/video elements
//todo: Grab selection shouldn't appear in context menu when only a simple text is selected
//todo: option to only keep download history of current tab
//todo: add private browsing downloads to a separate list
//todo: optimize filters order
//todo: show grab reason only in debug
//todo: remove unnecessary DEBUG conditions
//todo: add option to download everything with DM if forcedownload is '*'

var DEBUG = true;

(async () => {

	console.log('initializing app...');

	try{
		let options = await browser.storage.local.get(defaultOptions);
		let app = new DlGrabApp(options);
		await DG.NativeUtils.initialize();
		app.runtime.availableDMs = await DG.NativeUtils.getAvailableDMs();
		DG.Messaging.initialize(app);
		DG.RequestHandling.initialize(app);
		DG.ContextMenu.initialize(app);
		console.log('app init successful');
	}catch(e){
		console.log('app could not be initialized: ', e);
		//todo: remove notifications or make them look good
		let options = {
			type: "basic", 
			title: "Download Grab", 
			message: "ERROR: initialization failed\nReason: " + e.toString(),
		};
		browser.notifications.create(options);		
		return;
	}

})();