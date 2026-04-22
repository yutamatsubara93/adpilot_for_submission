/* --- Creation Flow Logic --- */

window.updateCounters = function(card) {
    if (!card) return;
    card.querySelectorAll('.field-row').forEach(row => {
        const inp = row.querySelector('input, textarea');
        const cnt = row.querySelector('.field-counter-side');
        const stt = row.querySelector('.field-status-side');
        if (!inp || !cnt || !stt) return;

        const len = inp.value.length;
        const type = inp.classList.contains('input-headline') ? 'headline' : 'body';
        let errors = [];
        if (window.LIMITS && window.LIMITS[type]) {
            Object.entries(window.LIMITS[type]).forEach(([plt, lim]) => { 
                if(len > lim) errors.push(`${plt}(${lim}字)`); 
            });
        }
        
        cnt.innerText = `${len}文字`;
        if (errors.length) {
            stt.innerText = `NG: ${errors.join(', ')}`;
            stt.className = 'field-status-side danger';
        } else {
            stt.innerText = 'OK';
            stt.className = 'field-status-side success';
        }
    });
};

window.updateAllDistributionOptions = function() {
    const popovers = document.querySelectorAll('.ms-popover');
    const cards = document.querySelectorAll('.creative-set-card');
    popovers.forEach(pop => {
        const checkedIds = Array.from(pop.querySelectorAll('input:checked')).map(i => i.dataset.id);
        pop.innerHTML = Array.from(cards).map(c => `
            <label class="ms-item">
                <input type="checkbox" ${checkedIds.includes(c.dataset.id) || (checkedIds.length === 0 && c.dataset.id === "1") ? 'checked' : ''} data-id="${c.dataset.id}"> 
                <span>${c.querySelector('.set-name-input').value}</span>
            </label>
        `).join('');
    });
};

// Character Counter Initialization
document.addEventListener('input', (e) => {
    const card = e.target.closest('.creative-set-card');
    if (card && (e.target.classList.contains('input-headline') || e.target.classList.contains('input-body'))) {
        window.updateCounters(card);
    }
});

let mockImageIdx = 1;
function getNextMockImage() {
    const img = window.MOCK_IMAGES[`img${mockImageIdx}`];
    mockImageIdx = (mockImageIdx % 5) + 1;
    return img;
}

window.handleCreationClick = function(e, state, showToast) {
    const card = e.target.closest('.creative-set-card');
    
    // Switch Active Card
    if (card && !e.target.closest('.btn-del-card') && !e.target.closest('.btn-copy-card') && !e.target.closest('.btn-add-img-slot')) {
        state.activeCardId = card.dataset.id;
        document.querySelectorAll('.creative-set-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        window.renderPreview(state.activeCardId);
        window.updateCounters(card);
    }

    // Mock Upload
    if (e.target.closest('.upload-area-logo, .upload-area, .upload-area-sm')) {
        const area = e.target.closest('.upload-area-logo, .upload-area, .upload-area-sm');
        const thumb = area.querySelector('.thumb');
        let url = area.classList.contains('u-logo') ? window.MOCK_IMAGES.logo : getNextMockImage();
        
        thumb.classList.remove('empty');
        thumb.style.backgroundImage = `url('${url}')`;
        thumb.style.display = 'block';
        thumb.dataset.img = url;
        window.renderPreview(state.activeCardId);
    }

    // Add Image Slot
    if (e.target.closest('.btn-add-img-slot')) {
        const container = e.target.closest('.asset-panel').querySelector('.main-image-slots-container');
        const firstSlot = container.querySelector('.main-image-slots');
        const nextSlot = firstSlot.cloneNode(true);
        nextSlot.querySelectorAll('.thumb').forEach(t => { 
            t.classList.add('empty'); t.style.backgroundImage = 'none'; t.style.display = 'none'; delete t.dataset.img; 
        });
        container.appendChild(nextSlot);
    }

    // Platform Tabs
    const pTab = e.target.closest('.p-tab');
    if (pTab) {
        const section = pTab.closest('.plat-specific-section');
        section.querySelectorAll('.p-tab').forEach(t => t.classList.remove('active'));
        pTab.classList.add('active');
        const plat = pTab.dataset.p;
        section.querySelectorAll('.plat-pane').forEach(p => {
            p.classList.toggle('active', p.dataset.p === plat);
        });
    }

    // Materials Management (Clone/Add)
    function getNextSetName(count) { return String.fromCharCode(65 + (count % 26)); }

    if (e.target.closest('.btn-copy-card')) {
        const source = e.target.closest('.creative-set-card');
        const next = source.cloneNode(true);
        const count = document.querySelectorAll('.creative-set-card').length;
        next.dataset.id = (count + 1).toString();
        next.classList.remove('active');
        next.querySelector('.set-num').innerText = next.dataset.id.padStart(2, '0');
        next.querySelector('.set-name-input').value = `素材セット ${getNextSetName(count)}`;
        document.getElementById('creative-cards-list').appendChild(next);
        window.updateAllDistributionOptions();
        showToast("素材セットを複製しました");
    }

    if (e.target.id === 'btn-add-set-final') {
        const first = document.querySelector('.creative-set-card');
        const next = first.cloneNode(true);
        const count = document.querySelectorAll('.creative-set-card').length;
        next.dataset.id = (count + 1).toString();
        next.classList.remove('active');
        next.querySelector('.set-num').innerText = (count + 1).toString().padStart(2, '0');
        next.querySelector('.set-name-input').value = `素材セット ${getNextSetName(count)}`;
        next.querySelectorAll('input:not(.set-name-input), textarea').forEach(i => i.value = "");
        next.querySelectorAll('.thumb').forEach(t => { t.classList.add('empty'); t.style.backgroundImage = 'none'; t.style.display = 'none'; delete t.dataset.img; });
        ['headline-container', 'body-container'].forEach(cls => {
            const cont = next.querySelector('.' + cls);
            if(cont) while(cont.children.length > 1) cont.removeChild(cont.lastChild);
        });
        document.getElementById('creative-cards-list').appendChild(next);
        window.updateAllDistributionOptions();
        showToast("新しい素材セットを追加しました");
    }

    // Distribution
    if (e.target.id === 'btn-add-matrix-row') {
        const table = document.getElementById('flow-matrix-table').querySelector('tbody');
        const row = document.createElement('tr');
        row.className = 'matrix-row';
        row.innerHTML = `
            <td>
                <div class="custom-media-select-wrapper">
                    <i class="fas fa-layer-group"></i>
                    <select class="sel-media saas-input">
                        <option value="">媒体を選択</option>
                        <option value="Meta" data-logo="fab fa-facebook">Meta Ads</option>
                        <option value="Google" data-logo="fab fa-google">Google Ads</option>
                        <option value="Yahoo" data-logo="fab fa-yahoo">Yahoo! JAPAN</option>
                        <option value="LINE" data-logo="fab fa-line">LINE Ads</option>
                        <option value="TikTok" data-logo="fab fa-tiktok">TikTok Ads</option>
                        <option value="X" data-logo="fab fa-x-twitter">X Ads</option>
                    </select>
                </div>
            </td>
            <td><select class="sel-cp saas-input"><option>キャンペーン選択</option></select></td>
            <td><select class="sel-as saas-input"><option>アドセット選択</option></select></td>
            <td>
                <div class="ms-box">
                    <div class="ms-label"><span>全て</span> <i class="fas fa-chevron-down"></i></div>
                    <div class="ms-popover">
                        ${Array.from(document.querySelectorAll('.creative-set-card')).map(c => `
                            <label class="ms-item"><input type="checkbox" checked data-id="${c.dataset.id}"> <span>${c.querySelector('.set-name-input').value}</span></label>
                        `).join('')}
                    </div>
                </div>
            </td>
            <td><button class="btn-icon btn-del-matrix"><i class="fas fa-trash"></i></button></td>
        `;
        table.appendChild(row);
        initMediaSelect(row.querySelector('.sel-media'));
    }

    if (e.target.closest('.ms-label')) {
        const box = e.target.closest('.ms-box');
        const pop = box.querySelector('.ms-popover');
        const isActive = pop.classList.contains('active');
        document.querySelectorAll('.ms-popover').forEach(p => p.classList.remove('active'));
        if (!isActive) pop.classList.add('active');
        e.stopPropagation();
    }

    if (e.target.closest('.ms-item')) {
        const box = e.target.closest('.ms-box');
        const checked = box.querySelectorAll('input:checked');
        const labelText = box.querySelector('.ms-label span');
        if (checked.length === box.querySelectorAll('input').length) labelText.innerText = "全て";
        else if (checked.length === 0) labelText.innerText = "選択なし";
        else labelText.innerText = `${checked.length}件選択中`;
    }

    if (!e.target.closest('.ms-box')) document.querySelectorAll('.ms-popover').forEach(p => p.classList.remove('active'));
    if (e.target.closest('.btn-del-matrix')) e.target.closest('tr').remove();

    if (e.target.closest('.btn-apply-preview')) {
        window.renderPreview(state.activeCardId);
        showToast("プレビューを更新しました");
    }
    
    // Add Field
    if (e.target.closest('.btn-add-field-bottom')) {
        const btn = e.target.closest('.btn-add-field-bottom');
        const type = btn.dataset.type;
        const container = btn.closest('.field-group').querySelector('.field-container');
        const row = document.createElement('div');
        row.className = 'field-row';
        const inputHtml = type === 'headline' ? `<input type="text" class="input-headline" placeholder="見出しを入力">` : `<textarea class="input-body" placeholder="本文を入力"></textarea>`;
        row.innerHTML = `<div class="field-input-box">${inputHtml}<div class="field-footer-info"><div class="field-counter-side">0文字</div><div class="field-status-side success">OK</div></div></div><button class="btn-del-field-top">×</button>`;
        container.appendChild(row);
        const cardTarget = e.target.closest('.creative-set-card');
        if (cardTarget) window.updateCounters(cardTarget);
    }
    
    // Delete Field
    if (e.target.closest('.btn-del-field-top')) {
        const container = e.target.closest('.field-container');
        if (container.children.length > 1) e.target.closest('.field-row').remove();
    }
    
    // Delete Card
    if (e.target.closest('.btn-del-card')) {
        if (document.querySelectorAll('.creative-set-card').length > 1) {
            e.target.closest('.creative-set-card').remove();
            window.updateAllDistributionOptions();
            showToast("素材セットを削除しました");
            const first = document.querySelector('.creative-set-card');
            if(first) first.click();
        }
    }
};

function initMediaSelect(sel) {
    if (!sel) return;
    const icon = sel.closest('.custom-media-select-wrapper').querySelector('i');
    sel.onchange = () => {
        const opt = sel.options[sel.selectedIndex];
        icon.className = (opt.dataset.logo || 'fas fa-layer-group');
        const colors = { Meta: 'var(--meta)', Google: 'var(--google)', Yahoo: 'var(--yahoo)', LINE: 'var(--line)' };
        icon.style.color = colors[sel.value] || 'inherit';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    };
}

// Global UI Logic
window.updateFlow = function(state) {
    document.querySelectorAll('.pane').forEach((p, i) => p.classList.toggle('active', i+1 === state.currentFlowStep));
    document.querySelectorAll('.step').forEach((s, i) => s.classList.toggle('active', i+1 <= state.currentFlowStep && i < 4));
    const btnPrev = document.getElementById('btn-flow-prev');
    const btnNext = document.getElementById('btn-flow-next');
    const preview = document.getElementById('creation-preview-sidebar');
    const pBtn = document.getElementById('btn-open-preview');

    if (btnPrev) btnPrev.style.display = (state.currentFlowStep > 1 && state.currentFlowStep < 5) ? 'block' : 'none';
    if (btnNext) {
        btnNext.style.display = (state.currentFlowStep < 5) ? 'block' : 'none';
        btnNext.innerText = state.currentFlowStep === 4 ? "承認依頼を送信" : "次へ進む";
    }
    
    if (preview) {
        if (state.currentFlowStep > 1) {
            preview.style.display = 'none';
            if(pBtn) { pBtn.style.display = 'none'; pBtn.classList.remove('active'); }
        } else {
            if(pBtn) pBtn.style.display = 'inline-flex';
        }
    }

    if (state.currentFlowStep === 3 && window.renderStep3) window.renderStep3();
    if (state.currentFlowStep === 4 && window.renderStep4) window.renderStep4();
};

// Initial setup
setTimeout(() => {
    document.querySelectorAll('.sel-media').forEach(sel => initMediaSelect(sel));
}, 500);
