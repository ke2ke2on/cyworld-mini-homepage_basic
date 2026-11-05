# Cyworld Mini Homepage

2000년대 싸이월드 미니홈피를 모티브로 만든 정적 웹페이지입니다.
HTML과 CSS로 화면을 구성하고, 다이어리 페이지에만 약간의 JavaScript를 사용합니다.
별도의 빌드나 설치 없이 브라우저에서 바로 열어 볼 수 있습니다.

## 페이지 구성

| 페이지 | 파일 | 설명 |
| --- | --- | --- |
| 홈 | `cyworld/home.html` | 프로필, 업데이트 소식, 미니룸 |
| 다이어리 | `cyworld/diary.html` | 달력과 일기 목록, 비밀 일기 보기 |
| 사진첩 | `cyworld/picture.html` | 사진과 제목 목록 |
| 방명록 | `cyworld/guestbook.html` | 방문자가 남긴 글 목록 |

모든 페이지는 왼쪽 프로필 영역과 오른쪽 메뉴 탭(홈 / 다이어리 / 사진첩 / 방명록)을 공통으로 사용하며, 탭을 눌러 페이지를 오갈 수 있습니다.
프로필의 "파도타기"에 마우스를 올리면 외부 링크 목록이 펼쳐집니다.

### 비밀 일기 보기

다이어리 페이지의 "비밀 일기 보기" 버튼을 누르면 내 컴퓨터의 `.txt` 파일을 선택할 수 있고, 선택한 파일의 내용이 일기 형태로 화면에 표시됩니다.
파일은 브라우저 안에서만 읽으며 서버로 전송되지 않습니다.

## 실행 방법

저장소를 내려받은 뒤 `cyworld/home.html`을 브라우저로 열면 됩니다.

```bash
git clone https://github.com/ke2ke2on/cyworld-mini-homepage_basic.git
```

로컬 서버로 확인하고 싶다면 `cyworld` 폴더에서 아래 명령을 실행한 뒤 `http://localhost:8000/home.html`에 접속합니다.

```bash
python -m http.server 8000
```

VS Code의 Live Server 확장으로 열어도 됩니다.

> 웹폰트와 아이콘을 CDN에서 불러오므로 인터넷 연결이 필요합니다.
> 연결이 없으면 기본 글꼴로 표시됩니다.

## 폴더 구조

```
cyworld-mini-homepage_basic/
├── README.md
└── cyworld/
    ├── home.html
    ├── diary.html
    ├── picture.html
    ├── guestbook.html
    └── static/
        ├── layout.css       # 공통 레이아웃 (책 표지, 프로필, 메뉴 탭)
        ├── font.css         # 웹폰트 선언
        ├── home.css
        ├── diary.css
        ├── picture.css
        ├── guestbook.css
        └── images/          # 프로필, 사진첩, 미니룸, 배경 패턴 이미지
```

## 사용한 외부 리소스

- [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR) (Google Fonts): 본문 글꼴
- 눈누 웹폰트 (jsDelivr CDN): 네오둥근모, 교보손글씨, KOTRA BOLD
- [Font Awesome](https://fontawesome.com/) Kit: 다이어리의 자물쇠 아이콘, 방명록의 홈 아이콘
