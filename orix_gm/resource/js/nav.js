/* 공통 사이드 메뉴 */
// 퍼블전용이라고 적혀있는 부분은 개발에 넘길 때 삭제
(function () {
    function getPathname(path) {
        var pathname = path || '';

        pathname = pathname.split('#')[0];
        pathname = pathname.split('?')[0];

        return pathname.toLowerCase();
    }

    function getFileName(path) {
        var pathname = getPathname(path);
        var parts = pathname.split('/');

        return parts[parts.length - 1] || '';
    }

    /* s : 퍼블전용 */
    function getCurrentNavId() {
        return $('body').attr('data-nav-id') || '';
    }

    function findLinkByNavId($links, navId) {
        if (!navId) {
            return $();
        }

        return $links.filter('[data-nav-id="' + navId + '"]').first();
    }
    /* e : 퍼블전용 */

    /* 메뉴 href가 실제 페이지 경로일 때 현재 URL과 비교해 활성 메뉴를 찾기 */
    function findLinkByHref($links) {
        var currentPath = getPathname(window.location.pathname);
        var currentFileName = getFileName(currentPath);
        var $currentLink = $();
        var matchedLength = -1;

        $links.each(function () {
            var $link = $(this);
            var linkPath = getPathname($link.attr('href'));
            var linkFileName = getFileName(linkPath);

            if (!linkPath || linkPath === '#none' || linkPath === '#') {
                return;
            }

            if (linkPath === currentPath) {
                $currentLink = $link;
                matchedLength = linkPath.length;
                return false;
            }

            if (linkFileName && linkFileName === currentFileName && linkPath.length > matchedLength) {
                $currentLink = $link;
                matchedLength = linkPath.length;
            }
        });

        return $currentLink;
    }

    window.initSideNav = function ($scope) {
        var $nav = $scope && $scope.length ? $scope.find('.side-nav') : $('.side-nav');
        /* s : 퍼블전용 */
        var navId = getCurrentNavId();
        /* e : 퍼블전용 */
        var $links;
        var $currentLink;

        if (!$nav.length) {
            return;
        }

        $links = $nav.find('.side-menu li a');
        $links.removeClass('on');

        /* href가 실제 경로로 들어오면 이 분기에서 활성 메뉴를 처리 */
        $currentLink = findLinkByHref($links);

        /* s : 퍼블전용 */
        if (!$currentLink.length) {
            $currentLink = findLinkByNavId($links, navId);
        }
        /* e : 퍼블전용 */

        if ($currentLink.length) {
            $currentLink.addClass('on');
        }
    };

    $(function () {
        window.initSideNav();

        $(document).on('include:loaded', '[data-include-path]', function (event, path, response, status) {
            if (status === 'success' && path && path.indexOf('inc-nav.html') > -1) {
                window.initSideNav($(this));
            }
        });
    });
})();
