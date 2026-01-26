/**************************************
 * Control Buttons Component
 * Play/Step/Reset buttons for tournament control
 **************************************/
function ControlButtons(config){
	
	var self = this;
	self.slideshow = config.slideshow;
	
	// Create DOM container
	self.dom = document.createElement("div");
	self.dom.className = "object";
	
	// Play Button
	var playButton = new Button({
		x:300, y:200, text_id:"label_start", size:"short",
		onclick: function(){
			if(self.slideshow.objects.tournament.isAutoPlaying){
				publish("tournament/autoplay/stop");
			}else{
				publish("tournament/autoplay/start");
			}
		}
	});
	listen(self, "tournament/autoplay/stop",function(){
		playButton.setText("label_start");
	});
	listen(self, "tournament/autoplay/start",function(){
		playButton.setText("label_stop");
	});
	self.dom.appendChild(playButton.dom);
	
	// Step Button
	var stepButton = new Button({
		x:300, y:200+70, text_id:"label_step", message:"tournament/step", size:"short"
	});
	self.dom.appendChild(stepButton.dom);
	
	// Reset Button
	var resetButton = new Button({
		x:300, y:200+70*2, text_id:"label_reset", message:"tournament/reset", size:"short"
	});
	self.dom.appendChild(resetButton.dom);
	
	// Cleanup
	self.remove = function(){
		unlisten(self);
	};
	
	return self;
}

