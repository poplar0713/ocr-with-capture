# ocr-with-capture [chrome Extenstion]

### 1. 껍데기 만들기
- 내용 
  * 크롬 확장프로그램 형식으로 개발
  * ~html2canvas 사용하여 화면 캡쳐 및 클립보드에 저장 or 파일로 저장 기능 구현~
    - html2canvas를 활용해 기능 구현 완료하였으나, 일부 요소 캡쳐 안되는 문제 확인
  * chrome.tabs.captureVisibleTab 을 사용하여 화면 캡쳐 기능 구현 (완료)


### 2. OCR 기능 붙여보기
- 내용
  * Naver CLOVA OCR 인식 api 연결 및 테스트
  * api로 캡쳐한 사진(페이지)을 전송하는 기능
  * OCR 결과값을 사용자에게 표시
