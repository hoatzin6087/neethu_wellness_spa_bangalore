(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('bg-primary shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('bg-primary shadow-sm').css('top', '-150px');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Countdown Timer
    function countDownTimer() {	
        var endTime = new Date("31 December 2023 10:00:00 GMT+00:00");
        endTime = (Date.parse(endTime) / 1000);

        var now = new Date();
        now = (Date.parse(now) / 1000);

        var timeLeft = endTime - now;

        var days = Math.floor(timeLeft / 86400);
        var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
        var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
        var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));

        if (days < "10") {
            days = "0" + days;
        }
        if (hours < "10") {
            hours = "0" + hours;
        }
        if (minutes < "10") {
            minutes = "0" + minutes;
        }
        if (seconds < "10") {
            seconds = "0" + seconds;
        }

        $("#cdt-days").html(days + "<span>-Days-</span>");
        $("#cdt-hours").html(hours + "<span>-Hours-</span>");
        $("#cdt-minutes").html(minutes + "<span>-Mins-</span>");
        $("#cdt-seconds").html(seconds + "<span>-Secs-</span>");

    }

    setInterval(function () {
        countDownTimer();
    }, 1000);


    // Testimonials carousel
    $('.testimonial-carousel').owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        dotsData: true,
    });
    
})(jQuery);

// Note: auto-scroll handled via CSS marquee below (no scrollLeft animation here)

// Staff image gallery: open images in the existing #imagePreviewModal with prev/next and captions
(function ($) {
    'use strict';

    var staffGallery = {
        images: [],
        index: 0,
        $modal: null,

        show: function (images, startIndex) {
            this.images = images || [];
            this.index = (typeof startIndex === 'number') ? startIndex : 0;
            this.$modal = $('#imagePreviewModal');
            this.render();
            this.bindEvents();
            this.$modal.modal('show');
        },

        render: function () {
            var item = this.images[this.index] || {};
            var src = item.src || '';
            var nationality = item.nationality || '';
            var name = item.name || '';

            var html = '<div class="image-modal-wrapper position-relative">';
            if (this.images.length > 1) {
                html += '<div class="image-modal-nav prev" role="button" aria-label="Previous">‹</div>';
            }
            html += '<img src="' + src + '" alt="Preview" class="img-fluid" style="max-height:80vh; width:auto; display:block;">';
            if (this.images.length > 1) {
                html += '<div class="image-modal-nav next" role="button" aria-label="Next">›</div>';
            }
            // caption placed inside wrapper so it can be positioned at bottom-center of image
            html += '<div class="image-caption text-center">';
            if (name) html += '<div class="caption-name">' + name + '</div>';
            if (nationality) html += '<div class="caption-nationality">' + nationality + '</div>';
            html += '</div>';

            html += '</div>';

            $('#imagePreviewModalBody').html(html);
        },

        bindEvents: function () {
            var self = this;
            // prev
            $('#imagePreviewModalBody').off('click.gallery').on('click.gallery', '.image-modal-nav.prev', function () {
                self.prev();
            });
            // next
            $('#imagePreviewModalBody').on('click.gallery', '.image-modal-nav.next', function () {
                self.next();
            });

            // keyboard
            $(document).off('keydown.gallery').on('keydown.gallery', function (e) {
                if (!self.$modal || !self.$modal.hasClass('show')) return;
                if (e.which === 37) { // left
                    self.prev();
                } else if (e.which === 39) { // right
                    self.next();
                }
            });

            // cleanup on modal hide
            this.$modal.off('hidden.bs.modal.gallery').on('hidden.bs.modal.gallery', function () {
                $('#imagePreviewModalBody').empty();
                $(document).off('keydown.gallery');
            });
        },

        prev: function () {
            this.index = (this.index - 1 + this.images.length) % this.images.length;
            this.render();
        },

        next: function () {
            this.index = (this.index + 1) % this.images.length;
            this.render();
        }
    };

    // Attach click handler to staff images
    $(document).ready(function () {
        $(document).on('click', '.staff-track .staff-card img', function (e) {
            e.preventDefault();
            var $cards = $('.staff-track .staff-card');
            var images = [];

            $cards.each(function () {
                var $c = $(this);
                images.push({
                    src: $c.find('img').attr('src'),
                    nationality: $c.find('.staff-nationality').text().trim() || '',
                    name: $c.find('.staff-name').text().trim() || ''
                });
            });

            var clickedSrc = $(this).attr('src');
            var startIndex = 0;
            for (var i = 0; i < images.length; i++) {
                if (images[i].src === clickedSrc) { startIndex = i; break; }
            }

            staffGallery.show(images, startIndex);
        });
    });

})(jQuery);

// Marquee init for staff slider: duplicate track for seamless right-to-left scroll
(function ($) {
    'use strict';

    function initStaffMarquee() {
        var $container = $('.staff-slider');
        var $track = $('.staff-track');
        if (!$container.length || !$track.length) return;

        // avoid re-init
        if ($track.data('marquee-initialized')) return;

        // compute widths
        var origWidth = $track[0].scrollWidth;
        var containerW = $container.outerWidth();
        if (origWidth <= containerW) return; // no need to marquee

        // duplicate content to allow seamless loop
        var originalHtml = $track.html();
        $track.append(originalHtml);

        // set CSS variable for duration (distance is handled by translating -50%)
        var pxPerSec = 18; // speed
        var duration = Math.max(8, Math.round(origWidth / pxPerSec));
        $track[0].style.setProperty('--marquee-duration', duration + 's');

        $track.addClass('marquee');
        $track.data('marquee-initialized', true);

        // disable scroll-snap on container for smooth transform animation
        try { $container[0].style.setProperty('scroll-snap-type', 'none'); } catch (e) {}

        // pause when modal opens
        $(document).on('show.bs.modal.staffMarquee', function () { $track.css('animation-play-state', 'paused'); });
        $(document).on('hidden.bs.modal.staffMarquee', function () { $track.css('animation-play-state', 'running'); });
    }

    // init on load and after small delay to ensure images/layout settled
    $(window).on('load', function () { setTimeout(initStaffMarquee, 200); });
    // re-init on resize (debounced)
    var _marqueeTimer = null;
    $(window).on('resize', function () {
        clearTimeout(_marqueeTimer);
        _marqueeTimer = setTimeout(function () {
            // cleanup previous init
            var $track = $('.staff-track');
            if ($track.length && $track.data('marquee-initialized')) {
                $track.removeClass('marquee');
                $track.data('marquee-initialized', false);
                // restore scroll-snap on container
                try { $('.staff-slider')[0].style.removeProperty('scroll-snap-type'); } catch (e) {}
                // remove duplicated half (assume even)
                var children = $track.children();
                var half = Math.floor(children.length / 2);
                // keep first half only
                children.slice(half).remove();
            }
            initStaffMarquee();
        }, 220);
    });

})(jQuery);

