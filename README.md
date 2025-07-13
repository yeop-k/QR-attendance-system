# QR-attendance-system

스쿼시 동아리 QR 출석 자동화 및 벌금 정산 시스템

📁 폴더 구조

QR-attendance-system/
├── Code.gs # Google Apps Script 서버 로직
├── index.html # 사용자 UI 화면
└── README.md # 프로젝트 설명


## ✨ 주요 기능
- QR 기반 출석 체크 & 인증 숫자 자동 생성
- Google Sheets 연동 출석 저장
- 매일 인증 코드 자동 생성 (1~100 중 3개)
- 사용자 입력 검증 및 시각화된 출석 테이블 제공

## ⚙️ 설치 및 실행 방법
1. Google 스프레드시트 생성 → ‘출석’, ‘인증코드’ 시트 생성
2. Apps Script 프로젝트에 Code.gs, index.html 파일 업로드
3. `SPREADSHEET_ID` 변수에 본인 시트 ID 입력
4. `generateTodayCode()` 함수에 시간 기반 트리거 설정 (매일 자정)
5. ‘웹 앱으로 배포’ → 링크 공유로 사용 가능

## 🧪 사용 예시
- 사용자: 기수, 이름, 샤워 여부, 인증번호 입력
- 시스템: 인증번호 검증 → 출석시트 저장 → 테이블 갱신

## 📄 화면 예시
- 출석 체크 폼  
- 인증 코드 힌트  
- 출석 내역 테이블  
(→ 나중에 스크린샷 캡처해서 붙이면 더 좋음)

## 🧩 코드 구성
- `doGet()` : 웹앱 시작점
- `checkAttendance()` : 출석 등록 로직
- `generateTodayCode()` : 매일 인증번호 3개 생성
- `getTodayCode()` : 오늘 코드 조회
- `getAttendance()` : 전체 출석 불러오기
