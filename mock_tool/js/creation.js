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
        Object.entries(window.LIMITS[type]).forEach(([plt, lim]) => { 
            if(len > lim) errors.push(`${plt}(${lim}字)`); 
        });
        
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

window.handleCreationClick = function(e, state, showToast) {
    const card = e.target.closest('.creative-set-card');
    if (card) {
        state.activeCardId = card.dataset.id;
        document.querySelectorAll('.creative-set-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    }

    // Mock Upload
    if (e.target.closest('.upload-area-logo, .upload-area, .upload-area-sm')) {
        const area = e.target.closest('.upload-area-logo, .upload-area, .upload-area-sm');
        const thumb = area.querySelector('.thumb');
        const type = area.classList.contains('u-logo') ? 'logo' : (area.classList.contains('u-main-11') ? 'sq' : 'main');
        const url = window.MOCK_IMAGES[type];
        
        thumb.classList.remove('empty');
        thumb.style.backgroundImage = `url('${url}')`;
        thumb.style.display = 'block';
        thumb.dataset.img = url;
        window.renderPreview(state.activeCardId);
    }

    // Add Manual Slot
    if (e.target.closest('.btn-add-manual-slot')) {
        const box = e.target.closest('.mode-pane-manual');
        const size = box.querySelector('.sel-add-size').value;
        const grid = box.querySelector('.manual-upload-grid');
        
        const div = document.createElement('div');
        div.className = 'm-slot';
        div.innerHTML = `
            <button class="btn-del-slot">×</button>
            <small>${size}</small>
            <div class="upload-area-sm">
                <div class="thumb empty"></div>
                <i class="fas fa-plus"></i>
            </div>`;
        grid.appendChild(div);
        div.querySelector('.btn-del-slot').onclick = () => div.remove();
    }

    // Mode Toggle
    if (e.target.closest('.m-btn')) {
        const btn = e.target.closest('.m-btn');
        const slot = btn.closest('.asset-slot');
        slot.querySelectorAll('.m-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.m;
        slot.querySelectorAll('.mode-pane-auto, .mode-pane-manual').forEach(p => {
            p.classList.toggle('active', p.classList.contains(`mode-pane-${mode}`));
        });
    }

    // Add Field
    if (e.target.closest('.btn-add-field-bottom')) {
        const btn = e.target.closest('.btn-add-field-bottom');
        const type = btn.dataset.type;
        const container = btn.closest('.field-group').querySelector('.field-container');
        const row = document.createElement('div');
        row.className = 'field-row';
        const inputHtml = type === 'headline' ? `<input type="text" class="input-headline">` : `<textarea class="input-body"></textarea>`;
        row.innerHTML = `<button class="btn-del-field-top">×</button><div class="field-input-box">${inputHtml}<div class="field-footer-info"><div class="field-counter-side">0文字</div><div class="field-status-side success">OK</div></div></div>`;
        container.appendChild(row);
        window.updateCounters(card);
    }

    // Copy Set
    if (e.target.closest('.btn-copy-card')) {
        const source = e.target.closest('.creative-set-card');
        const next = source.cloneNode(true);
        const count = document.querySelectorAll('.creative-set-card').length + 1;
        next.dataset.id = count;
        next.querySelector('.set-num').innerText = count.toString().padStart(2, '0');
        document.getElementById('creative-cards-list').appendChild(next);
        showToast("素材セットを複製しました");
    }

    // Delete Logic
    if (e.target.closest('.btn-del-field-top')) {
        const container = e.target.closest('.field-container');
        if (container.children.length > 1) e.target.closest('.field-row').remove();
        window.renderPreview(state.activeCardId);
    }

    if (e.target.closest('.btn-del-card')) {
        if (document.querySelectorAll('.creative-set-card').length > 1) {
            e.target.closest('.creative-set-card').remove();
            showToast("素材セットを削除しました");
            document.querySelector('.creative-set-card').click();
        }
    }

    // Add Image Set
    if (e.target.closest('.btn-add-img-slot')) {
        const container = card.querySelector('.main-image-slots');
        const first = container.querySelector('.image-box');
        const next = first.cloneNode(true);
        next.querySelectorAll('.thumb').forEach(t => { 
            t.classList.add('empty'); t.style.backgroundImage = 'none'; t.style.display = 'none'; 
            delete t.dataset.img; 
        });
        next.querySelectorAll('.manual-upload-grid').forEach(g => g.innerHTML = '');
        container.appendChild(next);
        showToast("画像セットを追加しました");
    }

    // Add Set Final
    if (e.target.id === 'btn-add-set-final') {
        const first = document.querySelector('.creative-set-card');
        const next = first.cloneNode(true);
        const count = document.querySelectorAll('.creative-set-card').length + 1;
        next.dataset.id = count;
        next.querySelector('.set-num').innerText = count.toString().padStart(2, '0');
        next.querySelectorAll('input, textarea').forEach(i => i.value = "");
        next.querySelectorAll('.thumb').forEach(t => { t.classList.add('empty'); t.style.backgroundImage = 'none'; t.style.display = 'none'; delete t.dataset.img; });
        document.getElementById('creative-cards-list').appendChild(next);
    }

    // Apply Preview
    if (e.target.closest('.btn-apply-preview')) {
        window.renderPreview(state.activeCardId);
        showToast("プレビューに反映しました");
    }
};

window.updateFlow = function(state) {
    document.querySelectorAll('.pane').forEach((p, i) => p.classList.toggle('active', i+1 === state.currentFlowStep));
    document.querySelectorAll('.step').forEach((s, i) => s.classList.toggle('active', i+1 <= state.currentFlowStep && i < 4));
    
    const btnPrev = document.getElementById('btn-flow-prev');
    const btnNext = document.getElementById('btn-flow-next');
    const preview = document.getElementById('creation-preview-sidebar');
    const pBtn = document.getElementById('btn-open-preview');

    btnPrev.style.display = (state.currentFlowStep > 1 && state.currentFlowStep < 5) ? 'block' : 'none';
    btnNext.style.display = (state.currentFlowStep < 5) ? 'block' : 'none';
    btnNext.innerText = state.currentFlowStep === 4 ? "承認依頼を送信" : "次へ進む";
    
    if (preview) {
        if (state.currentFlowStep > 1) {
            preview.style.display = 'none';
            if(pBtn) pBtn.style.display = 'none';
        } else {
            preview.style.display = 'flex';
            if(pBtn) pBtn.style.display = 'block';
        }
    }

    if (state.currentFlowStep === 3) renderStep3();
    if (state.currentFlowStep === 4) renderStep4();
    window.renderPreview(state.activeCardId);
};

function renderStep3() {
    const container = document.getElementById('step-3-list-container');
    if (!container) return;
    container.innerHTML = '';
    const matrixRows = document.querySelectorAll('.matrix-row');
    const grouped = {};
    matrixRows.forEach(row => {
        const m = row.querySelector('.sel-media').value;
        const cp = row.querySelector('.sel-cp').value;
        if (cp === 'キャンペーン選択') return;
        if (!grouped[m]) grouped[m] = [];
        grouped[m].push({ cp, as: row.querySelector('.sel-as').value });
    });

    Object.entries(grouped).forEach(([media, list]) => {
        const section = document.createElement('div');
        section.className = 'media-group-section';
        section.innerHTML = `
            <div class="media-group-header"><span class="platform-badge badge-${media.toLowerCase()}">${media}</span></div>
            <div class="table-container-card">
            <table class="saas-table">
                <thead><tr><th width="40"><input type="checkbox" checked></th><th>案件/AS</th><th>画像</th><th>見出し / 本文</th><th>URL</th></tr></thead>
                <tbody>
                    ${list.map(item => `
                        <tr>
                            <td><input type="checkbox" checked></td>
                            <td><small>${item.cp}</small><br><strong>${item.as}</strong></td>
                            <td><div class="thumb-preview-sm" style="background-image:url('${window.MOCK_IMAGES.main}')"></div></td>
                            <td>
                                <input type="text" class="saas-input mb-5" value="【公式】ADPILOTストア">
                                <textarea class="saas-input" rows="2">最新のトレンドをADPILOTで一括管理。期間限定セール実施中！</textarea>
                            </td>
                            <td><input type="text" class="saas-input" value="https://shop.example.com"></td>
                        </tr>`).join('')}
                </tbody>
            </table>
            </div>`;
        container.appendChild(section);
    });
}

function renderStep4() {
    const cont = document.getElementById('step-4-final-summary');
    if (!cont) return;
    cont.innerHTML = '<div class="table-container-card"></div>';
    const inner = cont.querySelector('.table-container-card');
    
    const table = document.createElement('table');
    table.className = 'saas-table';
    table.innerHTML = `
        <thead><tr><th>媒体</th><th>キャンペーン</th><th>画像</th><th>テキスト内容</th><th>URL / 計測</th></tr></thead>
        <tbody>
            ${Array.from(document.querySelectorAll('#pane-3 input[type="checkbox"]:checked')).filter(c => c.closest('tr')).map(chk => {
                const row = chk.closest('tr');
                const media = row.closest('.media-group-section').querySelector('.platform-badge').innerText;
                return `
                    <tr>
                        <td><span class="platform-badge badge-${media.toLowerCase()}">${media}</span></td>
                        <td>${row.cells[1].innerHTML}</td>
                        <td>${row.cells[2].innerHTML}</td>
                        <td>${row.cells[3].querySelector('input').value}<br><small>${row.cells[3].querySelector('textarea').value}</small></td>
                        <td>${row.cells[4].querySelector('input').value}<br><small>Preset: Default</small></td>
                    </tr>`;
            }).join('')}
        </tbody>`;
    inner.appendChild(table);
}
