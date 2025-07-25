/**
 * Code.gs
 */

const SPREADSHEET_ID = '1WkzQatq6vebfwIBVebPcKO3PeWfG7oDn7EizpJPo8yo';
const TIMEZONE       = 'Asia/Seoul';
const DATE_FORMAT    = 'yyyy-MM-dd';

const PROP_CODES     = 'codes_';
const PROP_SELECTED  = 'selected_';

// 웹앱 진입점
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('index')
    .setTitle('출석체크');
}

// 출석 등록 및 인증검사
function checkAttendance(gen, name, shower, code) {
  if (!gen || !name || !shower) {
    return '❌ 기수, 이름, 샤워장 이용여부를 모두 입력해주세요.';
  }
  const codeNum = parseInt(code, 10);
  if (isNaN(codeNum)) {
    return '❌ 인증 숫자를 올바르게 입력해주세요.';
  }

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('출석');
  const today = Utilities.formatDate(new Date(), TIMEZONE, DATE_FORMAT);

  const props      = PropertiesService.getScriptProperties();
  const codesKey   = PROP_CODES + today;
  const selectKey  = PROP_SELECTED + today;

  // 오늘의 3가지 혹은 고정된 코드 가져오기
  let codes = props.getProperty(codesKey);
  if (!codes) {
    codes = generateRandomCodes().join(',');
    props.setProperty(codesKey, codes);
  }
  const codeArr = codes.split(',').map(n => Number(n));
  const selected = props.getProperty(selectKey);

  if (!selected) {
    if (!codeArr.includes(codeNum)) {
      return `❌ 인증 실패: 오늘의 인증 숫자 중 하나(${codeArr.join(', ')})를 입력해주세요.`;
    }
    props.setProperty(selectKey, String(codeNum));
  } else {
    if (Number(selected) !== codeNum) {
      return `❌ 인증 실패: 오늘의 코드(${selected})와 일치하지 않습니다.`;
    }
  }

  // 출석 기록 추가
  sheet.appendRow([gen, name, shower, new Date(), codeNum]);
  return '✅ 출석 완료!';
}

// 오늘의 코드 조회
function getTodayCode() {
  const today = Utilities.formatDate(new Date(), TIMEZONE, DATE_FORMAT);
  const props = PropertiesService.getScriptProperties();
  const codesKey  = PROP_CODES    + today;
  const selectKey = PROP_SELECTED + today;

  let codes = props.getProperty(codesKey);
  if (!codes) {
    codes = generateRandomCodes().join(',');
    props.setProperty(codesKey, codes);
  }

  const selected = props.getProperty(selectKey);
  if (selected) {
    return [Number(selected)];
  } else {
    return codes.split(',').map(n => Number(n));
  }
}

// 1~100 중 무작위 3개 생성
function generateRandomCodes() {
  const arr = Array.from({ length: 100 }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}

// 출석 내역(오늘자만) 조회
function getAttendance() {
  // const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  // const sheet = ss.getSheetByName('출석');
  // const data  = sheet.getDataRange();
  // const values = data.getValues();
  // const today = Utilities.formatDate(new Date(), TIMEZONE, DATE_FORMAT);


  // 1. 현재 연결된 스프레드시트 열기
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 2. 읽고 싶은 시트 선택 (예: 'Sheet1')
  const sheet = spreadsheet.getSheetByName('출석');

  if (!sheet) {
    return "❌ 시트를 찾지 못했습니다.";
  }

  // 3. 데이터 범위 가져오기 (실제 데이터가 있는 부분만)
  const range = sheet.getDataRange();

  // 4. 셀 값을 2차원 배열로 가져오기
  const values = range.getValues().map((e, i) => {
    if(i == 0) return e;

    const gen    = e[0];
    const name   = e[1];
    const shower = e[2];
    const time = Utilities.formatDate(e[3], TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    const code   = e[4];
    
    return [gen, name, shower, time, code];
  });
  
  if (!values) {
    return "❌ 시트를 찾지 못했습니다.";
  }
  const today = Utilities.formatDate(new Date(), TIMEZONE, DATE_FORMAT);

  // 헤더 + 오늘 날짜 데이터만 필터링
  const filtered = values.filter((row, i) => {
    if (i === 0) return false; // 헤더
    const time_date = Utilities.formatDate(new Date(row[3]), TIMEZONE, DATE_FORMAT);
    return time_date === today;
  });

  return filtered;
}
