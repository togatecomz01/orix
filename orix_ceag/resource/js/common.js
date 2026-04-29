$(function() {
    /* 폼 관련 (Input 필터링, 포커스, 데이트피커 등) */
    function initFormControls() {
        var REGEX_MAP = {
            'userName': /[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣 ]/g,
            'userAccount': /[^0-9]/g,
            'contactTel': /[^0-9]/g,
            'tel2': /[^0-9]/g, 
            'tel3': /[^0-9]/g, 
            'emailId': /[^a-zA-Z0-9._-]/g,
            'emailDomain': /[^a-zA-Z0-9.]/g
        };

        /* 금지어 필터링, 인풋 title 추가 */
        $(document).on('input', '.form-input', function() {
            var id = this.id;
            var val = $(this).val(); /* 인풋에 입력된 밸류 저장 */

            if (REGEX_MAP[id]) {
                var clean = val.replace(REGEX_MAP[id], '');
                if (val !== clean) { $(this).val(clean); val = clean; }
            }
            $(this).attr('title', val); /* 인풋에 입력된 밸류값을 타이틀로 추가해서 보이게 */

            /* 이메일일 경우, 진짜 타이핑된 원본 값을 real에 저장해둠 */
            if (id === 'emailId' || id === 'emailDomain') {
                $(this).data('real', val);
            }
        });

        $(document).on('blur', '#emailId, #emailDomain', function() {
            var realVal = $(this).data('real') || $(this).val();
            
            if (realVal.length > 15) {
                /* 진짜 값은 놔두고 화면에 보이는 값만 15자 + '...' 로 변경 */
                $(this).val(realVal.substring(0, 15) + '...');
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

        /* 연락처 자동 포커스 */
        $(document).on('input', '#tel2', function() {
            if ($(this).val().length === 4) $('#tel3').focus();
        });

        /* 셀렉트박스 placeholder 제어 */
        $(document).on('change', 'select.form-input', function() {
            $(this).toggleClass('is-placeholder', $(this).val() === "");
        });

        /* 직접입력(라디오버튼) 체크 시 인풋 노출 */
        $(document).on('change', 'input[name="payType"]', function() {
            var isDirect = $(this).val() === 'direct';
            $('#dateSelectArea').toggle(!isDirect);
            $('#directInputArea').toggle(isDirect);
        });

        /* 데이트피커 오늘 날짜 이전 선택 안되게 */
        var today = new Date().toLocaleDateString('en-CA'); 
        $('.js-min-today').attr('min', today);

        /* 인풋 전체 선택시 데이트피커 뜨도록*/
        $(document).on('click', 'input[type="date"].form-input', function() {
            if (typeof this.showPicker === 'function') {
                this.showPicker(); /* showpicker 메서드가 브라우저에 따라 안될수도 있다 하여 문제 생길 시 다른 방법 사용 */
            }
        });
    }


    /* [아코디언 및 약관 동의 관련 */
    function initAccordion() {
        /* 아코디언 열기/닫기 */
        $(document).on('click', '.acc-head, .btn-toggle', function(e) {
            if ($(e.target).is('label, input')) return; 
            if ($(this).hasClass('btn-toggle')) e.stopPropagation();

            var $item = $(this).closest('.acc-item');
            $item.toggleClass('active').find('.acc-body').slideToggle(200);
        });

        /* 체크박스 체크 시 아코디언 펼치기 */
        $(document).on('change', 'input[name="terms"]', function() {
            if ($(this).is(':checked')) {
                var $item = $(this).closest('.acc-item');
                if (!$item.hasClass('active')) {
                    $item.addClass('active').find('.acc-body').slideDown(200);
                }
            }
        });

        /* 약관 전체 동의 연동 */
        $(document).on('change', '#agreeAll', function() {
            $('input[name="terms"]').prop('checked', $(this).is(':checked'));
        });

        $(document).on('change', 'input[name="terms"]', function() {
            var total = $('input[name="terms"]').length;
            var checked = $('input[name="terms"]:checked').length;
            $('#agreeAll').prop('checked', total === checked);
        });

        /* 상세약정서 '확인' 버튼 클릭 시 뱃지 상태 변경 */
        $(document).on('click', '.acc-btn-area .btn-primary', function() {
            var $item = $(this).closest('.acc-item');
            $item.find('.badge').removeClass('state-gray').addClass('state-blue').text('확인완료');
            $item.removeClass('active').find('.acc-body').slideUp(200);

            var total = $('.contract-item .badge').length;
            var confirmed = $('.contract-item .badge.state-blue').length;
            var $footerSubmitBtn = $('#footerWrap .btn-primary');
            if (total > 0 && total === confirmed) {
                $footerSubmitBtn.prop('disabled', false); 
            } else {
                $footerSubmitBtn.prop('disabled', true);
            }
        });
    }

    /* 로딩, 주소 API, 알럿 등 */
    function initEtcUI() {
        /* 로딩 팝업 자동 닫힘 */
        if ($('#popLoading').length > 0 && $('#popLoading').hasClass('on')) {
            setTimeout(function() {
                $('#popLoading').fadeOut(300, function() { $(this).removeClass('on'); });
                $('body').css('overflow', 'auto');
            }, 2000);
        }

        /* 주소 API */
        $(document).on('click', '#zonecode, #address', function() { alert('우편번호 검색을 통해 주소를 입력해 주세요.'); });
        $(document).on('click', '#btnPostcode', function() {
            new daum.Postcode({
                oncomplete: function(data) {
                    var addr = (data.userSelectedType === 'R') ? data.roadAddress : data.jibunAddress;
                    $('#zonecode').val(data.zonecode).removeClass('error');
                    $('#address').val(addr).removeClass('error');
                    $('#detailAddress').focus();
                    $('#zonecode').closest('.form-item, .card-box').find('.error-msg').hide();
                }
            }).open();
        });

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

    /*------------ 시뮬레이션용 납부일 변경----------- */
    function calcFirstPayDate() {
        if ($('.payment-result-box.pay-date').length === 0) return;

        var type = $('input[name="payType"]:checked').val(); /* next, current, direct */
        var dayVal = $('input[name="payDate"]:checked').val(); /* 5, 15, 25, 말일 */
        var direct = $('#payDirectInput').val();
        var $targetText = $('.payment-result-box.pay-date .date');

        /* 직접입력인 경우 */
        if (type === 'direct') {
            $targetText.text(direct ? direct.replace(/-/g, '.') : "");
            return;
        }

        /* 익월/당월 계산 로직 */
        var d = new Date();
        var targetMonth = d.getMonth() + (type === 'next' ? 1 : 0);
        var targetDay = (dayVal === '말일') ? 0 : dayVal; 
        
        var result = (dayVal === '말일') 
            ? new Date(d.getFullYear(), targetMonth + 1, 0) 
            : new Date(d.getFullYear(), targetMonth, targetDay);

        /* 화면에 출력 */
        var fmt = result.getFullYear() + '.' + 
                String(result.getMonth() + 1).padStart(2, '0') + '.' + 
                String(result.getDate()).padStart(2, '0');

        $targetText.text(fmt);
    }

    /* 값 변경될 때마다 함수 실행 */
    $(document).on('change', 'input[name="payType"], input[name="payDate"], #payDirectInput', calcFirstPayDate);
    

    calcFirstPayDate(); /* 시뮬레이션용 납부일 변경 함수 (추후 제거 가능) */

    initFormControls();
    initAccordion();
    initEtcUI();
});
