const postText = document.getElementById("postText");
const publishButton = document.getElementById("publishButton");
const timeline = document.getElementById("timeline");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

const emojiTrigger = document.getElementById("emojiTrigger");
const emojiMenu = document.getElementById("emojiMenu");

const declarationTrigger = document.getElementById("declarationTrigger");
const declarationMenu = document.getElementById("declarationMenu");
const declarationLabel = document.getElementById("declarationLabel");

const privacyTrigger = document.getElementById("privacyTrigger");
const privacyMenu = document.getElementById("privacyMenu");
const privacyLabel = document.getElementById("privacyLabel");

const messageNav = document.getElementById("messageNav");
const messageBadge = document.getElementById("messageBadge");
const messageView = document.getElementById("messageView");
const messageBack = document.getElementById("messageBack");
const messageEmpty = document.getElementById("messageEmpty");
const noticeThread = document.getElementById("noticeThread");
const noticeMessage = document.getElementById("noticeMessage");
const noticeTime = document.getElementById("noticeTime");
const systemPreview = document.getElementById("systemPreview");
const systemNoticeTime = document.getElementById("systemNoticeTime");

const privateNoticeText = "有多名平台用户认为你的帖子可能包含 AI 生成或 AI 辅助生成内容，但当前帖子未进行 AI 标注。该提示仅你本人可见，其他用户不会看到。";
const privateStripPrefix = "有多名平台用户认为你的帖子可能包含 AI 生成或 AI 辅助生成内容";
const postMenuItems = [
  "分享",
  "置顶",
  "推广",
  "编辑微博（限会员）",
  "转换为粉丝可见",
  "转换为朋友圈可见",
  "转换为自己可见",
  "删除",
  "开启评论精选",
];

let selectedDeclaration = "";
let selectedPrivacy = "公开";
let uploadedImages = [];
let hasSystemNotice = false;

function closeMenus() {
  emojiMenu.classList.remove("open");
  declarationMenu.classList.remove("open");
  privacyMenu.classList.remove("open");
  document.querySelectorAll(".post-menu.open").forEach((menu) => menu.classList.remove("open"));
  document.querySelectorAll(".post-menu-trigger[aria-expanded='true']").forEach((button) => button.setAttribute("aria-expanded", "false"));
  emojiTrigger.setAttribute("aria-expanded", "false");
  declarationTrigger.setAttribute("aria-expanded", "false");
  privacyTrigger.setAttribute("aria-expanded", "false");
}

function toggleMenu(menu, trigger) {
  const isOpen = menu.classList.contains("open");
  closeMenus();
  if (!isOpen) {
    menu.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
  }
}

function updatePublishState() {
  const hasText = postText.value.trim().length > 0;
  publishButton.disabled = !hasText && uploadedImages.length === 0;
}

function insertAtCursor(text) {
  const start = postText.selectionStart ?? postText.value.length;
  const end = postText.selectionEnd ?? postText.value.length;
  postText.value = `${postText.value.slice(0, start)}${text}${postText.value.slice(end)}`;

  const nextCursor = start + text.length;
  postText.setSelectionRange(nextCursor, nextCursor);
  updatePublishState();
}

function resetComposer() {
  postText.value = "";
  selectedDeclaration = "";
  declarationLabel.textContent = "内容声明";
  declarationTrigger.classList.remove("is-selected");
  selectedPrivacy = "公开";
  privacyLabel.textContent = "公开";
  uploadedImages = [];
  imageInput.value = "";
  renderPreview();
  updatePublishState();
}

function renderPreview() {
  imagePreview.innerHTML = "";
  imagePreview.hidden = uploadedImages.length === 0;

  uploadedImages.forEach((src, index) => {
    const item = document.createElement("div");
    item.className = "preview-item";

    const img = document.createElement("img");
    img.src = src;
    img.alt = "待发布图片";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      uploadedImages.splice(index, 1);
      renderPreview();
      updatePublishState();
    });

    item.append(img, remove);
    imagePreview.appendChild(item);
  });
}

function readImages(files) {
  const imageFiles = [...files].filter((file) => file.type.startsWith("image/"));
  imageFiles.forEach((file) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      uploadedImages.push(reader.result);
      renderPreview();
      updatePublishState();
    });
    reader.readAsDataURL(file);
  });
}

function formatNoticeTime() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

function sendSystemNotice() {
  hasSystemNotice = true;
  noticeMessage.textContent = privateNoticeText;
  noticeTime.textContent = formatNoticeTime();
  systemPreview.textContent = "发来了一条系统通知";
  systemNoticeTime.textContent = "刚刚";
  messageBadge.textContent = "1";
  messageBadge.hidden = false;
  messageNav.classList.add("has-unread");
  messageEmpty.hidden = true;
  noticeThread.hidden = false;
}

function openMessageView() {
  closeMenus();
  document.body.classList.add("message-mode");
  messageView.hidden = false;
  messageBadge.hidden = true;
  messageNav.classList.remove("has-unread");

  messageEmpty.hidden = hasSystemNotice;
  noticeThread.hidden = !hasSystemNotice;
}

function closeMessageView() {
  document.body.classList.remove("message-mode");
  messageView.hidden = true;
}

function createUploadedImageGrid(images) {
  if (!images.length) return null;

  const grid = document.createElement("div");
  grid.className = "uploaded-images";
  images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "发布图片";
    grid.appendChild(img);
  });
  return grid;
}

function createAiNote() {
  const note = document.createElement("div");
  note.className = "ai-note";

  const alertIcon = document.createElement("span");
  alertIcon.className = "ai-alert-icon";
  alertIcon.setAttribute("aria-hidden", "true");
  alertIcon.textContent = "!";

  const prefix = document.createElement("span");
  prefix.className = "ai-note-main";
  prefix.textContent = privateStripPrefix;

  const suffix = document.createElement("span");
  suffix.className = "ai-note-visibility";
  suffix.textContent = "该提示仅你本人可见。";

  const lock = document.createElement("span");
  lock.className = "lock";
  lock.setAttribute("aria-hidden", "true");
  suffix.prepend(lock);

  note.append(alertIcon, prefix, suffix);
  return note;
}

function createPostMenu() {
  const wrap = document.createElement("div");
  wrap.className = "post-menu-wrap";

  const trigger = document.createElement("button");
  trigger.className = "post-menu-trigger";
  trigger.type = "button";
  trigger.title = "更多";
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");
  trigger.textContent = "⌄";

  const menu = document.createElement("div");
  menu.className = "post-menu";
  menu.setAttribute("role", "menu");

  postMenuItems.forEach((label) => {
    const option = document.createElement("button");
    option.type = "button";
    option.setAttribute("role", "menuitem");
    option.textContent = label;
    menu.appendChild(option);
  });

  wrap.append(trigger, menu);
  return wrap;
}

function createPost({ text, images, privacy, showAiNote }) {
  const article = document.createElement("article");
  article.className = "post card";

  const avatar = document.createElement("div");
  avatar.className = "post-avatar nav-avatar";

  const body = document.createElement("div");
  body.className = "post-body";

  const header = document.createElement("header");
  header.className = "post-header";

  const authorBlock = document.createElement("div");
  const author = document.createElement("strong");
  author.textContent = "实验用户";
  const meta = document.createElement("p");
  meta.textContent = `刚刚 来自 微博网页版 ${privacy}`;
  authorBlock.append(author, meta);

  header.append(authorBlock, createPostMenu());

  body.appendChild(header);

  if (text) {
    const postCopy = document.createElement("p");
    postCopy.className = "post-text";
    postCopy.textContent = text;
    body.appendChild(postCopy);
  }

  const grid = createUploadedImageGrid(images);
  if (grid) body.appendChild(grid);

  if (showAiNote) {
    body.appendChild(createAiNote());
  }

  const footer = document.createElement("footer");
  footer.className = "post-actions";
  footer.innerHTML = `
    <span><i class="action-icon icon-repost" aria-hidden="true"></i>0</span>
    <span><i class="action-icon icon-comment" aria-hidden="true"></i>0</span>
    <span><i class="action-icon icon-like" aria-hidden="true"></i>0</span>
  `;
  body.appendChild(footer);

  article.append(avatar, body);
  return article;
}

function publishPost() {
  const text = postText.value.trim();
  if (!text && uploadedImages.length === 0) {
    postText.focus();
    return;
  }

  const shouldSendSystemNotice = selectedDeclaration !== "ai";
  const post = createPost({
    text,
    images: [...uploadedImages],
    privacy: selectedPrivacy,
    showAiNote: false,
  });

  timeline.prepend(post);

  if (shouldSendSystemNotice) {
    sendSystemNotice();
  }

  resetComposer();
}

emojiTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMenu(emojiMenu, emojiTrigger);
});

emojiMenu.addEventListener("click", (event) => {
  const option = event.target.closest("button[data-emoji]");
  if (!option) return;

  insertAtCursor(option.dataset.emoji);
  closeMenus();
  postText.focus();
});

declarationTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMenu(declarationMenu, declarationTrigger);
});

declarationMenu.addEventListener("click", (event) => {
  const option = event.target.closest("button[data-value]");
  if (!option) return;

  selectedDeclaration = option.dataset.value;
  declarationLabel.textContent = option.dataset.label;
  declarationTrigger.classList.toggle("is-selected", Boolean(selectedDeclaration));
  declarationMenu.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button === option));
  closeMenus();
});

privacyTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMenu(privacyMenu, privacyTrigger);
});

privacyMenu.addEventListener("click", (event) => {
  const option = event.target.closest("button[data-label]");
  if (!option) return;

  selectedPrivacy = option.dataset.label;
  privacyLabel.textContent = selectedPrivacy;
  privacyMenu.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button === option));
  closeMenus();
});

messageNav.addEventListener("click", (event) => {
  event.stopPropagation();
  openMessageView();
});

messageBack.addEventListener("click", closeMessageView);

document.addEventListener("click", closeMenus);
document.addEventListener("click", (event) => {
  const trigger = event.target.closest(".post-menu-trigger");
  if (!trigger) return;

  event.stopPropagation();
  const menu = trigger.nextElementSibling;
  const wasOpen = menu.classList.contains("open");
  closeMenus();
  if (!wasOpen) {
    menu.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenus();
    closeMessageView();
  }
});

postText.addEventListener("input", updatePublishState);
imageInput.addEventListener("change", (event) => readImages(event.target.files));
publishButton.addEventListener("click", publishPost);

updatePublishState();
