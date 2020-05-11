var ContextMenu = {

	menuParentId : 'download.grab.menu.parent',
	menuGrabAllId : 'download.grab.menu.graball',
	menuGrabSelectionId : 'download.grab.menu.grabselection',

	/**
	 * @type {DlGrabApp}
	 */
	app: undefined,

	createMenus: function(app){

		this.app = app;

		//add parent menu item
		browser.menus.create({
			id: this.menuParentId,
			title: "Download Grab", 
			contexts: ["all"],
		});

		//add grab all menu
		browser.menus.create({
			id: this.menuGrabAllId,
			title: "Grab All",
			contexts: ["all"],
			parentId: this.menuParentId
		});

		//add grab selection menu
		browser.menus.create({
			id: this.menuGrabSelectionId,
			title: "Grab Selection",
			contexts: ["selection"],
			parentId: this.menuParentId
		});

		//menu click listener
		browser.menus.onClicked.addListener(doOnMenuClicked);

		/**
		 * Runs every time a menu item is clicked
		 * Links in selection are extracted using code by: https://github.com/c-yan/open-selected-links
		 */
		async function doOnMenuClicked(info, tab){

			let defaultDM = ContextMenu.app.options.defaultDM || ContextMenu.app.runtime.availableDMs[0];

			if(!defaultDM){
				//todo: show notification?
				console.log('no download managers are available');
				return;
			}

			if(info.menuItemId == ContextMenu.menuGrabAllId){
				let result = await browser.tabs.executeScript({file: 'scripts/get_all_links.js'});
				downloadLinks(result[0]);
			}
			else if(info.menuItemId == ContextMenu.menuGrabSelectionId){
				let result = await browser.tabs.executeScript({file: 'scripts/get_selection_links.js'});
				downloadLinks(result[0]);
			}

			function downloadLinks(result){
				let links = result.links;
				let originPageUrl = result.originPageUrl;
				let originPageDomain = result.originPageDomain;
				let originPageReferer = result.originPageReferer;
				NativeUtils.downloadMultiple(
					defaultDM,
					links,
					originPageUrl,
					originPageReferer,
					originPageDomain
				);
			}
		}

	}
}