$(function () {
    // 카드 더보기: 오른쪽 카드 높이를 왼쪽 컬럼 높이에 맞춰 동기화
    function getColumnContentHeight($column) {
        var $items = $column.children();
        var gap = parseFloat($column.css('row-gap')) || parseFloat($column.css('gap')) || 0;
        var height = 0;

        $items.each(function () {
            height += $(this).outerHeight();
        });

        return height + (gap * Math.max($items.length - 1, 0));
    }

    function getCardLayout($wrap) {
        var $layout = $wrap.closest('.layout-grid');
        var $leftColumn = $layout.children('.col-group').first();
        var $rightColumn = $wrap.closest('.col-group');
        var $items = $wrap.children('.card-box');
        var gap = parseFloat($wrap.css('row-gap')) || parseFloat($wrap.css('gap')) || 0;
        var wrapTop = $wrap[0].getBoundingClientRect().top - $rightColumn[0].getBoundingClientRect().top;
        var targetHeight = Math.max(getColumnContentHeight($leftColumn) - wrapTop, 0);
        var cardHeight = Math.max((targetHeight - (gap * ($items.length - 1))) / $items.length, 0);

        return {
            cardHeight: cardHeight,
            targetHeight: targetHeight
        };
    }

    // 카드 더보기: 카드가 접힌 상태에서 실제 콘텐츠가 넘치는지 확인
    function syncMoreCards() {
        $('.card-wrap').each(function () {
            var $wrap = $(this);

            if (!$wrap.is(':visible')) {
                return;
            }

            var $items = $wrap.children('.card-box');
            var layout = getCardLayout($wrap);
            var hasExpanded = $items.filter('.is-expanded').length > 0;

            if (hasExpanded) {
                $wrap.css({ height: 'auto', flex: 'none' });
            } else {
                $wrap.css({ height: layout.targetHeight, flex: '' });
            }

            $items.each(function () {
                var $card = $(this);
                var $more = $card.children('.card-more');
                var isExpanded = $card.hasClass('is-expanded');

                $card.css({
                    flex: 'none',
                    height: isExpanded ? 'auto' : layout.cardHeight
                });

                if (isExpanded) {
                    $more.prop('hidden', false);
                    return;
                }

                $more.prop('hidden', true);

                if (this.scrollHeight > this.clientHeight + 1) {
                    $more.prop('hidden', false);
                }
            });
        });
    }

    window.syncLayoutMoreCards = syncMoreCards;
    syncMoreCards();

    // 카드 더보기: 더보기/접기 버튼 클릭
    $(document).on('click', '.btn-card-more', function () {
        var $card = $(this).closest('.card-box');
        var isExpanded = !$card.hasClass('is-expanded');

        $card.toggleClass('is-expanded', isExpanded);
        $(this).closest('.card-more').prop('hidden', false);

        syncMoreCards();
    });

    $(document).on('include:loaded', '.page-container .group', function () {
        syncMoreCards();
    });

    $(window).on('load resize', function () {
        syncMoreCards();
    });

    // 스텝 기본 요소
    var $stepProgress = $('.step-progress');
    var $stepLis = $stepProgress.children('li');
    var $page = $('.page-container');
    var $groups = $page.children('.group');
    var GROUP_MAX = $groups.length;
    var STEP_MAX = $stepLis.length;
    var cur = $groups.filter('.active').index() + 1;

    if (!$page.length || !$groups.length) {
        return;
    }

    if (!cur) {
        cur = 1;
    }

    /* URL에 있는 step 값을 읽어서 해당 step으로 시작하기 위한 함수 */
    /* 개발단에서는 삭제 필요 퍼블용!!!! */
    function getStepFromUrl() {
        /* 현재 주소의 query string에서 step=숫자 형태를 찾음 */
        var match = window.location.search.match(/[?&]step=([0-9]+)/);

        /* step 값이 있으면 숫자로 변환하고, 없으면 null 처리 */
        var step = match ? parseInt(match[1], 10) : null;

        /* step 값이 없거나, 1보다 작거나, 실제 step 개수보다 크면 무시 */
        if (!step || step < 1 || step > GROUP_MAX) {
            return null;
        }

        /* 정상적인 step 값이면 해당 숫자를 반환 */
        return step;
    }

    /* URL에서 읽어온 step 값을 저장 */
    var urlStep = getStepFromUrl();

    /* URL에 유효한 step 값이 있으면 현재 step 값을 URL 기준으로 변경 */
    if (urlStep) {
        cur = urlStep;
    }

    // 데이트피커 날짜 형식 변환
    /* function formatDate(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    } */

    // 데이트피커 오늘 + 15일 이전, 선택 가능일로부터 31일 이후 선택 안되게
    /* function syncDateLimit() {
        var todayObj = new Date();

        var minDateObj = new Date(
            todayObj.getFullYear(),
            todayObj.getMonth(),
            todayObj.getDate() + 15
        );

        var maxDateObj = new Date(minDateObj); */
        // min 날짜도 선택 가능한 1일차로 포함되기 떄문에 31일 범위는 +30
        /* maxDateObj.setDate(maxDateObj.getDate() + 30);

        $('.js-min-today')
            .attr('min', formatDate(minDateObj))
            .attr('max', formatDate(maxDateObj));
    } */

    // include로 불러온 화면 안에 같은 id가 있을 때 label 연결까지 같이 보정
    function escapeSelector(text) {
        return (text || '').replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
    }

    function syncDuplicateIds() {
        var ids = {};

        $page.find('[id]').each(function () {
            var $target = $(this);
            var $group = $target.closest('.group');
            var id = this.id;
            var newId;

            if (!$group.length || id === 'bottom-button-wrap') {
                return;
            }

            if (!ids[id]) {
                ids[id] = true;
                return;
            }

            newId = id + '-step' + ($group.index() + 1);
            $target.attr('id', newId);
            $group.find('label[for="' + escapeSelector(id) + '"]').attr('for', newId);
            ids[newId] = true;
        });
    }

    // 하단 버튼: step1~3 다음 버튼 역할 지정
    function updateStepButtons() {
        $groups.each(function (index) {
            var step = index + 1;
            var $group = $(this);
            var $btnArea = $group.find('#bottom-button-wrap .btn-area').last();
            var $primary = $btnArea.find('.btn-primary').last();

            if (!$btnArea.length || !$primary.length) {
                return;
            }

            if (step < GROUP_MAX) {
                $primary
                    .attr('href', 'javascript:void(0);')
                    .attr('data-step-role', 'next');
            }
        });
    }

    // 상단 스텝 표시: 현재 step은 active, 이전 step은 done 처리
    function updateIndicator(step) {
        var indicatorStep = Math.min(step, STEP_MAX);

        $stepLis.each(function (index) {
            var itemStep = index + 1;

            $(this)
                .removeClass('prev on next')
                .toggleClass('done', itemStep < indicatorStep)
                .toggleClass('active', itemStep === indicatorStep);
        });
    }

    // 카드 더보기 높이 재계산: include 완료/step 변경 직후 DOM 반영 뒤 실행
    function syncLayoutCards() {
        window.setTimeout(function () {
            if (typeof window.syncLayoutMoreCards === 'function') {
                window.syncLayoutMoreCards();
            }
        }, 0);
    }

    // step 이동 시 상단으로 이동
    function scrollToTop() {
        $('html, body').stop(true).animate({ scrollTop: 0 }, 250);
    }

    // step 화면 전환
    function setStep(step, skipScroll) {
        cur = Math.max(1, Math.min(step, GROUP_MAX));

        $groups.removeClass('active').eq(cur - 1).addClass('active');
        updateIndicator(cur);
        updateStepButtons();
        /* syncDateLimit(); */
        syncLayoutCards();

        if (!skipScroll) {
            scrollToTop();
        }
    }

    // 다음 버튼: step1 > step2 > step3 > step4
    $(document).on('click', '.page-container [data-step-role="next"]', function (e) {
        e.preventDefault();

        if (!$(this).closest('.group').hasClass('active')) {
            return;
        }

        if ($(this).hasClass('disabled') || $(this).attr('aria-disabled') === 'true') {
            return;
        }

        setStep(cur + 1);
    });

    // include 완료 후 버튼 역할/중복 id/데이트피커/카드 높이 다시 계산
    $(document).on('include:loaded', '.page-container .group', function () {
        syncDuplicateIds();
        updateStepButtons();
        /* syncDateLimit(); */
        syncLayoutCards();
    });

    /* step1~3 disabled 버튼 툴팁 */
    /* 퍼블용!!!! 개발단에서는 삭제 필요 */
    $(document).on('mouseenter mouseleave', '.btn-area', function(e) {
        var isDisabled = $(this).find('.btn-primary').first().prop('disabled');
    
        $(this).find('.tooltip').toggleClass('on', e.type === 'mouseenter' && isDisabled);
    });
    /* 중요 약정사항 확인 여부 출력 */
    /* 퍼블용!!!! 개발단에서는 삭제 필요 */
    $(document).on("change", ".check-list [name=agreementTerms]", function(e) {
        var $input = $(e.currentTarget);
        var $label = $input.siblings("label");

        if ($input.prop("checked")) {
            $label.find(".term-badge")
                .removeClass("is-pending small")
                .addClass("is-complete small")
                .text("확인완료");
        } else {
            $label.find(".term-badge")
                .removeClass("is-complete small")
                .addClass("is-pending small")
                .text("미확인");
        }
    });

    syncDuplicateIds();
    /* syncDateLimit(); */
    setStep(cur, true);
});
