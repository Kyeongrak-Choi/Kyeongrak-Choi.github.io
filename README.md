# Kyeongrak 기술 블로그

`posts` 폴더에 Markdown 파일을 추가하면 홈과 글 목록에 자동으로 표시되는 GitHub Pages 블로그입니다.

## 파일 구조

```text
.
├── index.html                  # 홈과 최근 글
├── posts.html                  # 전체 글 목록
├── post.html                   # Markdown 글을 보여주는 공용 페이지
├── 404.html
├── .nojekyll
├── assets/
│   ├── css/style.css
│   └── js/posts.js             # 글 검색·목록·Markdown 렌더링
└── posts/
    └── Encore/
        └── 2026_08_1weeks.md
```

## 새 글 작성하기

`posts` 아래 원하는 폴더에 `.md` 파일을 추가합니다. 목록을 직접 수정할 필요가 없습니다.

```markdown
---
title: 글 제목
date: 2026-08-12
description: 목록에 표시할 한 줄 설명
tags: [JavaScript, GitHub]
---

# 글 제목

본문을 Markdown으로 작성합니다.
```

- 하위 폴더는 제한 없이 사용할 수 있습니다. 예: `posts/Encore/week1.md`
- `title`이 없으면 첫 번째 `# 제목` 또는 파일 이름을 사용합니다.
- `date`가 없으면 파일 이름의 `2026_08_12` 같은 날짜를 사용합니다.
- `description`이 없으면 본문의 첫 문단을 사용합니다.
- 변경 사항을 GitHub의 `main` 브랜치에 올린 뒤 목록에 반영됩니다.

## 동작 방식

브라우저에서 GitHub의 공개 저장소를 조회해 `posts` 아래의 모든 `.md` 파일을 찾습니다. 각 파일의 front matter를 읽어 최신 날짜순으로 보여주고, 글을 클릭하면 `post.html`에서 Markdown 본문을 표시합니다.

저장소 이름이나 계정을 바꿀 경우 `assets/js/posts.js` 위쪽의 `CONFIG`에서 `owner`, `repo`, `branch`를 수정하세요.

## GitHub Pages 배포

저장소의 **Settings → Pages → Build and deployment**에서 `Deploy from a branch`, `main`, `/(root)`를 선택합니다. `.nojekyll`이 포함되어 있어 별도의 Jekyll 빌드 없이 그대로 배포됩니다.

> 글 목록은 GitHub에 올라간 파일을 기준으로 만들어지므로, 파일을 PC에만 저장한 상태에서는 새 글이 나타나지 않습니다.
