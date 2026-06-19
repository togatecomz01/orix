(function () {
    var target = document.getElementById('footerWrap');

    if (!target) {
        return;
    }

    target.innerHTML = [
        '    <div class="footer-inner">',
        '        <div class="footer-copy">',
        '            <span>ORIX Capital Korea Corporation</span>',
        '            <p>Copyrightⓒ 2026 ORIX Capital Korea Corporation. All right reserved.</p>',
        '        </div>',
        '        <div class="footer-add">',
        '           <p>06210 서울시 강남구 테헤란로 306(역삼동) 카이트타워13층</p>',
        '           <p>',
        '               <span>대표이사 : 박철수</span>',
        '               <span>사업자등록번호 : 120-86-63282</span>',
        '           </p>',
        '        </div>',
        '    </div>',
    ].join('');

    if (typeof window.initSideNav === 'function') {
        window.initSideNav();
    }
})();
