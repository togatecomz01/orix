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

            $wrap.css({
                height: hasExpanded ? 'auto' : layout.targetHeight,
                flex: hasExpanded ? 'none' : ''
            });

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

    // 카드 더보기: 더보기/접기 버튼 클릭
    $(document).on('click', '.btn-card-more', function () {
        var $card = $(this).closest('.card-box');

        $card.toggleClass('is-expanded');
        $(this).closest('.card-more').prop('hidden', false);

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

    // 데이트피커 날짜 형식 변환
    function formatDate(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    // 데이트피커 오늘 + 15일 이전, 오늘 + N일 (현재 56일) 이후 선택 안되게
    function syncDateLimit() {
        var todayObj = new Date();

        var minDateObj = new Date(
            todayObj.getFullYear(),
            todayObj.getMonth(),
            todayObj.getDate() + 15
        );

        var maxDateObj = new Date(
            todayObj.getFullYear(),
            todayObj.getMonth(),
            todayObj.getDate() + 56
        );

        $('.js-min-today')
            .attr('min', formatDate(minDateObj))
            .attr('max', formatDate(maxDateObj));
    }

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
            var groupIndex = $group.index() + 1;
            var count;
            var newId;

            if (!$group.length || id === 'bottom-button-wrap') {
                return;
            }

            if (!ids[id]) {
                ids[id] = 1;
                return;
            }

            ids[id] += 1;
            count = ids[id];
            newId = id + '-step' + groupIndex + '-' + count;

            $target.attr('id', newId);
            $group.find('label[for="' + escapeSelector(id) + '"]').first().attr('for', newId);
        });
    }

    // 하단 버튼: 각 step의 이전/다음/인증 버튼 역할 지정
    function updateStepButtons() {
        $groups.each(function (index) {
            var step = index + 1;
            var $group = $(this);
            var $primary = $group.find('#bottom-button-wrap .btn-primary').last();
            var $secondary = $group.find('#bottom-button-wrap .btn-secondary').last();

            if ($primary.length) {
                $primary
                    .attr('href', 'javascript:void(0);')
                    .attr('data-step-role', step === GROUP_MAX ? 'cert-auth' : 'next');
            }

            if ($secondary.length) {
                $secondary
                    .attr('href', 'javascript:void(0);')
                    .attr('data-step-role', 'prev');
            }
        });
    }

    // 상단 스텝 표시: 현재 step은 active, 이전 step은 done 처리
    function updateIndicator(step) {
        var indicatorStep = Math.min(step, STEP_MAX);

        $stepLis.each(function (index) {
            var itemStep = index + 1;

            $(this)
                .toggleClass('done', itemStep < indicatorStep)
                .toggleClass('active', itemStep === indicatorStep)
                .attr('aria-selected', itemStep === indicatorStep ? 'true' : 'false');
        });
    }

    // 카드 더보기 높이 재계산: include 완료/step 변경 직후 DOM 반영 뒤 실행
    function syncLayoutCards() {
        setTimeout(syncMoreCards, 0);
    }

    // step 이동 시 상단으로 이동
    function scrollToTop() {
        $('html, body').stop(true).animate({ scrollTop: 0 }, 300);
    }

    // step 화면 전환
    function setStep(step, skipScroll) {
        cur = Math.max(1, Math.min(step, GROUP_MAX));

        $groups
            .removeClass('active')
            .eq(cur - 1)
            .addClass('active');

        updateIndicator(cur);
        syncDateLimit();
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

        if (cur < GROUP_MAX) {
            setStep(cur + 1);
        }
    });

    // 이전 버튼: 현재 활성화된 step에서만 동작
    $(document).on('click', '.page-container [data-step-role="prev"]', function (e) {
        e.preventDefault();

        if (!$(this).closest('.group').hasClass('active')) {
            return;
        }

        if (cur > 1) {
            setStep(cur - 1);
        }
    });

    // 법인 공동인증서 인증: 솔루션 연결 자리
    $(document).on('click', '.page-container [data-step-role="cert-auth"]', function (e) {
        e.preventDefault();

        if (!$(this).closest('.group').hasClass('active')) {
            return;
        }

        // TODO: 법인 공동인증서 솔루션 호출 후 완료 팝업 연결
        // 예) window.openCorporateCertificateSolution();
    });

    // include 완료 후 버튼 역할/중복 id/데이트피커/카드 높이 다시 계산
    $(document).on('include:loaded', '.page-container .group', function () {
        syncDuplicateIds();
        updateStepButtons();
        syncDateLimit();
        syncLayoutCards();
    });

    syncDuplicateIds();
    updateStepButtons();
    syncDateLimit();
    setStep(cur, true);
});