/**
 * SwipeViewer (https://github.com/noahlaux/SwipeViewer/)
 *
 * Finds images in folder and turn them into a mobile slideshow with swipe gestures
 *
 * @version 1.0
 *
 * @author Noah Laux (noah.laux@lbi.com)
 *
 * @dependency
 *  Zepto.js (https://github.com/madrobby/zepto)
 */
$( function() {
    
    // Declare effect helpers
    $.fn.fadeIn = function( callback ) {
        return $( this ).animate({
            'opacity': 1
        },{
            complete: callback
        });
    };
            
    $.fn.fadeOut = function( callback ) {
        return $( this ).animate({
            'opacity': 0
        },{
            complete: callback
        });
    };

    var methods = {
        /**
         * Initialize
         *
         * @return N/A
         */
        init: function( options ) {
            
            var self    = this,
                options = options || {};
            
            this.container      = options.container || $('#container');
            this.path           = options.path || 'img/';
            this.fileType       = options.fileType || 'jpg';
            this.preloadImages  = [];
            this.currentIndex   = 0;
                        
            // Hide container
            this.container.css( 'opacity', 0 );
            
            // Try to get as many images as possible, before hitting a load error
            self.getImages( 1, function( images ) {
                
                // Attach events like clicks/swipes etc
                self.setupEvents( images );
            
                // Append images into container
                self.container.append( images );
                                
                // Resize images to match container
                self.resize();
                
                // Fade out loader
                $('#bowlG').fadeOut( function() {
                    // Fade up container
                    self.container.fadeIn();
                });

            });
            
        },
        /**
         * Bind events to gestures
         *
         * @param {Array} images HTML image elements
         *
         * @return N/A
         */
        setupEvents: function( images ) {
            
            var self    = this,
                $images = $( images );
            
            // Prevent all scrolling
            window.ontouchmove = function( e ) {
                e.preventDefault();
            };

            // Resize when device change orientation or window resize
            window.onorientationchange = window.onresize = function () {
                self.resize();
            };
            
            /**
             * User swipes left on image
             *
             * @param {Event}
             * @return N/A
             */
            $images.swipeLeft( function( e ) {
                self.goToNextSlide();
            });

            /**
             * User swipes right on image
             *
             * @param {Event}
             * @return N/A
             */
            $images.swipeRight( function( e ) {
                self.goToPreviousSlide();
            });
            
            /**
             * User click on previous botton
             *
             * @param {Event} e
             * @return N/A
             */
            $('.prev').bind('click', function( e ) {
                self.goToPreviousSlide();
            });
            
            /**
             * User click on next botton
             *
             * @param {Event} e
             * @return N/A
             */
            $('.next').bind('click', function( e ) {
                self.goToNextSlide();
            });
            
            /**
             * On keypress
             *
             * @param {Event} e
             * @return N/A
             */
            $(window).bind('keyup', function( e ) {
            
                if ( e.which === 32 || e.which === 39 ) {
                    // Space and arrow right
                    self.goToNextSlide();
                } else if ( e.which === 37 ) {
                    // Arrow left
                    self.goToPreviousSlide();
                } else if ( e.which === 36 ) {
                    // Home key
                    self.goToSlide( 0 );
                } else if ( e.which === 35 ) {
                    // end key
                    self.goToSlide( self.preloadImages.length - 2 );
                }
                
            });
            
        },
        /**
         * Go to next slide
         *
         * @return N/A
         */
        goToNextSlide: function() {
            // Check if we hit the boundery
            if ( this.currentIndex + 1 < this.preloadImages.length ) {
                this.currentIndex++;
            }
                
            this.goToSlide( this.currentIndex );
        },
        /**
         * Go to previous slide
         *
         * @return N/A
         */
        goToPreviousSlide: function() {
            // Check if we hit the boundery
            if ( ( this.currentIndex - 1 ) >= 0 ) {
                this.currentIndex--;
            }
            
            this.goToSlide( this.currentIndex );
        },
        /**
         * Go to a specific slide
         *
         * @param {Number} index Slide to go to (0 based)
         * @return N/A
         */
        goToSlide: function( index ) {

            var width = this.container.find('img').eq( index ).width() * index;
            
            this.container.anim({
                '-webkit-transform': 'translate3d(-' + width + 'px,0px,0px)'
            });
            
        },
        /**
         * Resize container and images
         *
         * @return N/A
         */
        resize: function() {
            
            var $window = $( window );

            // Set container width to combined width of all images
            this.container.css({
                width: $window.width() * this.preloadImages.length + 'px'
            });
            
            // Make all images width the size of the screen
            this.container.find('img').width( $window.width() );
            
            this.goToSlide( this.currentIndex );
        },
        /**
         * Get images incrementally
         *
         * @param {Number} index
         * @param {Function} callback
         */
        getImages: function( index, callback ) {
            
            var self    = this,
                // Prefex zeros if below zero
                number  = ( index < 10 ) ? '0' + index : index;

            this.loadImage( number + '.' + this.fileType , function( image ) {
                if ( image ) {
                    // Successfully got image, so push it into image stack
                    self.preloadImages.push( image );
                    
                    index++;
                    
                    // Try to fetch the next image
                    self.getImages( index, callback );
                } else {
                    // Find first error (aga. no more images, so compile slideshow
                    callback( self.preloadImages );
                }
            });
            
        },
        /**
         * Try to load the image
         *
         * @param {String} url
         * @param {Function} callback
         * @return N/A
         */
        loadImage: function( url, callback ) {

            var image = document.createElement('img');
            image.src = this.path + url;

            image.addEventListener("load", function() {
                callback( this );
            });

            image.addEventListener("error", function() {
                callback( null );
            });
        }
    };
    
    methods.init();

});