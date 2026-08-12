# Kyeongrak 기술 블로그

Jekyll이나 별도 테마 없이 HTML과 CSS만으로 만든 GitHub Pages용 정적 블로그입니다.

## 파일 구조

```text
.
├── index.html                  # 홈
├── posts.html                  # 글 목록
├── 404.html                    # 없는 페이지 안내
├── .nojekyll                   # Jekyll 처리 비활성화
├── assets/
│   └── css/
│       └── style.css           # 전체 디자인
└── posts/
    └── getting-started.html    # 글 상세 예시
```

## 로컬에서 확인하기

별도 설치 없이 `index.html`을 브라우저로 열어도 됩니다. 링크와 404 동작까지 실제 웹사이트처럼 확인하려면 이 폴더에서 간단한 로컬 서버를 실행하세요.

```bash
python -m http.server 8000
```

그다음 브라우저에서 `http://localhost:8000`을 엽니다.

## GitHub Pages에 배포하기

1. GitHub에서 `Kyeongrak-Choi.github.io` 저장소를 만듭니다.
2. 이 폴더 안의 파일을 저장소 최상단에 넣고 `main` 브랜치에 올립니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Build and deployment**에서 `Deploy from a branch`를 선택합니다.
5. 브랜치는 `main`, 폴더는 `/(root)`를 선택하고 저장합니다.
6. 잠시 뒤 `https://kyeongrak-choi.github.io/`에서 확인합니다.

## 새 글 추가하기

1. `posts/getting-started.html`을 복사해 파일 이름과 내용을 바꿉니다.
2. 새 글의 `<title>`, 설명, 제목, 날짜, 태그, 본문을 수정합니다.
3. `posts.html`의 글 목록에 새 글 링크를 추가합니다.
4. 홈에도 노출하려면 `index.html`의 최근 글 목록에 같은 링크를 추가합니다.

사이트 이름과 소개 문구는 각 HTML 파일에서 `Kyeongrak`을 검색해 원하는 이름으로 바꿀 수 있습니다. 색상은 `assets/css/style.css` 맨 위의 `:root` 변수에서 한 번에 수정할 수 있습니다.
