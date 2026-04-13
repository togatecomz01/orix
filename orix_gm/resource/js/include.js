$(function () {
    var includeSelector = '[data-include-path]';

    function getCacheBuster() {
        return new Date().getTime();
    }

    function triggerIncludeLoaded($target, path, response, status, xhr) {
        $target.trigger('include:loaded', [path, response, status, xhr]);

        if (typeof window.onIncludeLoaded === 'function') {
            window.onIncludeLoaded($target, path, response, status, xhr);
        }
    }

    $(includeSelector).each(function () {
        var $target = $(this);
        var path = $target.attr('data-include-path');
        var separator;
        var requestUrl;

        if (!path) {
            return;
        }

        separator = path.indexOf('?') > -1 ? '&' : '?';
        requestUrl = path + separator + '_v=' + getCacheBuster();

        $target.load(requestUrl, function (response, status, xhr) {
            if (status === 'error') {
                $target.html([
                    '<div class="include-error">',
                    '<p>Include load failed.</p>',
                    '<p>Status: ' + xhr.status + ' ' + xhr.statusText + '</p>',
                    '<p>Path: ' + path + '</p>',
                    '</div>'
                ].join(''));

                if (window.console && typeof window.console.error === 'function') {
                    window.console.error('Include load failed:', path, xhr.status, xhr.statusText);
                }
            }

            triggerIncludeLoaded($target, path, response, status, xhr);
        });
    });
});
