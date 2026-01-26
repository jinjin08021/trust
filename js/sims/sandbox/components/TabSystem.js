/**************************************
 * Tab System Component
 * Manages tabs and page navigation
 **************************************/
function TabSystem(config){
	
	var self = this;
	self.pages = config.pages || []; // Array of page objects with {label, page} structure
	
	// Create DOM
	self.dom = document.createElement("div");
	self.dom.id = "sandbox_tabs";
	
	// Tab Hitboxes
	var hitboxes = [];
	var MAX_TABS_WIDTH = 500; // Match sandbox page width
	var TAB_COUNT = self.pages.length;
	var INACTIVE_TAB_WIDTH = Math.floor((MAX_TABS_WIDTH - 2) / TAB_COUNT); // -2 for borders
	
	var currentTabX = 0;
	var _makeHitbox = function(label, pageIndex){
		label = label.toUpperCase();
		
		var hitbox = document.createElement("div");
		hitbox.className = "hitbox";
		hitbox.innerHTML = label;
		self.dom.appendChild(hitbox);
		hitboxes.push(hitbox);
		
		// Inactive tabs have fixed smaller width
		// Active tab will expand to show full text
		var tabWidth = INACTIVE_TAB_WIDTH;
		
		hitbox.style.width = tabWidth + "px";
		hitbox.style.left = currentTabX + "px";
		
		// Next tab starts right after this one (no gap)
		currentTabX += tabWidth;
		
		(function(pageIndex, hitboxElement){
			hitboxElement.onclick = function(){
				self.goToPage(pageIndex);
			};
		})(pageIndex, hitbox);
	};
	
	// Create hitboxes for each page
	for(var i=0; i<self.pages.length; i++){
		_makeHitbox(self.pages[i].label, i);
	}
	
	// Append page DOMs directly (they already have sandbox_page class)
	var pageContainers = [];
	for(var i=0; i<self.pages.length; i++){
		// Pages already have the sandbox_page class, append directly
		self.dom.appendChild(self.pages[i].page.dom);
		pageContainers.push(self.pages[i].page.dom);
	}
	
	// Go To Page
	self.goToPage = function(showIndex){
		// Calculate width for active tab (full text)
		var activeLabel = hitboxes[showIndex].innerHTML;
		var tempMeasure = document.createElement("div");
		tempMeasure.style.cssText = "position:absolute; visibility:hidden; font-size:18px; padding:0 12px; white-space:nowrap;";
		tempMeasure.innerHTML = activeLabel;
		document.body.appendChild(tempMeasure);
		var activeTextWidth = tempMeasure.offsetWidth;
		document.body.removeChild(tempMeasure);
		var activeTabWidth = activeTextWidth + 24 + 2; // padding + border
		
		// Calculate remaining width for inactive tabs
		var remainingWidth = MAX_TABS_WIDTH - activeTabWidth - 2; // -2 for borders
		var inactiveTabWidth = Math.floor(remainingWidth / (TAB_COUNT - 1));
		
		// Update tab widths and styling
		var currentX = 0;
		for(var i=0; i<hitboxes.length; i++){
			if(i === showIndex){
				hitboxes[i].classList.add("active");
				hitboxes[i].style.width = activeTabWidth + "px";
			} else {
				hitboxes[i].classList.remove("active");
				hitboxes[i].style.width = inactiveTabWidth + "px";
			}
			hitboxes[i].style.left = currentX + "px";
			currentX += parseInt(hitboxes[i].style.width);
		}
		
		// Show page
		for(var i=0; i<pageContainers.length; i++){
			pageContainers[i].style.display = (i === showIndex) ? "block" : "none";
		}
	};
	
	// Initialize to first page
	self.goToPage(0);
	
	return self;
}

