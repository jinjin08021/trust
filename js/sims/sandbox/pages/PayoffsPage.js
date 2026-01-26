/**************************************
 * Payoffs Page Component
 * Manages payoff matrix settings
 **************************************/
function PayoffsPage(config){
	
	var self = this;
	self.slideshow = config.slideshow;
	
	// Create DOM
	self.dom = document.createElement("div");
	self.dom.className = "sandbox_page";
	
	// Labels
	self.dom.appendChild(_makeLabel("sandbox_payoffs", {x:0, y:0, w:433}));
	
	// PAYOFFS
	var payoffsUI = new PayoffsUI({x:84, y:41, scale:0.9, slideshow:self.slideshow});
	self.dom.appendChild(payoffsUI.dom);
	
	// Reset
	var resetPayoffs = new Button({
		x:240, y:300, text_id:"sandbox_reset_payoffs",
		message:"pd/defaultPayoffs"
	});
	self.dom.appendChild(resetPayoffs.dom);
	
	// Store reference for cleanup
	self.payoffsUI = payoffsUI;
	
	// Cleanup
	self.remove = function(){
		if(self.payoffsUI && self.payoffsUI.remove){
			self.payoffsUI.remove();
		}
	};
	
	return self;
}

