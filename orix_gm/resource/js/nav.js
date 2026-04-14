/* 공통 사이드 메뉴 활성화 */
window.initSideNav = (function ($) {
    function normalize(value) {
        return $.trim(value || '').replace(/\s+/g, '');
    }

    function getPathname(path) {
        return (path || '').split('#')[0].split('?')[0];
    }

    function getFileName(path) {
        var pathname = getPathname(path);
        var parts = pathname.split('/');

        return parts[parts.length - 1] || '';
    }

    function getPageTitle() {
        var selectors = [
            '.page-control .control-header h2',
            '.page-control h2',
            '.page-title',
            '.contents-title',
            'main h2'
        ];
        var i;
        var text = '';

        for (i = 0; i < selectors.length; i += 1) {
            text = normalize($(selectors[i]).first().text());

            if (text) {
                return text;
            }
        }

        return normalize(document.title);
    }

    function getMenuTitle($link) {
        return normalize($link.attr('title')) ||
            normalize($link.text()) ||
            normalize($link.find('img').attr('alt'));
    }

    function matchMenuByPath($link) {
        var href = $link.attr('href') || '';
        var currentPath = getPathname(window.location.pathname);
        var linkPath = getPathname(href);
        var currentFileName = getFileName(currentPath);
        var linkFileName = getFileName(linkPath);

        if (!href || href === '#none' || href === '#') {
            return false;
        }

        if (linkPath && currentPath === linkPath) {
            return true;
        }

        if (linkFileName && currentFileName === linkFileName) {
            return true;
        }

        return false;
    }

    function activateMenu(scope) {
        var $scope = scope && scope.jquery ? scope : $(scope || document);
        var $links = $scope.find('.side-menu a');
        var pageTitle = getPageTitle();
        var matched = false;

        if (!$links.length || !pageTitle) {
            $links.removeClass('on');
            return false;
        }

        $links.removeClass('on');

        $links.each(function () {
            var $link = $(this);

            if (matchMenuByPath($link)) {
                $link.addClass('on');
                matched = true;
                return false;
            }
        });

        if (matched) {
            return true;
        }

        $links.each(function () {
            var $link = $(this);

            if (getMenuTitle($link) === pageTitle) {
                $link.addClass('on');
                matched = true;
                return false;
            }
        });

        return matched;
    }

    function initSideNav(scope) {
        var target = scope || document;
        var tryCount = 0;

        function run() {
            tryCount += 1;

            if (activateMenu(target)) {
                return;
            }

            if (tryCount < 20) {
                setTimeout(run, 100);
            }
        }

        run();
    }

    if (!window.__sideNavInited) {
        window.__sideNavInited = true;

        $(window).on('load', function () {
            initSideNav(document);
        });

        $(document).on('include:loaded', function (event, path) {
            if (path && path.indexOf('inc-nav.html') > -1) {
                initSideNav(event.target);
            }
        });
    }

    return initSideNav;
})(jQuery);
