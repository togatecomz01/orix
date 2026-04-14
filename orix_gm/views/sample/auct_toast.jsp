<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>공매 조회 Toast Grid</title>

<link rel="stylesheet" href="https://uicdn.toast.com/grid/latest/tui-grid.min.css" />
<script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
<script src="https://uicdn.toast.com/tui.code-snippet/latest/tui-code-snippet.min.js"></script>
<script src="https://uicdn.toast.com/tui.pagination/latest/tui-pagination.min.js"></script>
<script src="https://uicdn.toast.com/grid/latest/tui-grid.min.js"></script>

<style>
    body { font-family: Gulim, Dotum, Arial, sans-serif; font-size:12px; margin:15px; }
    h2 { margin:0 0 10px 0; }
    .search-box {
        border:1px solid #cfcfcf;
        background:#f8f8f8;
        padding:10px;
        margin-bottom:10px;
    }
    .search-box table { border-collapse:collapse; width:100%; }
    .search-box th, .search-box td { padding:4px; text-align:left; }
    .search-box input {
        width:150px;
        height:22px;
        border:1px solid #bdbdbd;
        padding-left:4px;
        font-size:12px;
    }
    .btn {
        border:1px solid #888;
        background:#efefef;
        padding:4px 10px;
        cursor:pointer;
        font-size:12px;
    }
    .msg {
        margin-top:8px;
        color:#333;
    }
    .warn { color:#b00020; font-weight:bold; }
    .ok { color:#006400; font-weight:bold; }
    #grid { margin-top:10px; }
    .help {
        border:1px solid #ddd;
        background:#fffff4;
        padding:8px;
        margin-top:10px;
        line-height:1.6;
    }
</style>
</head>
<body>

<h2>공매 조회</h2>

<div class="search-box">
    <table>
        <tr>
            <th>공매번호</th>
            <td><input type="text" id="bidNo"></td>
            <th>시작일</th>
            <td><input type="text" id="startDate" placeholder="YYYYMMDD"></td>
            <th>종료일</th>
            <td><input type="text" id="endDate" placeholder="YYYYMMDD"></td>
        </tr>
        <tr>
            <th>차량번호</th>
            <td><input type="text" id="carNo"></td>
            <th>제조사</th>
            <td><input type="text" id="maker"></td>
            <th>차종</th>
            <td><input type="text" id="carName"></td>
        </tr>
        <tr>
            <th>업체코드</th>
            <td><input type="text" id="comNo"></td>
            <th>사이트코드</th>
            <td><input type="text" id="siteCode" value="AA100001"></td>
            <td colspan="2">
                <button type="button" class="btn" onclick="searchData()">조회</button>
                <button type="button" class="btn" onclick="loadSample()">샘플</button>
                <button type="button" class="btn" onclick="resetForm()">초기화</button>
            </td>
        </tr>
    </table>
    <div class="msg" id="msg">준비됨</div>
</div>

<div id="grid"></div>

<div class="help">
    1. 이 화면은 Toast Grid 로 실제 데이터를 표시할 수 있습니다.<br/>
    2. 데이터는 <b>auct_toast_data.jsp</b> 가 가져옵니다.<br/>
    3. ORIX 연결이 안 되면 샘플 데이터가 표시되도록 해두었습니다.
</div>

<script>
var grid = new tui.Grid({
    el: document.getElementById('grid'),
    bodyHeight: 500,
    rowHeaders: ['rowNum'],
    scrollX: true,
    scrollY: true,
    columns: [
        { header: '공매번호', name: 'BIDNO_IDX', width: 90, sortable: true, filter: 'text' },
        { header: '차량번호', name: 'CAR_NO', width: 100, sortable: true, filter: 'text' },
        { header: '제조사', name: 'CAR_MAKER', width: 100, sortable: true, filter: 'text' },
        { header: '차종', name: 'CAR_NAME', width: 110, sortable: true, filter: 'text' },
        { header: '모델명', name: 'CAR_MODEL', width: 160, sortable: true, filter: 'text' },
        { header: '연식', name: 'CAR_OLD', width: 70, align: 'center', sortable: true },
        { header: '배기량', name: 'CAR_CC', width: 80, align: 'right', sortable: true },
        { header: '주행거리', name: 'CAR_DRIVEKM', width: 90, align: 'right', sortable: true },
        { header: '주차장', name: 'CAR_PARK', width: 90, sortable: true },
        { header: '입찰참여수', name: 'BID_OPEN_CNT', width: 90, align: 'right', sortable: true },
        { header: '최고가업체', name: 'BID_MAX_MEM_ID', width: 130, sortable: true },
        { header: '최고가', name: 'BID_MAX_PRICE', width: 100, align: 'right', sortable: true },
        { header: '2순위', name: 'BID_2ST_PRICE', width: 100, align: 'right', sortable: true },
        { header: '낙찰구분', name: 'CONTRACT_YN', width: 80, sortable: true },
        { header: '전표관리번호', name: 'AC_JPNO', width: 100, sortable: true },
        { header: '계산서번호', name: 'TAX_NO', width: 100, sortable: true },
        { header: '계약번호', name: 'KY_NO', width: 100, sortable: true },
        { header: '마감사유', name: 'CLOSE_REASON_NM', width: 120, sortable: true },
        { header: '이전일자', name: 'OWNER_CHANGE_DATE', width: 90, sortable: true },
        { header: '차대번호', name: 'CAR_BODY_NO', width: 180, sortable: true }
    ]
});

function setMsg(text, cls) {
    var el = $('#msg');
    el.removeClass('ok warn');
    if (cls) el.addClass(cls);
    el.text(text);
}

function searchData() {
    setMsg('조회 중...', '');

    $.ajax({
        url: 'auct_toast_data.jsp',
        type: 'GET',
        dataType: 'json',
        cache: false,
        data: {
            siteCode: $('#siteCode').val(),
            bidNo: $('#bidNo').val(),
            bidStart: $('#startDate').val(),
            bidEnd: $('#endDate').val(),
            carNo: $('#carNo').val(),
            maker: $('#maker').val(),
            carName: $('#carName').val(),
            comNo: $('#comNo').val()
        },
        success: function(res) {
            if (res.success) {
                grid.resetData(res.list || []);
                setMsg('조회 완료 : ' + (res.list ? res.list.length : 0) + '건 / ' + (res.mode || ''), 'ok');
            } else {
                grid.resetData([]);
                setMsg('실패 : ' + (res.message || '오류'), 'warn');
            }
        },
        error: function(xhr) {
            grid.resetData([]);
            setMsg('AJAX 오류 : ' + xhr.status, 'warn');
        }
    });
}

function loadSample() {
    grid.resetData([
        {
            BIDNO_IDX: '240401',
            CAR_NO: '12가3456',
            CAR_MAKER: '현대',
            CAR_NAME: '그랜저',
            CAR_MODEL: '2.5 익스클루시브',
            CAR_OLD: '2022',
            CAR_CC: '2497',
            CAR_DRIVEKM: '32100',
            CAR_PARK: '인천',
            BID_OPEN_CNT: '5',
            BID_MAX_MEM_ID: 'ABC오토',
            BID_MAX_PRICE: '23500000',
            BID_2ST_PRICE: '22800000',
            CONTRACT_YN: '낙찰',
            AC_JPNO: '',
            TAX_NO: '',
            KY_NO: 'KY240401',
            CLOSE_REASON_NM: '',
            OWNER_CHANGE_DATE: '20260407',
            CAR_BODY_NO: 'KMH12345678901234'
        },
        {
            BIDNO_IDX: '240402',
            CAR_NO: '34나7890',
            CAR_MAKER: '기아',
            CAR_NAME: 'K5',
            CAR_MODEL: '2.0 프레스티지',
            CAR_OLD: '2021',
            CAR_CC: '1999',
            CAR_DRIVEKM: '41250',
            CAR_PARK: '부천',
            BID_OPEN_CNT: '3',
            BID_MAX_MEM_ID: '서울모터스',
            BID_MAX_PRICE: '18800000',
            BID_2ST_PRICE: '18000000',
            CONTRACT_YN: '유찰',
            AC_JPNO: '',
            TAX_NO: '',
            KY_NO: 'KY240402',
            CLOSE_REASON_NM: '최저가미달',
            OWNER_CHANGE_DATE: '',
            CAR_BODY_NO: 'KNAGB412345678901'
        }
    ]);
    setMsg('샘플 데이터 표시', 'ok');
}

function resetForm() {
    $('#bidNo,#startDate,#endDate,#carNo,#maker,#carName,#comNo').val('');
    $('#siteCode').val('AA100001');
    grid.resetData([]);
    setMsg('초기화됨', '');
}
</script>

</body>
</html>
