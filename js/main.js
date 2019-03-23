var SliderJs = {
	b_main_slider: '.js-main-slider',
	class_init_slider: 'has-init-slider',
	init: function () {
		SliderJs.initMainSlick();
	},
	initMainSlick: function () {

		$(this.b_main_slider).on('init', function(event, slick, direction){
			$(this).addClass(SliderJs.class_init_slider);
		});

		$(this.b_main_slider).slick({
			speed: 2000,
			slidesToShow: 1,
			slidesToSlide: 1,
			autoplay: true,
			autoplaySpeed: 6000,
			arrows: false,
			adaptiveHeight: true,
			asNavFor: '.slider-nav'
		});

		$('.slider-nav').on('init', function(event, slick, direction){
			$(this).addClass(SliderJs.class_init_slider);
		});

		$('.slider-nav').slick({
			slidesToShow: 5,
			slidesToScroll: 1,
			vertical: true,
			asNavFor: '.js-main-slider',
			arrows: false,
			focusOnSelect: true
		});
	}
};

var MainJS = {
	init: function(){

		var wow = new WOW(
			{
				boxClass:        'wow',      // animated element css class (default is wow)
				mobile:          true,       // trigger animations on mobile devices (default is true)
				live:            true,       // act on asynchronously loaded content (default is true)
				callback:        brushEffect,
				scrollContainer: null,    // optional scroll container selector, otherwise use window,
				resetAnimation:  true,     // reset animation on end (default is true)
			}
		);
		wow.init();

		$(document).on('click', '.b-main-nav__link', function(e){
			var dest = $(this).attr("href");

			e.preventDefault();

			$("html, body").stop().animate({
				'scrollTop': $(dest).offset().top
			}, 2000);

		});

	}
}



$(document).ready(function(){
	MainJS.init();
	SliderJs.init();
});


class Canvas {
	constructor (canvas = null) {
		this.canvas = (canvas) ? canvas : document.createElement('canvas')
		this.context = this.canvas.getContext('2d')
		this.context.fillStyle = "#9ea7b8";
	}

	setSize (width = window.innerWidth, height = window.innerHeight) {
		this.canvas.width = width
		this.canvas.height = height
	}

	appendTo (domElement) {
		domElement.appendChild(this.canvas)
	}
}

const imageLoadToPromise = (image) => {
	return new Promise((resolve) => {
		image.onload = () => {
			resolve()
		}
	});
}

class ClippingBrushImage {
	constructor (canvas, imageUrl, pathId, brushUrl) {
		this.pathId = pathId

		// clipping Canvas
		this.svgViewBox = document.getElementById(this.pathId).parentNode.viewBox.baseVal
		this.clippingCanvas = new Canvas()
		this.clippingCanvas.appendTo(document.body)

		// rendering Canvas
		this.renderingCanvas = new Canvas(canvas)

		// load image
		this.image = new Image()
		this.image.crossOrigin = 'Anonymous'

		// load brush
		this.brush = new Image()

		Promise.all([imageLoadToPromise(this.image), imageLoadToPromise(this.brush)]).then(this.onImageLoad.bind(this))

		this.image.src = imageUrl
		this.brush.src = brushUrl
	}

	onImageLoad () {
		this.clippingCanvas.setSize(this.svgViewBox.width * 2 + this.brush.width, this.svgViewBox.height * 2 + this.brush.height)
		this.renderingCanvas.setSize(this.image.width, this.image.height)
		this.animateBrush()
	}

	animateBrush () {
		let bezierData = MorphSVGPlugin.pathDataToBezier(`#${this.pathId}`)
		let brushPosition = {}
		TweenMax.to(brushPosition, 3, {
			bezier: {
				values: bezierData, 
				type: "cubic"
			},
			ease: Power2.easeInOut,
			onUpdate: () => {
				this.drawBrush(brushPosition.x * 2, brushPosition.y * 2)
				this.draw()
			}
		});
	}

	drawBrush (x, y) {
		const { context: ctx } = this.clippingCanvas
		ctx.drawImage(this.brush, x, y)
	}

	draw () {
		const { context: ctx } = this.renderingCanvas

		const positionX = this.renderingCanvas.canvas.width / 2 - this.image.width / 2
		const positionY = this.renderingCanvas.canvas.height / 2 - this.image.height / 2
		const position2X = this.renderingCanvas.canvas.width / 2 - this.clippingCanvas.canvas.width / 4
		const position2Y = this.renderingCanvas.canvas.height / 2 - this.clippingCanvas.canvas.height / 4

		ctx.save()
		ctx.drawImage(this.image, positionX, positionY)
		ctx.globalCompositeOperation = 'destination-in'
		ctx.drawImage(this.clippingCanvas.canvas, position2X, position2Y, this.clippingCanvas.canvas.width / 2, this.clippingCanvas.canvas.height / 2)
		ctx.restore()
	}
}

function brushEffect(box){

	if($(box).hasClass('b-story')){
		var el = $(box).find('.brush-effect').get(0);

		setTimeout(function(){
			new ClippingBrushImage(el, el.dataset.image, el.dataset.pathid, el.dataset.brush)
		}, 2000);
	}

}