$('document').ready(function() {
    $('html, body').on('click', function(e) {
        if (e.target == document.documentElement) {
            $('html').removeClass('opened');
        }
    });
    $('.navbar-toggler').on('click', function(e) {
        $('html, body').animate({
            scrollTop: $('html, body').offset().top
        }, 150);
        $('html').addClass('opened');
    });
});