/* Progressive enhancement. Pages and navigation also work without JavaScript. */
const themeButton = document.querySelector('#theme-toggle');
function syncThemeLabel() {themeButton?.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '切换浅色主题' : '切换深色主题');}
syncThemeLabel();
themeButton?.addEventListener('click', () => {const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';document.documentElement.dataset.theme = theme;try {localStorage.setItem('piglet-theme', theme);} catch {}syncThemeLabel();});
document.addEventListener('keydown', event => {if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName) && !event.target.isContentEditable) {event.preventDefault();const input = document.querySelector('#search-input');if (input) input.focus();else location.href = '/search/';}});
for (const button of document.querySelectorAll('.copy-code')) button.addEventListener('click', async () => {const code = button.closest('.code-block').querySelector('code');const text = code.innerText.replace(/\n$/,'');try {await navigator.clipboard.writeText(text);button.textContent = '已复制';} catch {const selection = getSelection();const range = document.createRange();range.selectNodeContents(code);selection.removeAllRanges();selection.addRange(range);button.textContent = '已选中，请手动复制';}setTimeout(() => {button.textContent = '复制代码';}, 2500);});
const tocLinks = [...document.querySelectorAll('.toc nav a')];
if ('IntersectionObserver' in window && tocLinks.length) {const visible = new Set();const observer = new IntersectionObserver(entries => {for (const entry of entries) entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id);const current = tocLinks.find(link => visible.has(decodeURIComponent(link.hash.slice(1))));if (current) {for (const link of tocLinks) link.removeAttribute('aria-current');current.setAttribute('aria-current','location');}}, {rootMargin:'0px 0px -60% 0px'});for (const link of tocLinks) {const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));if (heading) observer.observe(heading);}}
const input = document.querySelector('#search-input');
if (input) {
 const status = document.querySelector('#search-status');const results = document.querySelector('#search-results');let indexPromise;let revision=0;
 const load = () => indexPromise ??= fetch('/assets/search-index.json').then(response => {if (!response.ok) throw new Error('加载失败');return response.json();}).catch(error => {indexPromise=undefined;throw error;});
 async function search() {
  const thisRevision=++revision;const query = input.value.trim();const terms=query.toLocaleLowerCase().split(/\s+/).filter(Boolean);results.replaceChildren();
  const next = new URL(location.href);query ? next.searchParams.set('q',query) : next.searchParams.delete('q');history.replaceState(null,'',next);
  if (!terms.length) {status.textContent='输入关键词开始搜索。';return;}
  status.textContent='正在寻找笔记…';
  try {const posts = await load();if (thisRevision!==revision) return;const matches=posts.filter(p => terms.every(term => [p.title,p.summary,p.category,...p.tags,p.text].join(' ').toLocaleLowerCase().includes(term))).sort((a,b)=>Number(b.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()))-Number(a.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())));
   status.textContent = matches.length ? '找到 '+matches.length+' 篇相关笔记。' : '没有找到相关笔记，换个关键词试试。';
   for (const post of matches) {const article=document.createElement('article');article.className='post-card';const meta=document.createElement('div');meta.className='post-meta';meta.textContent=post.category.toUpperCase()+' · '+post.date+' · '+post.minutes+' 分钟阅读';const h=document.createElement('h3');const link=document.createElement('a');link.href=post.url;link.textContent=post.title;h.append(link);const p=document.createElement('p');p.textContent=post.summary;const tags=document.createElement('div');tags.className='tags';tags.textContent=post.tags.map(t=>'# '+t).join('   ');article.append(meta,h,p,tags);results.append(article);}
  } catch {if (thisRevision===revision) status.textContent='暂时无法加载搜索内容，请重试或浏览文章归档。';}
 }
 let timer;input.addEventListener('input',()=>{revision++;clearTimeout(timer);timer=setTimeout(search,160);});input.closest('form').addEventListener('submit',event=>{event.preventDefault();clearTimeout(timer);search();});input.value=new URLSearchParams(location.search).get('q')||'';if(input.value)search();
}
