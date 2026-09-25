// Notes: plain Markdown files in /notes, listed in notes/notes.json.
// To add a note, drop a new .md file in /notes and add an entry to notes.json.
(function () {
  const list = document.getElementById('noteList');
  const view = document.getElementById('noteView');
  const tagBar = document.getElementById('noteTags');
  if (!list || !view) return;

  const slug = new URLSearchParams(window.location.search).get('n');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const arrow = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  // Internal links get the same curtain transition as the rest of the site
  const bindLinks = root => {
    root.querySelectorAll('a[data-note-link]').forEach(a => {
      a.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (typeof leaveTo === 'function') { e.preventDefault(); leaveTo(a.href, a.dataset.label || 'Notes'); }
      });
    });
  };

  const refresh = () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); };

  function showList(notes) {
    const tags = ['All', ...new Set(notes.flatMap(n => n.tags || []))];
    tagBar.innerHTML = tags.map((t, i) => `<button class="tool-tab${i ? '' : ' is-active'}" type="button" data-tag="${esc(t)}" aria-pressed="${!i}">${esc(t)}</button>`).join('');

    list.innerHTML = notes.map((n, i) => `
      <a class="note-card" href="notes.html?n=${encodeURIComponent(n.slug)}" data-note-link data-label="Note" data-tags="${esc((n.tags || []).join('|'))}">
        <span class="note-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="note-main">
          <span class="note-meta">${fmtDate(n.date)}${(n.tags || []).map(t => `<span class="note-tag">${esc(t)}</span>`).join('')}</span>
          <strong class="note-title">${esc(n.title)}</strong>
          <span class="note-summary">${esc(n.summary || '')}</span>
        </span>
        <span class="note-go">${arrow}</span>
      </a>`).join('');
    bindLinks(list);

    tagBar.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      tagBar.querySelectorAll('button').forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      const shown = [];
      list.querySelectorAll('.note-card').forEach(card => {
        const match = tag === 'All' || card.dataset.tags.split('|').includes(tag);
        card.hidden = !match;
        if (match) shown.push(card);
      });
      if (window.gsap) gsap.fromTo(shown, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
      refresh();
    }));

    if (window.gsap) gsap.from(list.querySelectorAll('.note-card'), { opacity: 0, y: 30, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.3 });
    refresh();
  }

  function showNote(notes, slugValue) {
    const note = notes.find(n => n.slug === slugValue);
    if (!note) { showList(notes); return; }
    document.body.classList.add('is-note');
    document.title = `${note.title} | Alfred Boakye`;
    tagBar.hidden = true;
    list.hidden = true;
    view.hidden = false;
    view.innerHTML = '<p class="note-empty">Loading&hellip;</p>';

    fetch(`notes/${encodeURIComponent(note.slug)}.md`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(md => {
        const words = md.trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.round(words / 200));
        const index = notes.indexOf(note);
        const next = notes[(index + 1) % notes.length];
        view.innerHTML = `
          <a class="note-back" href="notes.html" data-note-link data-label="Notes">${arrow}<span>All notes</span></a>
          <header class="note-header">
            <span class="note-meta">${fmtDate(note.date)} &middot; ${minutes} min read${(note.tags || []).map(t => `<span class="note-tag">${esc(t)}</span>`).join('')}</span>
            <h1 class="note-heading">${esc(note.title)}</h1>
          </header>
          <div class="note-body">${marked.parse(md)}</div>
          <footer class="note-footer">
            ${next && next !== note ? `<a class="note-next" href="notes.html?n=${encodeURIComponent(next.slug)}" data-note-link data-label="Note"><small>Next note</small><strong>${esc(next.title)}</strong>${arrow}</a>` : ''}
            <a class="pill pill-solid" href="contact.html" data-note-link data-label="Contact">Have a project in mind? Let's talk ${arrow}</a>
          </footer>`;
        bindLinks(view);
        if (window.gsap) gsap.from(view.children, { opacity: 0, y: 30, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.3 });
        refresh();
      })
      .catch(() => { view.innerHTML = '<p class="note-empty">This note could not be loaded. <a href="notes.html">Back to all notes</a></p>'; });
  }

  fetch('notes/notes.json')
    .then(r => r.json())
    .then(notes => {
      notes.sort((a, b) => b.date.localeCompare(a.date));
      slug ? showNote(notes, slug) : showList(notes);
    })
    .catch(() => { list.innerHTML = '<p class="note-empty">Notes could not be loaded right now.</p>'; });
})();
