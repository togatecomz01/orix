$(function() {
    /* 데이트피커 날짜 형식 변환 */
    function formatDate(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    /* 데이트피커 오늘 + 15일 이전, 선택 가능일로부터 31일 이후 선택 안되게 */
    function syncDateLimit() {
        var todayObj = new Date();

        var minDateObj = new Date(
            todayObj.getFullYear(),
            todayObj.getMonth(),
            todayObj.getDate() + 15
        );

        var maxDateObj = new Date(minDateObj);
        // min 날짜도 선택 가능한 1일차로 포함되기 떄문에 31일 범위는 +30
        maxDateObj.setDate(maxDateObj.getDate() + 30);

        $('.js-min-today')
            .attr('min', formatDate(minDateObj))
            .attr('max', formatDate(maxDateObj));
    }

    /* 폼 관련 (Input 필터링, 포커스, 데이트피커 등) */
    function initFormControls() {
        /* 인풋 title 추가 */
        $(document).on('input', '.form-input', function() {
            var id = this.id;
            var val = $(this).val(); /* 인풋에 입력된 밸류 저장 */

            $(this).attr('title', val); /* 인풋에 입력된 밸류값을 타이틀로 추가해서 보이게 */

            /* 이메일일 경우, 진짜 타이핑된 원본 값을 real에 저장해둠 */
            if (id === 'emailId' || id === 'emailDomain') {
                $(this).data('real', val);
            }
        });

        /* 다시 클릭해서 포커스가 들어왔을 때 (원래 글자 복구) */
        $(document).on('focus', '#emailId, #emailDomain', function() {
            var realVal = $(this).data('real');
            
            /* 숨겨뒀던 진짜 값이 있다면 화면에 다시 띄워서 수정할 수 있게 함 */
            if (realVal) {
                $(this).val(realVal);
            }
        });

        /* 셀렉트박스 placeholder 제어 */
        $(document).on('change', 'select.form-input', function() {
            $(this).toggleClass('is-placeholder', $(this).val() === "");
        });

        /* 인풋 전체 선택시 데이트피커 뜨도록*/
        $(document).on('click', 'input[type="date"].form-input', function() {
            if (typeof this.showPicker === 'function') {
                this.showPicker(); /* showpicker 메서드가 브라우저에 따라 안될수도 있다 하여 문제 생길 시 다른 방법 사용 */
            }
        });

        /* 자동이체일 선택 방식(라디오 버튼)에 따라 이체일 선택/직접입력 영역 노출 */
        $(document).on('change', 'input[name="Autopay"]', function() {
            var $wrap = $(this).closest('.form-item');
            var isDirect = $('input[name="Autopay"]:checked').val() === 'direct';

            $wrap.find('#dateSelectArea')
                .toggle(!isDirect)
                .find('input')
                .prop('disabled', isDirect);

            $wrap.find('#directInputArea')
                .toggle(isDirect)
                .find('input')
                .prop('disabled', !isDirect);

            $wrap.children('.info-msg').toggle(isDirect);
        });

        $('input[name="Autopay"]:checked').trigger('change');
    }


    /* [아코디언 및 약관 동의 관련 */
    function initAccordion() {
        /* S : 토글 함수 하나로 구현하지 않고 열고 닫음 분리 -> 열기 닫기 따로 필요한 경우가 많아서 분리해서 구현 */
        function openAccordion($item) {
            if (!$item.hasClass('active')) {
                $item.addClass('active').find('.acc-body').stop(true, true).slideDown(200);
            }
        }
    
        function closeAccordion($item) {
            if ($item.hasClass('active')) {
                $item.removeClass('active').find('.acc-body').stop(true, true).slideUp(200);
            }
        }
        /* E : 토글 함수 하나로 구현하지 않고 열고 닫음 분리 -> 열기 닫기 따로 필요한 경우가 많아서 분리해서 구현 */

        /* 확인 상태 감지 함수 */
        function isTermComplete($item) {
            return $item.find('.term-badge').hasClass('is-complete');
        }
    
        /* 확인 상태 변경 함수 */
        function setTermComplete($item) {
            $item.find('input[name="terms"]').prop('checked', true);
            $item.find('.term-badge')
                .removeClass('is-pending')
                .addClass('is-complete')
                .text('확인완료');
        }
    
        /* 아코디언 헤더 또는 토글 버튼 클릭 시 */
        $(document).on('click', '.acc-head, .btn-toggle', function(e) {
            var $item = $(this).closest('.acc-item');
            var isTitle = $(e.target).closest('.term-badge, .term-title, .acc-trigger').length > 0;
    
            /* btn-toggle 클릭 시 acc-head 이벤트와 중복 실행 방지 */
            if ($(this).hasClass('btn-toggle')) {
                e.stopPropagation();
            }
    
            /* 클릭한 대상이 약관 체크박스 일 때때 */
            if ($(e.target).is('input[name="terms"]')) {
                /* 확인완료 상태가 아니면 */
                if (!isTermComplete($item)) {
                    /* 체크박스 기본 동작을 막고 체크 됐다고 해도 체크 해제 + body 열기 */
                    e.preventDefault();
                    $item.find('input[name="terms"]').prop('checked', false);
                    openAccordion($item);
                }
                return;
            }
    
            /* 클릭한 대상이 label 영역인데, 배지/제목은 아닌 경우 */
            if ($(e.target).closest('label').length && !isTitle) {
                /* 아직 확인완료 상태가 아니라면 label 클릭으로 체크박스가 바뀌는 기본 동작을 막고 body 열기 */
                if (!isTermComplete($item)) {
                    e.preventDefault();
                    openAccordion($item);
                }
                return;
            }
    
            e.preventDefault();
    
            /* 위의 상황이 아니라면 토글 기본동작 실행 */
            if ($item.hasClass('active')) {
                closeAccordion($item);
            } else {
                openAccordion($item);
            }
        });
    
        /* 체크박스 상태 예외처리: 동의 완료 전에는 직접 checked 불가 */
        $(document).on('change', '.accordion-list input[name="terms"]', function() {
            var $item = $(this).closest('.acc-item');

            if (!isTermComplete($item)) {
                $(this).prop('checked', false);
                openAccordion($item);
            }
        });
    
        /* 약관 본문 안의 동의 버튼 클릭 시 실행 */
        $(document).on('click', '.accordion-list .acc-body .btn-form', function(e) {
            var $item = $(this).closest('.acc-item');
            e.preventDefault();
            setTermComplete($item);
            closeAccordion($item);
        });
    }

    /* 로딩 */
    function initEtcUI() {
        /* 로딩 팝업 자동 닫힘 */
        if ($('#popLoading').length > 0 && $('#popLoading').hasClass('on')) {
            setTimeout(function() {
                $('#popLoading').fadeOut(300, function() { $(this).removeClass('on'); });
                $('body').css('overflow', 'auto');
            }, 2000);
        }

        /* 공통 팝업 열기 (data-target) */
        /* 버튼은 primary, secondary, outline 세가지 종류 있는데 그 클래스에 btn-pop-open or close 붙혀서 제어 */
        $(document).on('click', '.btn-pop-open', function(e) {
            e.preventDefault();
            var targetId = $(this).attr('data-target'); 
            if (targetId) {
                $(targetId).addClass('on');
                $('body').css('overflow', 'hidden');
            }
        });

        /* 공통 팝업 닫기 */
        $(document).on('click', '.btn-pop-close, .btn-close-pop', function(e) {
            e.preventDefault();
            if (!$(this).closest('#popSignature').length) {
                $(this).closest('.layer-popup').removeClass('on');
                $('body').css('overflow', 'auto');
            }
        });
    }


    initFormControls();
    syncDateLimit();
    initAccordion();
    initEtcUI();
    // initMainPageScroll();
});
