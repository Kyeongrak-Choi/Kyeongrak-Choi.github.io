(() => {
  "use strict";

  const CONFIG = {
    owner: "Kyeongrak-Choi",
    repo: "Kyeongrak-Choi.github.io",
    branch: "main",
    postsDirectory: "posts/"
  };

  const API_ROOT = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}`;
  const RAW_ROOT = `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}`;

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function parseFrontMatter(markdown, path) {
    const normalized = markdown.replace(/^\uFEFF/, "");
    const match = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    const data = {};
    let body = normalized;

    if (match) {
      body = normalized.slice(match[0].length);
      for (const line of match[1].split("\n")) {
        const separator = line.indexOf(":");
        if (separator < 0) continue;
        const key = line.slice(0, separator).trim().toLowerCase();
        let value = line.slice(separator + 1).trim();
        value = value.replace(/^['"]|['"]$/g, "");
        data[key] = value;
      }
    }

    const firstHeading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
    const filename = decodeURIComponent(path.split("/").pop().replace(/\.md$/i, ""));
    const title = data.title || firstHeading || filename.replaceAll(/[-_]/g, " ");
    const description = data.description || firstParagraph(body) || "";
    const tags = parseTags(data.tags);
    const category = path.split("/").slice(1, -1).join(" / ");
    const date = data.date || dateFromFilename(filename);

    return { path, title, description, tags, category, date, body };
  }

  function parseTags(value = "") {
    return value
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  }

  function firstParagraph(markdown) {
    return markdown
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .find((part) => part && !/^(#|>|-|\*|```)/.test(part))
      ?.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "") || "";
  }

  function dateFromFilename(filename) {
    const match = filename.match(/(20\d{2})[-_](\d{1,2})(?:[-_](\d{1,2}))?/);
    if (!match) return "";
    return `${match[1]}-${match[2].padStart(2, "0")}-${(match[3] || "01").padStart(2, "0")}`;
  }

  function displayDate(value) {
    if (!value) return "";
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}. ${match[2]}. ${match[3]}.` : value;
  }

  async function fetchPostPaths() {
    const response = await fetch(`${API_ROOT}/git/trees/${CONFIG.branch}?recursive=1`, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const result = await response.json();
    return result.tree
      .filter((item) => item.type === "blob")
      .map((item) => item.path)
      .filter((path) => path.startsWith(CONFIG.postsDirectory) && /\.md$/i.test(path));
  }

  async function fetchMarkdown(path) {
    const response = await fetch(`${RAW_ROOT}/${path.split("/").map(encodeURIComponent).join("/")}`);
    if (!response.ok) throw new Error(`Markdown ${response.status}`);
    return response.text();
  }

  async function loadPosts() {
    const paths = await fetchPostPaths();
    const posts = await Promise.all(
      paths.map(async (path) => parseFrontMatter(await fetchMarkdown(path), path))
    );
    return posts.sort((a, b) => {
      const byDate = (b.date || "").localeCompare(a.date || "");
      return byDate || b.path.localeCompare(a.path, "ko");
    });
  }

  function renderPostCard(post) {
    const url = `post.html?path=${encodeURIComponent(post.path)}`;
    const tags = post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
    const context = [post.category, displayDate(post.date)].filter(Boolean).join(" · ");
    return `
      <article class="post-item">
        <a class="post-link" href="${url}">
          <div>
            <h2>${escapeHtml(post.title)}</h2>
            ${post.description ? `<p>${escapeHtml(post.description)}</p>` : ""}
          </div>
          <div class="post-meta">
            ${context ? `<span>${escapeHtml(context)}</span>` : ""}
            ${tags ? `<ul class="tag-list" aria-label="태그">${tags}</ul>` : ""}
          </div>
        </a>
      </article>`;
  }

  async function renderLists() {
    const containers = [...document.querySelectorAll("[data-post-list]")];
    if (!containers.length) return;

    try {
      const posts = await loadPosts();
      for (const container of containers) {
        const category = container.dataset.postCategory?.trim().toLowerCase();
        const filtered = category
          ? posts.filter((post) => post.category.toLowerCase() === category)
          : posts;
        const limit = Number(container.dataset.postLimit) || filtered.length;
        const visible = filtered.slice(0, limit);
        container.innerHTML = visible.length
          ? visible.map(renderPostCard).join("")
          : '<p class="post-status">아직 등록된 글이 없습니다.</p>';
        container.setAttribute("aria-busy", "false");
      }
    } catch (error) {
      console.error(error);
      for (const container of containers) {
        container.innerHTML = '<p class="post-status post-error">글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>';
        container.setAttribute("aria-busy", "false");
      }
    }
  }

  function inlineMarkdown(text) {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  function markdownToHtml(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let paragraph = [];
    let listType = "";
    let inCode = false;
    let code = [];
    let codeLanguage = "";

    const flushParagraph = () => {
      if (paragraph.length) html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    };
    const closeList = () => {
      if (listType) html.push(`</${listType}>`);
      listType = "";
    };

    for (const line of lines) {
      const fence = line.match(/^```\s*([\w-]*)/);
      if (fence) {
        if (inCode) {
          html.push(`<pre><code class="language-${escapeHtml(codeLanguage)}">${escapeHtml(code.join("\n"))}</code></pre>`);
          code = [];
          codeLanguage = "";
          inCode = false;
        } else {
          flushParagraph();
          closeList();
          inCode = true;
          codeLanguage = fence[1] || "text";
        }
        continue;
      }
      if (inCode) {
        code.push(line);
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      const unordered = line.match(/^\s*[-*]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
      const quote = line.match(/^>\s?(.*)$/);

      if (heading) {
        flushParagraph(); closeList();
        const level = Math.min(heading[1].length + 1, 6);
        html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      } else if (unordered || ordered) {
        flushParagraph();
        const type = ordered ? "ol" : "ul";
        if (listType !== type) { closeList(); html.push(`<${type}>`); listType = type; }
        html.push(`<li>${inlineMarkdown((unordered || ordered)[1])}</li>`);
      } else if (quote) {
        flushParagraph(); closeList();
        html.push(`<blockquote><p>${inlineMarkdown(quote[1])}</p></blockquote>`);
      } else if (/^---+$/.test(line.trim())) {
        flushParagraph(); closeList(); html.push("<hr>");
      } else if (!line.trim()) {
        flushParagraph(); closeList();
      } else {
        paragraph.push(line.trim());
      }
    }

    if (inCode) html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    flushParagraph();
    closeList();
    return html.join("\n");
  }

  async function renderPost() {
    const container = document.querySelector("[data-post-view]");
    if (!container) return;

    const path = new URLSearchParams(location.search).get("path") || "";
    const safePath = path;
    if (!safePath.startsWith(CONFIG.postsDirectory) || !/\.md$/i.test(safePath) || safePath.includes("..")) {
      container.innerHTML = '<p class="post-status post-error">올바른 글 주소가 아닙니다.</p>';
      container.setAttribute("aria-busy", "false");
      return;
    }

    try {
      const markdown = await fetchMarkdown(safePath);
      const post = parseFrontMatter(markdown, safePath);
      const tags = post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
      document.title = `${post.title} — Kyeongrak`;
      container.innerHTML = `
        <header class="article-header">
          <a class="back-link" href="posts.html"><span aria-hidden="true">←</span> 글 목록</a>
          <h1>${escapeHtml(post.title)}</h1>
          ${post.description ? `<p class="article-summary">${escapeHtml(post.description)}</p>` : ""}
          <div class="article-meta">
            ${post.category ? `<span>${escapeHtml(post.category)}</span><span aria-hidden="true">·</span>` : ""}
            ${post.date ? `<time datetime="${escapeHtml(post.date)}">${escapeHtml(displayDate(post.date))}</time>` : ""}
            ${tags ? `<ul class="tag-list" aria-label="태그">${tags}</ul>` : ""}
          </div>
        </header>
        <div class="article-body">${markdownToHtml(post.body)}</div>
        <footer class="article-footer"><a class="text-link" href="posts.html"><span aria-hidden="true">←</span> 모든 글로 돌아가기</a></footer>`;
      container.setAttribute("aria-busy", "false");
    } catch (error) {
      console.error(error);
      container.innerHTML = '<p class="post-status post-error">글을 불러오지 못했습니다. 파일이 저장소에 올라갔는지 확인해 주세요.</p>';
      container.setAttribute("aria-busy", "false");
    }
  }

  renderLists();
  renderPost();
})();
