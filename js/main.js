(function () {
    'use strict';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* preloader typing */
    const word = 'WAVELENGTH';
    const preWord = document.getElementById('preWord');
    if (preWord) {
        word.split('').forEach((ch, i) => {
            const s = document.createElement('span');
            s.textContent = ch;
            s.style.animationDelay = (i * 0.045) + 's';
            preWord.appendChild(s);
        });
    }
    window.addEventListener('load', () => {
        setTimeout(() => {
            const el = document.getElementById('preloader');
            if (el) el.classList.add('hide');
        }, 900);
    });
    setTimeout(() => {
        const el = document.getElementById('preloader');
        if (el) el.classList.add('hide');
    }, 2600);

    /* custom cursor */
    const dot = document.getElementById('cdot');
    const ring = document.getElementById('cring');
    if (dot && ring) {
        let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
        window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
        (function loop() {
            rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
            ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
            requestAnimationFrame(loop);
        })();
        document.querySelectorAll('[data-hover]').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('big'));
            el.addEventListener('mouseleave', () => ring.classList.remove('big'));
        });
        document.querySelectorAll('[data-hover-big]').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('big'));
            el.addEventListener('mouseleave', () => ring.classList.remove('big'));
        });
    }

    /* scroll progress + header */
    const progress = document.getElementById('progress');
    const header = document.getElementById('siteHeader');
    if (progress && header) {
        window.addEventListener('scroll', () => {
            const h = document.documentElement;
            const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
            progress.style.width = pct + '%';
            header.classList.toggle('scrolled', h.scrollTop > 40);
        });
    }

    /* reveal on scroll */
    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

    /* counters */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        const cio = new IntersectionObserver((entries) => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    const el = en.target;
                    const target = parseInt(el.dataset.count, 10);
                    let cur = 0;
                    const step = Math.max(1, Math.round(target / 60));
                    const t = setInterval(() => {
                        cur += step;
                        if (cur >= target) { cur = target; clearInterval(t); }
                        el.textContent = cur.toLocaleString();
                    }, 20);
                    cio.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(c => cio.observe(c));
    }

    /* hero waveform bars */
    const heroWave = document.getElementById('heroWave');
    if (heroWave) {
        const barCount = 60;
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('i');
            const h = 20 + Math.sin(i * 0.35) * 40 + Math.random() * 30;
            bar.style.height = Math.max(8, h) + 'px';
            if (!reduced) {
                bar.style.animation = `waveBar ${1.2 + Math.random() * 1.4}s ease-in-out ${Math.random() * 1.5}s infinite`;
            }
            heroWave.appendChild(bar);
        }
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `@keyframes waveBar { 0%,100%{ transform:scaleY(0.6); opacity:0.4;} 50%{ transform:scaleY(1); opacity:0.85;} }`;
        document.head.appendChild(styleSheet);
    }

    /* card tilt */
    document.querySelectorAll('.card').forEach(card => {
        if (reduced) return;
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(600px) rotateX(${-py * 6}deg) rotateY(${px * 6}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    /* magnetic buttons */
    document.querySelectorAll('[data-hover-big]').forEach(btn => {
        if (reduced) return;
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.25;
            const y = (e.clientY - r.top - r.height / 2) * 0.5;
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    /* animated wave canvas divider */
    const canvas = document.getElementById('waveCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth * devicePixelRatio;
            canvas.height = canvas.offsetHeight * devicePixelRatio;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        let t0 = 0;
        const colors = ['#ff4d6d99', '#ffc14588', '#7c6cf099'];
        function drawWaves() {
            const w = canvas.offsetWidth, h = canvas.offsetHeight;
            ctx.clearRect(0, 0, w, h);
            colors.forEach((col, idx) => {
                ctx.beginPath();
                const amp = 26 + idx * 10;
                const freq = 0.012 + idx * 0.004;
                const speed = 0.6 + idx * 0.3;
                for (let x = 0; x <= w; x += 4) {
                    const y = h / 2 + Math.sin(x * freq + t0 * speed + idx * 2) * amp + Math.sin(x * freq * 2.3 - t0 * speed * 1.4) * amp * 0.3;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = col;
                ctx.lineWidth = 2;
                ctx.stroke();
            });
            t0 += 0.02;
            if (!reduced) requestAnimationFrame(drawWaves);
        }
        drawWaves();
    }

    /* newsletter form */
    const form = document.getElementById('subForm');
    const note = document.getElementById('subNote');
    if (form && note) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            note.classList.remove('hidden');
            form.reset();
        });
    }

    /* back to top */
    const backTop = document.getElementById('backTop');
    if (backTop) {
        backTop.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- category filter (field notes) ---------- */
    const filterBar = document.getElementById('filterBar');
    const filterCards = document.querySelectorAll('.card[data-category]');
    if (filterBar && filterCards.length) {
        filterBar.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (!btn) return;
            filterBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.filter;
            filterCards.forEach(card => {
                if (cat === 'all') {
                    card.classList.remove('hidden');
                } else {
                    card.classList.toggle('hidden', card.dataset.category !== cat);
                }
            });
        });
    }

    /* ---------- search filter (field notes / archive) ---------- */
    const searchInput = document.getElementById('searchField');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase().trim();
            let targets;
            if (filterCards.length) {
                targets = filterCards;
            } else {
                targets = document.querySelectorAll('.archive-entry');
            }
            targets.forEach(el => {
                const text = el.textContent.toLowerCase();
                el.classList.toggle('hidden', q && !text.includes(q));
            });
        });
    }

    /* ---------- load more ---------- */
    const loadBtn = document.getElementById('loadMore');
    const loadInfo = document.getElementById('loadInfo');
    if (loadBtn && loadInfo) {
        let showing = 6;
        const total = parseInt(loadInfo.dataset.total, 10);
        const cards = loadBtn.closest('section').querySelectorAll('.card.hidden-load');
        cards.forEach(c => c.classList.add('hidden'));
        function updateLoadMore() {
            const visible = loadBtn.closest('section').querySelectorAll('.card:not(.hidden)').length;
            const remaining = total - visible;
            loadInfo.textContent = `Showing ${Math.min(visible, showing)} of ${total} essays`;
            if (remaining <= 0) {
                loadBtn.style.display = 'none';
            } else {
                loadBtn.style.display = 'inline-flex';
                loadBtn.querySelector('.count').textContent = remaining;
            }
        }
        updateLoadMore();
        loadBtn.addEventListener('click', () => {
            const hidden = loadBtn.closest('section').querySelectorAll('.card.hidden-load.hidden');
            let toShow = 0;
            hidden.forEach(c => {
                if (toShow < 3) {
                    c.classList.remove('hidden');
                    toShow++;
                }
            });
            showing += toShow;
            updateLoadMore();
        });
    }

    /* ---------- FAQ accordion ---------- */
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.closest('.faq-item');
            const open = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
            if (!open) item.classList.add('open');
        });
    });

})();