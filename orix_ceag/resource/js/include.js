$(function () {
    var includeSelector = '[data-include-path]';

    function getCacheBuster() {
        return new Date().getTime();
    }

    function getPathnameOnly(path) {
        return (path || '').split('#')[0].split('?')[0];
    }

    function getDirname(path) {
        var pathname = getPathnameOnly(path);
        var lastSlashIndex = pathname.lastIndexOf('/');

        if (lastSlashIndex < 0) {
            return '';
        }

        return pathname.substring(0, lastSlashIndex + 1);
    }

    function isExternalPath(path) {
        return /^(?:[a-z]+:|\/\/|#|javascript:|mailto:|tel:|data:)/i.test(path || '');
    }

    function resolvePath(baseDir, relativePath) {
        var path = relativePath || '';
        var hash = '';
        var query = '';
        var hashIndex = path.indexOf('#');
        var queryIndex;
        var pathOnly;
        var baseParts;
        var pathParts;
        var resultParts = [];
        var i;

        if (!path || isExternalPath(path)) {
            return path;
        }

        if (path.charAt(0) === '/') {
            return path;
        }

        if (hashIndex > -1) {
            hash = path.substring(hashIndex);
            path = path.substring(0, hashIndex);
        }

        queryIndex = path.indexOf('?');

        if (queryIndex > -1) {
            query = path.substring(queryIndex);
            pathOnly = path.substring(0, queryIndex);
        } else {
            pathOnly = path;
        }

        baseParts = (baseDir || '').split('/');
        pathParts = pathOnly.split('/');

        if (baseParts.length && baseParts[baseParts.length - 1] === '') {
            baseParts.pop();
        }

        for (i = 0; i < baseParts.length; i += 1) {
            resultParts.push(baseParts[i]);
        }

        for (i = 0; i < pathParts.length; i += 1) {
            if (!pathParts[i] || pathParts[i] === '.') {
                continue;
            }

            if (pathParts[i] === '..') {
                if (resultParts.length > 1 || (resultParts.length === 1 && resultParts[0] !== '')) {
                    resultParts.pop();
                }
            } else {
                resultParts.push(pathParts[i]);
            }
        }

        return resultParts.join('/') + query + hash;
    }

    function rewriteRelativePaths($target, includePath) {
        var pageDir = getDirname(window.location.pathname);
        var includeFullPath = resolvePath(pageDir, includePath);
        var includeDir = getDirname(includeFullPath);

        $target.find('[src], [href]').each(function () {
            var $el = $(this);
            var src = $el.attr('src');
            var href = $el.attr('href');

            if (src) {
                $el.attr('src', resolvePath(includeDir, src));
            }

            if (href) {
                $el.attr('href', resolvePath(includeDir, href));
            }
        });
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
            } else {
                rewriteRelativePaths($target, path);
            }

            triggerIncludeLoaded($target, path, response, status, xhr);
        });
    });
});
