$(function () {
    /*---------------------------
        입력 클리어 버튼 (공용)
        - .ipt-clear 래퍼 없으면 자동 생성
        - readonly 허용(= 버튼 생성 막지 않음)
    ---------------------------*/
    function ensureClear($input) {
        // 래퍼 보장
        var $wrap = $input.closest('.ipt-clear');

        // disabled만 막음 (readonly는 허용)
        var disabled = $input.prop('disabled');
        var hasVal = ($input.val() || '').trim() !== '' && !disabled;
        var $btn = $wrap.find('> .btn-clear');
    
        if (hasVal && !$btn.length) {
            $('<button type="button" class="btn-clear" aria-label="입력 지우기" title="지우기">\xd7</button>')
            .appendTo($wrap)
            .on('click', function (e) {
                e.preventDefault();
    
                // 1) 텍스트 초기화
                $input
                    .data('full-value', '')
                    .attr('title', '')
                    .val('')
                    .removeClass('up')
                    .trigger('input')
                    .focus();
    
                // 2) 같은 .ipt-file 컨테이너가 있다면 파일도 초기화
                var $box = $wrap.closest('.ipt-file');
                if ($box.length) {
                    var $file = $box.find('input[type="file"]').first();
                    if ($file.length) $file.val('').trigger('change'); // 내부 상태/리스너 동기화
                }
    
                // 3) 버튼 제거
                $(this).remove();
            });
        } else if (!hasVal && $btn.length) {
            $btn.remove();
        }
    }
    
    function bindClearOnce($input) {
        if ($input.data('clear-bound')) return;
        $input
            .on('input', function () { ensureClear($(this)); })
            .on('keyup change propertychange', function () { ensureClear($(this)); }); // IE 대응
        $input.data('clear-bound', true);
        ensureClear($input); // 초기 상태 반영
    }
    
    function initClearable(scope) {
        (scope || $(document)).find('input[type="text"]').each(function () {
            bindClearOnce($(this));
        });
    }

    /*---------------------------
        비밀번호 보기 버튼 (공용)
        - .ipt-clear.password 내부 input 대상
        - 입력값 있을 때만 버튼 노출
        - 누르고 있는 동안만 평문 노출
    ---------------------------*/
    var $activePasswordInput = null;

    function setPasswordType($input, isMasked) {
        var targetType = isMasked ? 'password' : 'text';

        if ($input.attr('type') !== targetType) {
            $input.attr('type', targetType);
        }
    }

    function ensurePasswordToggle($input) {
        var $wrap = $input.closest('.ipt-clear.password');
        var disabled = $input.prop('disabled');
        var hasVal = ($input.val() || '') !== '' && !disabled;
        var $btn = $wrap.find('> .btn-password-toggle');

        if (!hasVal) {
            setPasswordType($input, true);

            if ($btn.length) {
                $btn.remove();
            }

            if ($activePasswordInput && $activePasswordInput[0] === $input[0]) {
                $activePasswordInput = null;
            }

            return;
        }

        if ($btn.length) return;

        $('<button type="button" class="btn-password-toggle" aria-label="비밀번호 보기" title="비밀번호 보기"></button>')
            .appendTo($wrap)
            .on('mousedown touchstart', function (e) {
                e.preventDefault();
                setPasswordType($input, false);
                $activePasswordInput = $input;
            })
            .on('mouseup mouseleave touchend touchcancel blur', function () {
                setPasswordType($input, true);

                if ($activePasswordInput && $activePasswordInput[0] === $input[0]) {
                    $activePasswordInput = null;
                }
            })
            .on('keydown', function (e) {
                if (e.which === 13 || e.which === 32) {
                    e.preventDefault();
                    setPasswordType($input, false);
                    $activePasswordInput = $input;
                }
            })
            .on('keyup', function (e) {
                if (e.which === 13 || e.which === 32) {
                    setPasswordType($input, true);

                    if ($activePasswordInput && $activePasswordInput[0] === $input[0]) {
                        $activePasswordInput = null;
                    }
                }
            });
    }

    function bindPasswordToggleOnce($input) {
        if ($input.data('password-toggle-bound')) return;

        $input
            .on('input keyup change propertychange', function () {
                ensurePasswordToggle($(this));
            })
            .on('blur', function () {
                setPasswordType($(this), true);
            });

        $input.data('password-toggle-bound', true);
        ensurePasswordToggle($input);
    }

    function initPasswordToggle(scope) {
        (scope || $(document)).find('.ipt-clear.password input').each(function () {
            bindPasswordToggleOnce($(this));
        });
    }

    /*---------------------------
        인풋 title (공용)
        - password 제외
    ---------------------------*/
    function syncInputTitle($input) {
        $input.attr('title', $input.val() || '');
    }

    function bindInputTitleOnce($input) {
        if ($input.data('title-bound')) return;

        $input
            .on('input keyup change propertychange', function () {
                syncInputTitle($(this));
            });

        $input.data('title-bound', true);
        syncInputTitle($input);
    }

    function initInputTitle(scope) {
        (scope || $(document)).find('input').not('[type="password"], [type="hidden"], [type="file"], [type="radio"], [type="checkbox"], [type="button"], [type="submit"], [type="reset"]').each(function () {
            bindInputTitleOnce($(this));
        });
    }

    /*---------------------------
        영문/숫자 입력 (공용)
        - .alnum
    ---------------------------*/
    function bindAlnumOnce($input) {
        if ($input.data('alnum-bound')) return;

        $input.on('input keyup change propertychange', function () {
            var value = this.value.replace(/[^A-Za-z0-9]/g, '');
            $(this).val(value);
        });

        $input.data('alnum-bound', true).triggerHandler('input');
    }

    function initAlnumInput(scope) {
        (scope || $(document)).find('.alnum').each(function () {
            bindAlnumOnce($(this));
        });
    }

    /*---------------------------
        말줄임 입력 (공용)
        - .ellipsis
    ---------------------------*/
    function bindEllipsisOnce($input) {
        if ($input.data('ellipsis-bound')) return;

        $input
            .on('focus', function () {
                var fullValue = $(this).data('full-value');

                if (typeof fullValue !== 'undefined') {
                    $(this).val(fullValue);
                }
            })
            .on('input keyup change propertychange', function () {
                var fullValue = this.value.replace(/[^A-Za-z0-9]/g, '');

                $(this).val(fullValue).data('full-value', fullValue);
            })
            .on('blur', function () {
                var $this = $(this);
                var fullValue = $this.data('full-value');

                if (typeof fullValue === 'undefined') {
                    fullValue = ($this.val() || '').replace(/[^A-Za-z0-9]/g, '');
                    $this.data('full-value', fullValue);
                }

                $this.val(fullValue.length > 15 ? fullValue.substring(0, 15) + '...' : fullValue);
                syncInputTitle($this);
            });

        $input.data('ellipsis-bound', true);
        $input.triggerHandler('input');
        $input.triggerHandler('blur');
    }

    function initEllipsisInput(scope) {
        (scope || $(document)).find('.ellipsis').each(function () {
            bindEllipsisOnce($(this));
        });
    }

    /*---------------------------
        파일 업로더 (컨테이너별 바인딩)
        - .ipt-file 내부 요소만 참조 → 다중 업로더 OK
    ---------------------------*/
    function initFileUploader() {
        $('.ipt-file').each(function () {
            var $box   = $(this);
            var $text  = $box.find('.uploadInput').first();       // 파일명 표시용(대개 readonly)
            var $file  = $box.find('input[type="file"]').first(); // 실제 파일 인풋

            // (선택) 텍스트 클릭 시 파일 선택 열기
            if ($text.length && $file.length) {
                $text.off('click.file').on('click.file', function () {
                $file.trigger('click');
                });
            }
        
            // 파일 선택 → 텍스트 갱신 + 클리어 버튼 반영
            $box.off('change.file').on('change.file', 'input[type="file"]', function () {
                var name = (this.files && this.files.length) ? this.files[0].name : '';
                if ($text.length) {
                $text.val(name)[name ? 'addClass' : 'removeClass']('up').trigger('input'); // ensureClear 호출 유도
                }
            });
        
            // 이 텍스트 인풋도 클리어 가능하도록 바인딩
            if ($text.length) bindClearOnce($text);
        });
    }

    // 숫자 인풋 3자리 콤마
    $(document).on('input', 'input[inputmode=numeric]', function () {
        if (window.commaFormatter && typeof window.commaFormatter.format === 'function') {
            window.commaFormatter.format(this);
        }
    });

    // 버튼 클릭 전 말줄임 원본 복원
    $(document).on('click', 'button, a, input[type="submit"]', function () {
        if ($(this).hasClass('btn-clear')) return;

        $('.ellipsis').each(function () {
            var fullValue = $(this).data('full-value');

            if (typeof fullValue !== 'undefined') {
                $(this).val(fullValue);
            }
        });
    });

    $(document).on('mouseup.passwordToggle touchend.passwordToggle touchcancel.passwordToggle', function () {
        if (!$activePasswordInput || !$activePasswordInput.length) return;

        setPasswordType($activePasswordInput, true);
        $activePasswordInput = null;
    });

    // 업로더/클리어 초기화
    initFileUploader();
    initClearable();
    initPasswordToggle();
    initInputTitle();
    initAlnumInput();
    initEllipsisInput();
});
