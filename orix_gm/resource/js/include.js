$(function () {
    var includeSelector = '[data-include-path]';
    var navScriptPath = '../../resource/js/nav.js';
    var isNavScriptLoading = false;
    var navScriptCallbacks = [];

    function loadNavScript(callback) {
        if (typeof window.initSideNav === 'function') {
            if (typeof callback === 'function') {
                callback();
            }

            return;
        }

        if (typeof callback === 'function') {
            navScriptCallbacks.push(callback);
        }

        if (isNavScriptLoading) {
            return;
        }

        isNavScriptLoading = true;

        $.getScript(navScriptPath)
            .done(function () {
                var i;

                isNavScriptLoading = false;

                for (i = 0; i < navScriptCallbacks.length; i += 1) {
                    navScriptCallbacks[i]();
                }

                navScriptCallbacks = [];
            })
            .fail(function (xhr, status, error) {
                isNavScriptLoading = false;
                navScriptCallbacks = [];

                if (window.console && typeof window.console.error === 'function') {
                    window.console.error('nav.js load failed:', status, error);
                }
            });
    }

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
            } else if (path.indexOf('inc-nav.html') > -1) {
                loadNavScript(function () {
                    if (typeof window.initSideNav === 'function') {
                        window.initSideNav($target);
                    }
                });
            }

            triggerIncludeLoaded($target, path, response, status, xhr);
        });
    });
});
