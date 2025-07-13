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
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('출석');
  const data  = sheet.getDataRange().getValues();
  const today = Utilities.formatDate(new Date(), TIMEZONE, DATE_FORMAT);

  return data.filter((row, i) => {
    if (i === 0) return true;  // 헤더 유지
    const ts = new Date(row[3]);
    if (isNaN(ts.getTime())) return false;
    return Utilities.formatDate(ts, TIMEZONE, DATE_FORMAT) === today;
  });
}
