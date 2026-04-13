<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width:1200px, initial-scale=1.0" />
    <title>공매입찰관리</title>

    <link href="../../resource/css/ui-util.css" rel="stylesheet" />
    <link href="../../resource/css/lib/tui-grid.css" rel="stylesheet" />

    <script src="../../resource/js/lib/jquery-1.11.3.min.js"></script>
    <script src="../../resource/js/lib/jquery.form.min.js"></script>
    <script src="../../resource/js/include.js"></script>
    <script>
        window.tui = window.tui || {};
        window.tui.DatePicker = window.tui.DatePicker || function () {};
        window.tui.Pagination = window.tui.Pagination || function () {};
        window.XLSX = window.XLSX || {};
    </script>
    <script src="../../resource/js/lib/tui-grid.js"></script>
</head>
<body>
    <div class="wrap">
        <!-- S: 사이드메뉴 -->
        <div data-include-path="../include/inc-nav.html"></div>
        <!-- E: 사이드메뉴 -->

        <main class="contentWrap">
            <!-- S: 시스템 상단 -->
            <section class="page-header">
                <h1>공매입찰 관리 시스템</h1>
                <div class="user-links">
                    <div class="user-info">
                        <span class="user-thumb">
                            <img src="../../resource/images/img_profile.png" alt="사용자 프로필" />
                        </span>
                        <span class="user-name">심규남(제로모티스)</span>
                    </div>
                    <a href="#none" class="btn-logout">로그아웃</a>
                </div>
            </section>
            <!-- E: 시스템 상단 -->

            <!-- S: 페이지 상단 -->
            <section class="page-control">
                <div class="control-header">
                    <h2>공매입찰관리</h2>
                    <div class="la-button">
                        <button type="button" class="btn-icon excel" data-popup-target="excelPopup">EXCEL</button>
                        <button type="button" class="btn-primary" id="searchBtn">조회</button>
                    </div>
                </div>
                <div class="form-content">
                    <div class="form-wrap">
                        <div class="form-group form-manage-no">
                            <div class="flex-row">
                                <label for="bidNo" class="label-tit">관리번호</label>
                                <div class="field-box">
                                    <select name="bidNo" id="bidNo">
                                        <option value="" selected="selected">선택해주세요.</option>
                                        <option value="240401">240401</option>
                                        <option value="240402">240402</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-group form-car-no">
                            <div class="flex-row">
                                <label for="carNo" class="label-tit">차량번호</label>
                                <div class="field-box">
                                    <input id="carNo" type="text" name="carNo" placeholder="차량번호" />
                                </div>
                            </div>
                        </div>
                        <div class="form-group form-maker">
                            <div class="flex-row">
                                <label for="maker" class="label-tit">제조사</label>
                                <div class="field-box">
                                    <select name="maker" id="maker">
                                        <option value="" selected="selected">선택해주세요.</option>
                                        <option value="현대">현대</option>
                                        <option value="기아">기아</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-group form-model">
                            <div class="flex-row">
                                <label for="carName" class="label-tit">차종</label>
                                <div class="field-box">
                                    <select name="carName" id="carName">
                                        <option value="" selected="selected">선택해주세요.</option>
                                        <option value="그랜저">그랜저</option>
                                        <option value="K5">K5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-group form-status">
                            <div class="flex-row">
                                <label for="contractYn" class="label-tit">구분</label>
                                <div class="field-box">
                                    <select name="contractYn" id="contractYn">
                                        <option value="" selected="selected">전체</option>
                                        <option value="낙찰">낙찰</option>
                                        <option value="유찰">유찰</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <!-- E: 페이지 상단 -->

            <!-- S: 본문 -->
            <section class="page-container">
                <div class="grid-content">
                    <div class="grid-head">
                        <h3>공매물건 목록</h3>
                        <div class="sm-button">
                            <button type="button" class="btn-primary disabled">입찰</button>
                            <button type="button" class="btn-icon bid disabled">일괄 입찰</button>
                            <button type="button" class="btn-icon download">공매입찰 기록</button>
                        </div>
                    </div>
                    <div class="grid-body">
                        <div class="grid-caption">
                            <div class="caption-left">
                                <input type="text" class="tag-end" id="bidStatNm" name="BID_STAT_NM" value="입찰 시간 종료" readonly />
                                <span class="total">Total: <span>251</span></span>
                            </div>
                            <ul class="m-dot">
                                <li>시작일시 : <input type="text" class="noline" id="bidStartText" readonly value="2026-03-09 12:00:00"></li>
                                <li>종료일시 : <input type="text" class="noline" id="bidEndText" readonly value="2026-03-11 17:00:00"></li>
                                <li>
                                    서버일시 :
                                    <span id="svtime" class="server-time">2026-03-24 13:50:00</span>
                                    <input type="hidden" id="gaptime" name="gaptime">
                                </li>
                            </ul>
                        </div>
                        <div id="grid"></div>
                    </div>
                </div>
            </section>
            <!-- E: 본문 -->
        </main>
    </div>

    <script>
        var grid;

        function parseDateTime(value) {
            var dateTime = value || '';
            var parts = dateTime.split(' ');
            var dateParts;
            var timeParts;

            if (parts.length < 2) {
                return null;
            }

            dateParts = parts[0].split('-');
            timeParts = parts[1].split(':');

            return new Date(
                parseInt(dateParts[0], 10),
                parseInt(dateParts[1], 10) - 1,
                parseInt(dateParts[2], 10),
                parseInt(timeParts[0], 10),
                parseInt(timeParts[1], 10),
                parseInt(timeParts[2], 10)
            );
        }

        function getCurrentBidItem(list) {
            var bidNo = $('#bidNo').val();
            var item = null;
            var i;

            if (bidNo) {
                for (i = 0; i < list.length; i += 1) {
                    if (list[i].BIDNO_IDX === bidNo) {
                        item = list[i];
                        break;
                    }
                }
            }

            if (!item && list.length) {
                item = list[0];
            }

            return item;
        }

        function setBidStatus(item) {
            var $bidStatNm = $('#bidStatNm');
            var serverTime = parseDateTime($('#svtime').text());
            var bidStart = item ? parseDateTime(item.BID_START_DATE) : null;
            var bidEnd = item ? parseDateTime(item.BID_END_DATE) : null;
            var statusText = '';

            if (!item) {
                $bidStatNm.val('');
                $bidStatNm.removeClass('tag-end tag-ing tag-success tag-error');
                $bidStatNm.css('color', '');
                $('#bidStartText').val('');
                $('#bidEndText').val('');
                return;
            }

            $('#bidStartText').val(item.BID_START_DATE);
            $('#bidEndText').val(item.BID_END_DATE);

            if (item.BID_STAT === 'AU110001') {
                statusText = '입찰 진행중';
            } else {
                statusText = item.BID_STAT_NM;
            }

            if (serverTime && bidStart && bidEnd) {
                if (serverTime.getTime() >= bidStart.getTime()) {
                    if (serverTime.getTime() <= bidEnd.getTime()) {
                        statusText = '입찰 진행중';
                    } else if (item.BID_STAT === 'AU110001') {
                        statusText = '입찰 시간 종료';
                    } else {
                        statusText = item.BID_STAT_NM;
                    }
                } else if (item.BID_STAT === 'AU110001') {
                    statusText = '입찰 시간 전';
                } else {
                    statusText = item.BID_STAT_NM;
                }
            }

            $bidStatNm.val(statusText);
            $bidStatNm.removeClass('tag-end tag-ing tag-success tag-error');

            if (statusText === '입찰 진행중') {
                $bidStatNm.addClass('tag-ing');
            } else if (statusText === '입찰 시간 종료' || statusText === '공매 완료') {
                $bidStatNm.addClass('tag-end');
            } else if (statusText === '입찰 시간 전') {
                $bidStatNm.addClass('tag-error');
            } else {
                $bidStatNm.addClass('tag-success');
            }

            if (item.BID_STAT === 'AU110009') {
                $bidStatNm.css('color', 'red');
            } else {
                $bidStatNm.css('color', 'black');
            }
        }

        function formatPriceToManwon(value) {
            var number = parseInt(value, 10);

            if (isNaN(number)) {
                return '';
            }

            return String(Math.floor(number / 10000)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        function getSampleData() {
            return [
                {
                    CAR_NO: '12가3456',
                    CAR_MAKER: '현대',
                    CAR_NAME: '그랜저',
                    CAR_MODEL: '2.5 익스클루시브',
                    CAR_COLOR: '검정',
                    CAR_OLD: '2022',
                    CAR_CC: '2497',
                    CAR_DRIVEKM: '32100',
                    CAR_PARK: '인천',
                    CAR_BODY_NO: 'KMH12345678901234',
                    BID_PRICE: '22900000',
                    BID_MAX_PRICE: '23500000',
                    BID_WINNER_MEM_ID: 'ABC오토',
                    CONTRACT_YN: '낙찰',
                    BIDNO_IDX: '240401',
                    BID_STAT: 'AU110001',
                    BID_STAT_NM: '입찰중',
                    BID_START_DATE: '2026-03-09 12:00:00',
                    BID_END_DATE: '2026-03-11 17:00:00'
                },
                {
                    CAR_NO: '34나7890',
                    CAR_MAKER: '기아',
                    CAR_NAME: 'K5',
                    CAR_MODEL: '2.0 프레스티지',
                    CAR_COLOR: '흰색',
                    CAR_OLD: '2021',
                    CAR_CC: '1999',
                    CAR_DRIVEKM: '41250',
                    CAR_PARK: '부천',
                    CAR_BODY_NO: 'KNAGB412345678901',
                    BID_PRICE: '18300000',
                    BID_MAX_PRICE: '18800000',
                    BID_WINNER_MEM_ID: '서울모터스',
                    CONTRACT_YN: '유찰',
                    BIDNO_IDX: '240402',
                    BID_STAT: 'AU110009',
                    BID_STAT_NM: '유찰',
                    BID_START_DATE: '2026-03-24 09:00:00',
                    BID_END_DATE: '2026-03-24 12:00:00'
                }
            ];
        }

        function filterSampleData() {
            var list = getSampleData();
            var bidNo = $('#bidNo').val();
            var carNo = $('#carNo').val();
            var maker = $('#maker').val();
            var carName = $('#carName').val();
            var contractYn = $('#contractYn').val();

            return $.grep(list, function (item) {
                if (bidNo && item.BIDNO_IDX !== bidNo) {
                    return false;
                }

                if (carNo && item.CAR_NO.indexOf(carNo) < 0) {
                    return false;
                }

                if (maker && item.CAR_MAKER !== maker) {
                    return false;
                }

                if (carName && item.CAR_NAME !== carName) {
                    return false;
                }

                if (contractYn && item.CONTRACT_YN !== contractYn) {
                    return false;
                }

                return true;
            });
        }

        function searchData() {
            var filteredList = filterSampleData();
            var currentItem = getCurrentBidItem(filteredList);

            if (!grid) {
                return;
            }

            grid.resetData(filteredList);
            setBidStatus(currentItem);
        }

        function loadSample() {
            var list = getSampleData();
            var currentItem = getCurrentBidItem(list);

            if (!grid) {
                return;
            }

            grid.resetData(list);
            setBidStatus(currentItem);
        }

        function createGrid() {
            if (!window.tui || !window.tui.Grid) {
                return;
            }

            grid = new tui.Grid({
                el: document.getElementById('grid'),
                usageStatistics: false,
                bodyHeight: 500,
                scrollX: true,
                scrollY: true,
                columns: [
                    { header: 'No', name: 'ROW_NUM', width: 60, align: 'center', sortable: false, formatter: function (value) { return value.row.rowKey + 1; } },
                    { header: '차량번호', name: 'CAR_NO', width: 100, sortable: true, filter: 'text' },
                    { header: '제조사', name: 'CAR_MAKER', width: 100, sortable: true, filter: 'text' },
                    { header: '차종', name: 'CAR_NAME', width: 110, sortable: true, filter: 'text' },
                    { header: '모델명', name: 'CAR_MODEL', width: 160, sortable: true, filter: 'text' },
                    { header: '색상', name: 'CAR_COLOR', width: 80, sortable: true, filter: 'text' },
                    { header: '연식', name: 'CAR_OLD', width: 70, align: 'center', sortable: true },
                    { header: '배기량', name: 'CAR_CC', width: 80, align: 'right', sortable: true },
                    { header: '주행거리', name: 'CAR_DRIVEKM', width: 90, align: 'right', sortable: true },
                    { header: '주차장', name: 'CAR_PARK', width: 90, sortable: true },
                    { header: '차대번호', name: 'CAR_BODY_NO', width: 180, sortable: true },
                    { header: '입찰가격(만원)', name: 'BID_PRICE', width: 110, align: 'right', sortable: true, formatter: function (value) { return formatPriceToManwon(value.value); } },
                    { header: '최고가(만원)', name: 'BID_MAX_PRICE', width: 110, align: 'right', sortable: true, formatter: function (value) { return formatPriceToManwon(value.value); } },
                    { header: '낙찰구분', name: 'CONTRACT_YN', width: 90, align: 'center', sortable: true },
                    { header: '낙찰업체', name: 'BID_WINNER_MEM_ID', width: 130, sortable: true }
                ],
                columnOptions: {
                    resizable: true
                }
            });
        }

        $(function () {
            createGrid();
            loadSample();

            $('#searchBtn').on('click', function () {
                searchData();
            });

            $('#bidNo').on('change', function () {
                setBidStatus(getCurrentBidItem(getSampleData()));
            });
        });
    </script>
</body>
</html>
