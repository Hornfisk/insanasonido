// Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
    menuBtn.onclick = () => {
        const isOpen = navLinks.classList.toggle('active');
        menuBtn.textContent = isOpen ? '✕' : '☰';
        menuBtn.setAttribute('aria-expanded', isOpen);
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuBtn.textContent = '☰';
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Gallery Lightbox
(function () {
    const galleryGrid = document.getElementById('galleryGrid');
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const backdrop = lightbox.querySelector('.lightbox-backdrop');
    const imgEl    = lightbox.querySelector('.lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn  = lightbox.querySelector('.lightbox-prev');
    const nextBtn  = lightbox.querySelector('.lightbox-next');

    let images = [];
    let currentIndex = 0;
    let touchStartX = 0;

    function buildImageList() {
        if (!galleryGrid) return;
        images = Array.from(
            galleryGrid.querySelectorAll('.gallery-item:not([aria-hidden]) img')
        ).map(img => ({ src: img.src, alt: img.alt }));
    }

    function openAt(index) {
        buildImageList();
        if (!images.length) return;
        currentIndex = (index + images.length) % images.length;
        imgEl.src = images[currentIndex].src;
        imgEl.alt = images[currentIndex].alt;
        lightbox.removeAttribute('hidden');
        requestAnimationFrame(() => lightbox.classList.add('is-open'));
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lightbox.classList.remove('is-open');
        lightbox.addEventListener('transitionend', () => {
            lightbox.setAttribute('hidden', '');
            imgEl.src = '';
            document.body.style.overflow = '';
        }, { once: true });
    }

    function navigate(dir) {
        currentIndex = (currentIndex + dir + images.length) % images.length;
        imgEl.src = images[currentIndex].src;
        imgEl.alt = images[currentIndex].alt;
    }

    if (galleryGrid) {
        galleryGrid.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item:not([aria-hidden])');
            if (!item) return;
            buildImageList();
            const img = item.querySelector('img');
            const index = images.findIndex(im => im.src === img.src);
            openAt(index >= 0 ? index : 0);
        });
    }

    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape')     close();
        if (e.key === 'ArrowLeft')  navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) navigate(dx < 0 ? 1 : -1);
    }, { passive: true });
})();

// Lineup Carousel Logic
const lineupGrid = document.getElementById('lineupGrid');
if (lineupGrid) {
    // Cards are already sorted (booked first) in the Astro template.
    // Duplicate for seamless loop (Desktop).
    const cards = Array.from(lineupGrid.children);
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        lineupGrid.appendChild(clone);
    });

    initLineupDrag(lineupGrid);
    initMobileLoop(lineupGrid);
}

function initLineupDrag(lineupGrid) {
    const mq = window.matchMedia('(min-width: 768px)');
    const lineupViewport = lineupGrid.parentElement;

    const rawSpeed = getComputedStyle(document.documentElement)
        .getPropertyValue('--gallery-speed').trim();
    const gallerySpeedSeconds = parseFloat(rawSpeed);

    let offset = 0;
    let halfWidth = 0;
    let autoScrollSpeed = 0;
    let rafId = null;
    let autoScrollActive = true;

    let isDragging = false;
    let startX = 0;
    let lastX = 0;
    let hasDragged = false;

    let isCoasting = false;
    let velocity = 0;
    const FRICTION = 0.92;
    const VELOCITY_THRESHOLD = 0.5;
    const DRAG_THRESHOLD = 8;
    const SMOOTHING = 0.8;
    const RESUME_DELAY = 2000;
    let resumeTimer = null;

    function measureHalfWidth() {
        const measured = lineupGrid.scrollWidth / 2;
        if (measured > 0) {
            halfWidth = measured;
            autoScrollSpeed = halfWidth / (gallerySpeedSeconds * 60);
        }
    }

    function wrapOffset() {
        if (halfWidth <= 0) return;
        if (offset >= halfWidth) offset -= halfWidth;
        if (offset < 0) offset += halfWidth;
    }

    function tick() {
        if (halfWidth === 0) measureHalfWidth();
        if (!isDragging) {
            if (isCoasting) {
                offset -= velocity;
                velocity *= FRICTION;
                if (Math.abs(velocity) < VELOCITY_THRESHOLD) {
                    isCoasting = false;
                    velocity = 0;
                }
            } else if (autoScrollActive) {
                offset += autoScrollSpeed;
            }
        }
        wrapOffset();
        lineupGrid.style.transform = `translateX(${-offset}px)`;
        rafId = requestAnimationFrame(tick);
    }

    function startLoop() {
        if (rafId) return;
        rafId = requestAnimationFrame(tick);
    }

    function stopLoop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function onPointerDown(e) {
        if (!mq.matches) return;
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        isDragging = true;
        isCoasting = false;
        velocity = 0;
        autoScrollActive = false;
        hasDragged = false;
        startX = e.clientX;
        lastX = e.clientX;
        lineupViewport.classList.add('is-dragging');
        clearTimeout(resumeTimer);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerRelease);
        document.addEventListener('pointercancel', onPointerRelease);
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        const delta = e.clientX - lastX;
        offset -= delta;
        velocity = delta * SMOOTHING;
        lastX = e.clientX;
        if (Math.abs(e.clientX - startX) > DRAG_THRESHOLD) hasDragged = true;
        wrapOffset();
        lineupGrid.style.transform = `translateX(${-offset}px)`;
    }

    function onPointerRelease() {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerRelease);
        document.removeEventListener('pointercancel', onPointerRelease);
        if (!isDragging) return;
        isDragging = false;
        lineupViewport.classList.remove('is-dragging');
        if (Math.abs(velocity) > VELOCITY_THRESHOLD) isCoasting = true;
        resumeTimer = setTimeout(() => {
            autoScrollActive = true;
            isCoasting = false;
        }, RESUME_DELAY);
    }

    function onCapturingClick(e) {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            hasDragged = false;
        }
    }

    function handleMqChange(e) {
        if (e.matches) {
            measureHalfWidth();
            autoScrollActive = true;
            startLoop();
        } else {
            stopLoop();
            autoScrollActive = false;
            isDragging = false;
            isCoasting = false;
            lineupViewport.classList.remove('is-dragging');
            lineupGrid.style.transform = '';
            clearTimeout(resumeTimer);
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerRelease);
            document.removeEventListener('pointercancel', onPointerRelease);
        }
    }

    lineupViewport.addEventListener('pointerdown', onPointerDown);
    lineupViewport.addEventListener('click', onCapturingClick, true);
    mq.addEventListener('change', handleMqChange);

    const resizeObserver = new ResizeObserver(() => {
        if (mq.matches) measureHalfWidth();
    });
    resizeObserver.observe(lineupViewport);

    // Pause the RAF loop when the carousel scrolls out of view
    const visibilityObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            if (mq.matches) startLoop();
        } else {
            stopLoop();
        }
    }, { threshold: 0 });
    visibilityObserver.observe(lineupViewport);

    requestAnimationFrame(() => {
        measureHalfWidth();
        if (mq.matches && lineupViewport.getBoundingClientRect().top < window.innerHeight) startLoop();
    });
}

function initMobileLoop(lineupGrid) {
    const mq = window.matchMedia('(min-width: 768px)');
    if (mq.matches) return;

    const lineupViewport = lineupGrid.parentElement;
    let half = 0;

    function measure() {
        half = lineupGrid.scrollWidth / 2;
    }

    requestAnimationFrame(measure);

    lineupViewport.addEventListener('scroll', () => {
        if (!half) return;
        if (lineupViewport.scrollLeft >= half) {
            lineupViewport.scrollLeft -= half;
        }
    }, { passive: true });

    window.addEventListener('resize', measure, { passive: true });
}

// Marquee Duplicator
window.addEventListener('DOMContentLoaded', () => {
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
        const originalHTML = marqueeContent.innerHTML;
        marqueeContent.innerHTML = originalHTML + originalHTML;
    }
});

// Glitch trigger on logo and rabbit icon
(function () {
    const targets = [
        ...document.querySelectorAll('.logo'),
        document.querySelector('.rabbit-icon')
    ].filter(Boolean);
    if (!targets.length) return;

    function triggerGlitch() {
        targets.forEach(el => {
            el.classList.add('glitch');
            el.addEventListener('animationend', () => el.classList.remove('glitch'), { once: true });
        });
        setTimeout(triggerGlitch, 10000 + Math.random() * 12000);
    }

    setTimeout(triggerGlitch, 3000 + Math.random() * 7000);
})();
