var slideshow, slideSelect;
window.onload = function(){

	// PRELOADER
	Q.all([
		Loader.loadAssets(Loader.manifestPreload),
		Words.convert("words.html")
	]).then(function(){

		// CHANGE DOM
		document.body.removeChild($("#preloader"));
		$("#main").style.display = "block";
		// Footer removed - no bottom panel needed

		// Slideshow
		slideshow = new Slideshow({
			dom: $("#slideshow"),
			slides: SLIDES
		});

		// Slide Select removed - only one slide (sandbox)

		// LOAD REAL THINGS
		Loader.loadAssets(
			Loader.manifest,
			function(){
				// After all assets are loaded, go directly to sandbox
				// Navigate directly to sandbox immediately
				publish("slideshow/goto", ["sandbox"]);
			},
			function(ratio){
				publish("preloader/progress", [ratio]);
			}
		);

		// Don't show any slide until assets are loaded, then go directly to sandbox
		// slideshow.nextSlide(); // Removed - we go directly to sandbox after loading

	});

};