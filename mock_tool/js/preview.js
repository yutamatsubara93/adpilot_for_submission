/* --- Preview Panel Logic --- */

window.previewState = {
    activeVariantIdx: 0,
    variants: []
};

window.renderPreview = function(activeCardId) {
    const card = document.querySelector(`.creative-set-card[data-id="${activeCardId}"]`);
    if (!card) return;

    // Collect all assets for variants
    const headlines = Array.from(card.querySelectorAll('.input-headline')).map(i => i.value).filter(v => v);
    const bodies = Array.from(card.querySelectorAll('.input-body')).map(i => i.value).filter(v => v);
    const images = Array.from(card.querySelectorAll('.main-preview, .upload-area-sm .thumb')).map(p => p.dataset.img).filter(img => img);
    
    if (headlines.length === 0) headlines.push("見出しを入力");
    if (bodies.length === 0) bodies.push("本文を入力");
    if (images.length === 0) images.push(""); 

    const logoArea = card.querySelector('.logo-preview');
    const logo = (logoArea && logoArea.dataset.img) ? logoArea.dataset.img : "";

    // Generate Cartesian Product
    window.previewState.variants = [];
    images.forEach(img => {
        headlines.forEach(h => {
            bodies.forEach(b => {
                window.previewState.variants.push({ img, h, b });
            });
        });
    });

    if (window.previewState.activeVariantIdx >= window.previewState.variants.length) {
        window.previewState.activeVariantIdx = 0;
    }

    // Update Variant Numerical Selector (Scrollable)
    const nav = document.getElementById('p-variant-nav');
    if (nav) {
        nav.innerHTML = `
            <div class="variant-scroll-container">
                ${window.previewState.variants.map((_, i) => `
                    <button class="v-num-btn ${i === window.previewState.activeVariantIdx ? 'active' : ''}" 
                            onclick="window.switchPreviewVariant(${i})">${i + 1}</button>
                `).join('')}
            </div>
        `;
    }

    window.updatePreviewContent(logo);

    // Update Header Info (Only Set Name)
    const info = document.getElementById('p-current-info');
    if (info) {
        info.innerText = card.querySelector('.set-name-input').value;
    }
};

window.switchPreviewVariant = function(idx) {
    window.previewState.activeVariantIdx = idx;
    const card = document.querySelector('.creative-set-card.active');
    const logoArea = card ? card.querySelector('.logo-preview') : null;
    const logo = (logoArea && logoArea.dataset.img) ? logoArea.dataset.img : "";
    window.updatePreviewContent(logo);
    
    // Update active state in UI
    document.querySelectorAll('.v-num-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });
};

window.updatePreviewContent = function(logo) {
    const variant = window.previewState.variants[window.previewState.activeVariantIdx];
    if (!variant) return;

    document.querySelectorAll('.ref-headline').forEach(el => el.innerText = variant.h);
    document.querySelectorAll('.ref-body').forEach(el => el.innerText = variant.b);
    
    document.querySelectorAll('.ref-img').forEach(el => { 
        if (variant.img) {
            el.style.backgroundImage = `url('${variant.img}')`;
            el.style.backgroundSize = 'cover';
        } else {
            el.style.backgroundImage = "none";
        }
    });
    
    document.querySelectorAll('.ref-logo').forEach(el => { 
        if (logo) {
            el.style.backgroundImage = `url('${logo}')`;
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
        } else {
            el.style.backgroundImage = "none";
        }
    });
};
