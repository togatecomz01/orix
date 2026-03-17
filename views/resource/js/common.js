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

        /* 금지어 필터링, 에러 숨김, 인풋 title 추가 */
        $(document).on('input', '.form-input', function() {
            var id = this.id;
            var val = $(this).val(); /* 인풋에 입력된 밸류 저장 */

            if (REGEX_MAP[id]) {
                var clean = val.replace(REGEX_MAP[id], '');
                if (val !== clean) { $(this).val(clean); val = clean; }
            }
            $(this).attr('title', val); /* 인풋에 입력된 밸류값을 타이틀로 추가해서 보이게 */
            $(this).removeClass('error');
            $(this).closest('.form-row').find('.form-input').removeClass('error');
            $(this).closest('.form-item, .payment-setting, .card-box, .direct-input-wrap').find('.error-msg').hide();
        });

        /* 연락처 자동 포커스 */
        $(document).on('input', '#tel2', function() {
            if ($(this).val().length === 4) $('#tel3').focus();
        });

        /* 셀렉트박스 placeholder 제어 */
        $(document).on('change', 'select.form-input', function() {
            $(this).toggleClass('is-placeholder', $(this).val() === "");
            $(this).removeClass('error').closest('.form-item, .card-box').find('.error-msg').hide();
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

        /* 푸터 동의 체크박스에 따른 하단 버튼 활성화 */
        $(document).on('change', '#agreeTerm', function() {
            var isChecked = $(this).is(':checked');
            $('.footer-inner .btn-primary').toggleClass('disabled', !isChecked).attr('aria-disabled', !isChecked);
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


    /* 전자서명 팝업 (캔버스, 인감도장 업로드) */
    function initSignaturePopup() {
        var isCanvasDirty = false; /* 캔버스에 서명했는지 체크하는 변수 */
        var canvas = document.getElementById('signatureCanvas');
        var ctx = canvas ? canvas.getContext('2d') : null;
        var isDrawing = false; /* 마우스를 누르면 true, 떼면 false로 수시로 바뀔 플래그 변수 */

        /* 캔버스 리사이즈 함수 */
        function resizeCanvas() {
            var parent = canvas.parentElement;
            if (parent.offsetWidth === 0) return; 
            var tempImage = canvas.toDataURL(); /* 이미지 임시 저장 (내부 탭 전환시 쓸거) */
            canvas.width = parent.offsetWidth; canvas.height = parent.offsetHeight;
            ctx.lineWidth = 2; ctx.strokeStyle = "#000"; ctx.lineCap = "round"; ctx.lineJoin = "round";
            var img = new Image(); img.onload = function() { ctx.drawImage(img, 0, 0); }; img.src = tempImage;
        }

        /* 전자서명 팝업 열기 (캔버스 때문에 따로 관리)*/
        $(document).on('click', '.btn-open-sign', function() {
            $('#popSignature').addClass('on');
            $('body').css('overflow', 'hidden');
            if (typeof resizeCanvas === 'function') setTimeout(resizeCanvas, 100);
        });
        /* 클릭시 리사이즈 함수 호출이라 샘플 페이지에서 작동하도록 리사이즈 함수 재호출 */
        if ($('#popSignature').hasClass('on')) {
            setTimeout(function() {
                resizeCanvas();
            }, 100); 
        }
        /* 전자서명 팝업 닫기 및 취소, 유효성 검사 */
        $(document).on('click', '#popSignature .btn-pop-close, #popSignature .btn-close-pop, #popSignature .btn-secondary', function(e) {
            e.preventDefault();
            var confirmMsg = $(this).hasClass('btn-secondary') 
                ? "전자서명 중단 시, 입력하신 서명 및 인감도장 정보는 저장되지 않습니다. 전자서명을 중단하시겠습니까?" 
                : "지금 창을 닫으시면 입력하신 서명 및 인감도장 정보가 저장되지 않습니다. 창을 닫으시겠습니까?";

            if (confirm(confirmMsg)) {
                $('#popSignature').removeClass('on');
                $('body').css('overflow', 'auto');
                
                if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); isCanvasDirty = false; $('.placeholder-txt').show(); }
                $('#stampFile').val('');
                $('.stamp-upload-box').removeClass('uploaded');
                $('.view-uploaded').hide(); $('.view-default').show();
                $('.tab-item').first().trigger('click');
            } 
        });

        /* 탭 로직 , 전자서명 내부 탭(캔버스) 공통*/
        $(document).on('click', '.tab-item', function() {
            var targetId = $(this).attr('data-tab');
            $(this).addClass('active').siblings().removeClass('active');
            $('#' + targetId).addClass('active').show().siblings('.tab-panel').removeClass('active').hide();
            if (targetId === 'tabSign1') setTimeout(resizeCanvas, 10);
        });

        /* 서명 캔버스 그리기 */
        if (canvas) {
            $(canvas).on('mousedown touchstart', function(e) {
                isDrawing = true;
                isCanvasDirty = true;
                ctx.beginPath();

                /* 캔버스가 화면 어디에 있는지에 대한 변수 */
                var offset = $(canvas).offset(); 

                /* 현재 클릭/터치한 지점의 좌표(x, y)를 계산하여 변수에 저장 */
                var x = (e.pageX || e.originalEvent.touches[0].pageX) - offset.left;
                var y = (e.pageY || e.originalEvent.touches[0].pageY) - offset.top;
                ctx.moveTo(x, y); /* 계산된 좌표로 펜의 시작점을 이동(moveto메서드 사용) */
                $('.placeholder-txt').hide();
            });
            $(canvas).on('mousemove touchmove', function(e) {
                if (!isDrawing) return; /* isDrawing=true가 아니면 실행 X*/
                var offset = $(canvas).offset();
                var x = (e.pageX || e.originalEvent.touches[0].pageX) - offset.left;
                var y = (e.pageY || e.originalEvent.touches[0].pageY) - offset.top;
                ctx.lineTo(x, y); /* 이전 지점에서 현재 지점까지 선을 연결해주는 메서드 */
                ctx.stroke(); /* 선을 실제로 화면에 그리게 해주는 메서드 */
                e.preventDefault();
            });
            $(document).on('mouseup touchend', function() { isDrawing = false; });
            $(document).on('click', '.btn-reset', function() { 
                ctx.clearRect(0, 0, canvas.width, canvas.height); 
                isCanvasDirty = false; $('.placeholder-txt').show(); 
            });
        }

        /* 파일 드래그 앤 드롭 및 선택 */
        $(document).on('dragover dragleave', '#popSignature .stamp-upload-box', function(e) { e.preventDefault(); e.stopPropagation(); });
        $(document).on('drop', '#popSignature .stamp-upload-box', function(e) {
            e.preventDefault(); e.stopPropagation();
            var files = e.originalEvent.dataTransfer.files;
            if (files && files.length > 0) { $('#stampFile')[0].files = files; $('#stampFile').trigger('change'); }
        });

        $(document).on('change', '#stampFile', function() {
            var file = this.files[0];
            if (file) {
                if (!file.name.toLowerCase().match(/(.*?)\.(jpg|jpeg|png)$/)) {
                    alert("지원하지 않는 파일 형식입니다. PNG 또는 JPG파일을 업로드해 주세요."); $(this).val(''); return;
                }
                if (file.size > 300 * 1024) {
                    alert("업로드 가능한 파일 용량을 초과하였습니다. 300kb 이하의 파일을 첨부해 주세요."); $(this).val(''); return;
                }
                if ($('.stamp-upload-box').hasClass('uploaded')) {
                    alert("이미 1개의 파일이 업로드 되어 있습니다. 이미지를 수정하시려면 기존 파일을 삭제한 후 다시 시도해주세요."); return;
                }
                $('.file-card .name').text(file.name);
                $('.file-card .size').text((file.size / 1024).toFixed(1) + 'kb');
                $('.stamp-upload-box').addClass('uploaded');
                $('.view-default').hide(); $('.view-uploaded').show();
            }
        });

        $(document).on('click', '#popSignature .btn-del-file', function() {
            $('#stampFile').val('');
            $('.stamp-upload-box').removeClass('uploaded');
            $('.view-uploaded').hide(); $('.view-default').show();
        });

        /* 전자 서명 팝업 제출 */
        $(document).on('click', '#popSignature .pop-footer .btn-primary, #btnFinalSubmit', function() {
            var hasSignature = isCanvasDirty;
            var hasStampFile = ($('#stampFile')[0] && $('#stampFile')[0].files.length > 0);

            if (!hasSignature && !hasStampFile) { alert("서명입력 또는 인감도장 업로드를 해주세요."); return false; }
            if (hasSignature && hasStampFile) { alert("서명입력과 인감도장 업로드 중 한가지 방식만 제출 가능합니다. 제출 방안 이외의 입력값을 초기화 또는 삭제해 주세요."); return false; }

            if (confirm("제출하신 이후에는 수정이 불가합니다. 전자서명을 제출 하시겠습니까?\n제출 후, 비대면 전자약정 절차에 따라, 법인공동인증서 인증이 요청됩니다.")) {
                $('#popSignature').removeClass('on');
                if ($('#popLoading').length > 0) { $('#popLoading').addClass('on').show(); $('body').css('overflow', 'hidden'); }
                setTimeout(function() { location.href = './ORIX-CRTF-DTAG-003.html'; }, 2000); 
            } else { return false; }
        });
    }


    /* 폼 최종 유효성 검사 */
    function initFormValidation() {
        function showInputError($el, msg) {
            $el.addClass('error');
            var $container = $el.closest('.form-item, .payment-setting, .card-box, .direct-input-wrap');
            var $errorMsg = $container.find('.error-msg');
            if ($errorMsg.length > 0) {
                if (!$errorMsg.data('original-msg')) $errorMsg.data('original-msg', $errorMsg.text());
                $errorMsg.text(msg !== null && msg !== "" ? msg : $errorMsg.data('original-msg')).show();
            }
        }

        $(document).on('click', '.footer-inner .btn-primary', function(e) {
            if ($(this).hasClass('disabled')) { e.preventDefault(); return false; }
            e.preventDefault();
            var targetHref = $(this).attr('href');

            $('.form-input').removeClass('error'); $('.error-msg').hide();

            /* 약관 검사 */
            var isTermsOk = true;
            $('input[name="terms"]').each(function() {
                if (!$(this).is(':checked')) {
                    var termName = $(this).closest('.acc-head').find('label').text().replace('(필수)', '').trim();
                    alert("'" + termName + "' 약관에 동의해 주세요."); isTermsOk = false; return false; 
                }
            });
            if (!isTermsOk) return false;

            /* 인풋 빈값 및 형식 검사 */
            var hasEmpty = false, hasFormat = false, $firstError = null;
            $('.form-input:visible:not(:disabled)').each(function() {
                var val = $(this).val() || ""; var id = this.id;
                if (val.trim() === "") {
                    showInputError($(this), null); hasEmpty = true; if (!$firstError) $firstError = $(this);
                } else {
                    if (id === 'userAccount' && val.length < 10) { 
                        showInputError($(this), "계좌번호를 정확히 입력해 주세요."); hasFormat = true; if (!$firstError) $firstError = $(this);
                    }
                    if (id === 'emailDomain' && val.indexOf('.') === -1) {
                        showInputError($(this), "정확한 이메일 주소를 입력해 주세요."); hasFormat = true; if (!$firstError) $firstError = $(this);
                    }
                }
            });

            /* 연락처 자리수 검사 */
            if ($('#tel1').length > 0 && $('#tel1').is(':visible')) {
                var fullTel = ($('#tel1').val() || "") + ($('#tel2').val() || "") + ($('#tel3').val() || "");
                if ($('#tel1').val() && $('#tel2').val() && $('#tel3').val() && fullTel.length < 10) {
                    showInputError($('#tel1, #tel2, #tel3'), "11자리 이상 입력해 주세요."); hasFormat = true; if (!$firstError) $firstError = $('#tel2');
                }
            }

            if ($('#dateSelectArea').is(':visible') && !$('input[name="payDate"]:checked').length) hasEmpty = true;

            if (hasEmpty) { alert('입력되지 않은 정보가 있습니다. 모든 정보를 입력해주세요.'); if ($firstError) $firstError.focus(); return false; }
            if (hasFormat) { alert('유효하지 않은 형식이 포함되어 있습니다. 빨간색으로 표시된 부분을 수정해 주세요.'); if ($firstError) $firstError.focus(); return false; }

            /* 납부일 유효성 검사 */
            if ($('.payment-result-box.pay-date').length > 0) {
                var selectedDateText = $('.payment-result-box.pay-date .date').text(); /* 예: "2026.02.05" */
                
                if (selectedDateText !== "") {
                    var selectedVal = selectedDateText.replace(/\./g, ''); /* "20260205로 포맷팅" */
                    
                    var today = new Date();
                    var y = today.getFullYear();
                    var m = String(today.getMonth() + 1).padStart(2, '0');
                    var d = String(today.getDate()).padStart(2, '0');
                    var todayVal = y + m + d; // "20260224"

                    /* 선택된 날짜가 오늘보다 작으면 */
                    if (parseInt(selectedVal) < parseInt(todayVal)) {
                        alert('기준일 이전 납부일은 선택하실 수 없습니다.\n선택일 ' + selectedVal + ' | 기준일 ' + todayVal);
                        return false; /* 정상일시 실행 ㄴ */
                    }
                }
            }

            if (targetHref && targetHref !== "#") location.href = targetHref;
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

        /* PDF 다운로드 */
        $(document).on('click', '.acc-btn-area .btn-outline, .btn-download', function() {
            alert('PDF 파일을 다운로드합니다. (운영 반영 시 실제 파일이 내려받아집니다.)');
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
    initSignaturePopup();
    initFormValidation();
    initEtcUI();
});