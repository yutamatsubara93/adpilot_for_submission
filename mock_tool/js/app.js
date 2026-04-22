/* --- Main App Orchestrator (Router & Global Events) --- */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Global State ---
    const state = {
        currentFlowStep: 1,
        activeCardId: "1"
    };

    // --- Global Click Router ---
    document.addEventListener('click', (e) => {
        // 1. Auth & Login
        if (e.target.id === 'btn-login-exec') {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('account-selection-screen').style.display = 'flex';
        }
        
        const accBtn = e.target.closest('.btn-account-select');
        if (accBtn) {
            document.getElementById('account-selection-screen').style.display = 'none';
            document.getElementById('app-root').style.display = 'flex';
            document.getElementById('current-account-name').innerText = accBtn.dataset.account;
            if(window.renderDashboard) window.renderDashboard();
        }

        // Account Switcher Toggle
        const switcher = e.target.closest('#account-switcher');
        const projectDropdown = document.getElementById('project-dropdown');
        if (switcher) {
            projectDropdown.classList.toggle('active');
            e.stopPropagation();
        } else if (projectDropdown) {
            projectDropdown.classList.remove('active');
        }

        // Dropdown item selection
        const dropItem = e.target.closest('.dropdown-item');
        if (dropItem && dropItem.dataset.acc) {
            document.getElementById('current-account-name').innerText = dropItem.dataset.acc;
            projectDropdown.classList.remove('active');
        }
        
        if (dropItem && dropItem.id === 'btn-logout') {
            document.getElementById('app-root').style.display = 'none';
            document.getElementById('account-selection-screen').style.display = 'flex';
        }

        // 2. Sidebar Navigation
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            const target = navItem.dataset.view;
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            navItem.classList.add('active');
            document.querySelectorAll('.view-pane').forEach(v => v.classList.toggle('active', v.id === `view-${target}`));
            
            if (target === 'dashboard' && window.renderDashboard) window.renderDashboard();
            if (target === 'assets' && window.renderAssets) window.renderAssets();
            if (target === 'campaigns' && window.renderCampaignMgmt) window.renderCampaignMgmt('Meta');
            if (target === 'status' && window.renderStatusHistory) window.renderStatusHistory();
        }

        // 3. Flow Navigation (Creation Step 1-4)
        if (e.target.id === 'btn-flow-next') {
            if (state.currentFlowStep < 4) { state.currentFlowStep++; window.updateFlow(state); }
            else if (state.currentFlowStep === 4) { state.currentFlowStep = 5; window.updateFlow(state); }
        }
        if (e.target.id === 'btn-flow-prev') { state.currentFlowStep--; window.updateFlow(state); }
        if (e.target.id === 'btn-success-to-status') {
            state.currentFlowStep = 1;
            const batchInput = document.getElementById('input-batch-name');
            if (batchInput) batchInput.value = '';
            const statusNav = document.querySelector('.nav-item[data-view="status"]');
            if(statusNav) statusNav.click();
        }

        // 4. Preview Specifics
        if (e.target.id === 'btn-open-preview') {
            const sidebar = document.getElementById('creation-preview-sidebar');
            const isVisible = sidebar.style.display === 'flex';
            sidebar.style.display = isVisible ? 'none' : 'flex';
            e.target.classList.toggle('active', !isVisible);
        }

        // 5. Delegate to Specialized Modules
        if (window.handleCreationClick) window.handleCreationClick(e, state, window.showToast);
        
        // Settings cards
        const setCard = e.target.closest('.set-card');
        if (setCard && window.openSettingsModal) {
            window.openSettingsModal(setCard.dataset.set);
        }
        
        // Status detail
        const statusBtn = e.target.closest('.btn-status-detail');
        if (statusBtn && window.openStatusDetail) {
            const id = statusBtn.dataset.id;
            const item = window.statusHistory.find(s => s.id == id);
            window.openStatusDetail(item);
        }
        
        // Campaign Tab Switching
        const pltTab = e.target.closest('.plt-tab');
        if (pltTab && window.renderCampaignMgmt) {
            document.querySelectorAll('.plt-tab').forEach(t => t.classList.remove('active'));
            pltTab.classList.add('active');
            window.renderCampaignMgmt(pltTab.dataset.plt);
        }

        if (e.target.closest('.btn-modal-close')) {
            document.getElementById('modal-overlay').classList.remove('active');
        }
    });

    // --- Step 3 Render (Matrix View) ---
    window.renderStep3 = function() {
        const container = document.getElementById('step-3-list-container');
        if (!container) return;
        container.innerHTML = '';
        
        const groupedByMedia = {};
        const matrixRows = document.querySelectorAll('.matrix-row');
        
        matrixRows.forEach(row => {
            const media = row.querySelector('.sel-media').value;
            const cp = row.querySelector('.sel-cp').value;
            const as = row.querySelector('.sel-as').value;
            if (!media || cp === 'キャンペーン選択') return;

            if (!groupedByMedia[media]) groupedByMedia[media] = [];
            
            const selectedSetIds = Array.from(row.querySelectorAll('.ms-item input:checked')).map(i => i.dataset.id);
            selectedSetIds.forEach(setId => {
                const card = document.querySelector(`.creative-set-card[data-id="${setId}"]`);
                if (!card) return;

                const setName = card.querySelector('.set-name-input').value;
                const headlines = Array.from(card.querySelectorAll('.input-headline')).map(i => i.value).filter(v => v);
                const bodies = Array.from(card.querySelectorAll('.input-body')).map(i => i.value).filter(v => v);
                const images = Array.from(card.querySelectorAll('.thumb-preview-ratio, .main-preview, .upload-area-sm .thumb')).map(p => p.dataset.img).filter(img => img);
                const urlBase = card.querySelector('.input-url').value;
                
                // Fallback to default mock image if none uploaded
                if (images.length === 0) images.push(window.MOCK_IMAGES.main);

                images.forEach((img, imgIdx) => {
                    headlines.forEach((h, hIdx) => {
                        bodies.forEach((b, bIdx) => {
                            const fullUrl = `${urlBase}?utm_source=${media.toLowerCase()}&cp=${cp}&as=${as}`;
                            const adName = `${setName}_${imgIdx+1}_${hIdx+1}`;
                            groupedByMedia[media].push({ cp, as, h, b, fullUrl, img, adName });
                        });
                    });
                });
            });
        });

        Object.entries(groupedByMedia).forEach(([media, list]) => {
            const section = document.createElement('div');
            section.className = 'media-group-section';
            
            const requiredFields = {
                Meta: "リンク先表示名", Google: "長い見出し (90文字)", Yahoo: "リンクテキスト", LINE: "広告主名", TikTok: "表示名", X: "ハッシュタグ"
            };

            section.innerHTML = `
                <div class="media-group-header">
                    <span class="platform-badge badge-${media.toLowerCase()}">${media}</span>
                    <small>${list.length * 2} 個の広告案</small>
                </div>
                <div class="table-container-card">
                    <table class="saas-table">
                        <thead><tr><th width="40"><input type="checkbox" checked></th><th>キャンペーン / アドセット</th><th>広告名</th><th width="140">クリエイティブ</th><th>入稿内容</th><th>追加必須項目</th></tr></thead>
                        <tbody>
                            ${list.map(item => {
                                const sizes = ["1:1", "1.91:1"];
                                return sizes.map(size => `
                                    <tr>
                                        <td><input type="checkbox" checked></td>
                                        <td><strong>${item.cp}</strong><br><small>${item.as}</small></td>
                                        <td><input type="text" class="saas-input sm-input" value="${item.adName}_${size.replace(':','-')}"></td>
                                        <td>
                                            <div class="size-preview-box">
                                                <div class="thumb-preview-ratio ${size.replace('.','_').replace(':','-')}" style="background-image:url('${item.img}')"></div>
                                                <strong>${size}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="edit-fields-stack">
                                                <input type="text" class="saas-input mb-5" value="${item.h}">
                                                <textarea class="saas-input mb-5" rows="2">${item.b}</textarea>
                                                <input type="text" class="saas-input" value="${item.fullUrl}">
                                            </div>
                                        </td>
                                        <td>
                                            <div class="required-input-box">
                                                <label><i class="fas fa-exclamation-circle text-danger"></i> ${requiredFields[media] || '項目'}</label>
                                                <input type="text" class="saas-input" placeholder="入稿時に必要です">
                                            </div>
                                        </td>
                                    </tr>
                                `).join('');
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            container.appendChild(section);
        });
    };

    // --- Step 4 Render ---
    window.renderStep4 = function() {
        const cont = document.getElementById('step-4-final-summary');
        if (!cont) return;
        cont.innerHTML = '';
        
        const allItems = document.querySelectorAll('#pane-3 tbody tr');
        const count = Array.from(allItems).filter(tr => tr.querySelector('input[type="checkbox"]:checked')).length;

        const summaryHeader = document.createElement('div');
        summaryHeader.className = 'summary-alert';
        summaryHeader.innerHTML = `<i class="fas fa-check-circle"></i> 合計 <strong>${count}</strong> 件の最終確認を行ってください。`;
        cont.appendChild(summaryHeader);

        const tableWrap = document.createElement('div');
        tableWrap.className = 'table-container-card';
        const table = document.createElement('table');
        table.className = 'saas-table';
        table.innerHTML = `
            <thead><tr><th width="100">媒体</th><th>CP / AS</th><th>広告名</th><th width="100">サイズ</th><th>テキスト / URL</th></tr></thead>
            <tbody>
                ${Array.from(allItems).map(tr => {
                    const chk = tr.querySelector('input[type="checkbox"]');
                    if (!chk || !chk.checked) return '';
                    const mediaBadge = tr.closest('.media-group-section').querySelector('.platform-badge').cloneNode(true);
                    const cpAs = tr.cells[1].innerHTML;
                    const adName = tr.cells[2].querySelector('input').value;
                    const size = tr.querySelector('.size-preview-box strong').innerText;
                    const inputs = tr.querySelectorAll('.edit-fields-stack input, .edit-fields-stack textarea');
                    return `
                        <tr>
                            <td>${mediaBadge.outerHTML}</td>
                            <td>${cpAs}</td>
                            <td><strong>${adName}</strong></td>
                            <td><strong>${size}</strong></td>
                            <td>
                                <div><strong>${inputs[0].value}</strong></div>
                                <div class="text-muted"><small>${inputs[1].value}</small></div>
                                <div class="text-primary" style="word-break:break-all;"><small>${inputs[2].value}</small></div>
                            </td>
                        </tr>`;
                }).join('')}
            </tbody>`;
        tableWrap.appendChild(table);
        cont.appendChild(tableWrap);
    };

    // --- Global Helpers ---
    window.showToast = function(msg) {
        const cont = document.getElementById('toast-container');
        if (!cont) return;
        const t = document.createElement('div');
        t.className = 'toast'; t.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
        cont.appendChild(t);
        setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 3000);
    };

    // --- Init ---
    if (window.updateFlow) window.updateFlow(state);
    const firstCard = document.querySelector('.creative-set-card');
    if (firstCard) firstCard.classList.add('active');
});
