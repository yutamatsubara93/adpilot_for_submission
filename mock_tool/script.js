document.addEventListener('DOMContentLoaded', () => {
    
    // --- Data Store ---
    const LIMITS = {
        headline: { Meta: 40, Google: 30, Yahoo: 20, LINE: 20, TikTok: 20, X: 20 },
        body: { Meta: 125, Google: 90, Yahoo: 75, LINE: 75, TikTok: 100, X: 280 }
    };

    const CAMPAIGN_DATA = {
        Meta: {
            "CP_Meta_Spring": { objective: "コンバージョン", budget: "¥50,000", status: "Active", adsets: [
                { name: "AS_男性_20代", target: "日本 / 20-29歳 / 男性" },
                { name: "AS_女性_20代", target: "日本 / 20-29歳 / 女性" }
            ]},
            "CP_Meta_Brand": { objective: "認知", budget: "¥20,000", status: "Paused", adsets: [{ name: "AS_全国", target: "日本 / 18-65歳 / 男女" }] }
        },
        Google: {
            "CP_GSearch_Sales": { objective: "販売", budget: "¥100,000", status: "Active", adsets: [{ name: "AG_Shoes", target: "KW: 靴, スニーカー" }] }
        },
        Yahoo: {
            "CP_YDisplay_Main": { objective: "サイト誘導", budget: "¥15,000", status: "Active", adsets: [{ name: "AS_Standard", target: "日本 / 18-65歳" }] }
        }
    };

    let statusHistory = [
        { id: 401, date: "2026-04-16 10:05", media: "Meta", name: "春の新作キャンペーン", status: "承認済み (作成者戻し)", assigned: true, isApproved: true },
        { id: 402, date: "2026-04-16 09:30", media: "Google", name: "SALE素材A", status: "承認待ち", assigned: true, isApproved: false }
    ];

    let namingRule = "AD_{{date}}_{{media}}_{{campaign}}_{{index}}";

    // --- State ---
    let currentFlowStep = 1;
    let activeCardId = "1";
    let currentVarIdx = 0;
    let pendingUploadTarget = null;
    let currentActivePlatform = 'Meta';

    // --- Helpers ---
    function showToast(msg) {
        const cont = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.className = 'toast'; t.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
        cont.appendChild(t);
        setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 3000);
    }

    function updateCounters(card) {
        if (!card) return;
        card.querySelectorAll('.field-row').forEach(row => {
            const inp = row.querySelector('input, textarea');
            const cnt = row.querySelector('.field-counter');
            const dot = row.querySelector('.field-status');
            if (!inp || !cnt) return;
            const len = inp.value.length;
            const type = inp.classList.contains('input-headline') ? 'headline' : 'body';
            let errors = [];
            Object.entries(LIMITS[type]).forEach(([plt, lim]) => { if(len > lim) errors.push(plt); });
            cnt.innerHTML = `${len}文字 <span class="${errors.length?'ng':'ok'}">${errors.length ? 'NG: '+errors.join(',') : 'OK'}</span>`;
            if (dot) dot.style.color = errors.length ? 'var(--danger)' : 'var(--success)';
        });
    }

    // --- Auth & Transitions ---
    const btnLogin = document.getElementById('btn-login-exec');
    if (btnLogin) {
        btnLogin.onclick = () => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('account-selection-screen').style.display = 'flex';
        };
    }

    document.querySelectorAll('.btn-account-select').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('account-selection-screen').style.display = 'none';
            document.getElementById('app-root').style.display = 'flex';
            document.getElementById('current-account-name').innerText = btn.dataset.account;
            renderDashboard();
        };
    });

    const switcher = document.getElementById('account-switcher');
    const dropdown = document.getElementById('project-dropdown');
    if (switcher) switcher.onclick = (e) => { e.stopPropagation(); dropdown.classList.toggle('active'); };
    document.addEventListener('click', () => dropdown && dropdown.classList.remove('active'));

    document.querySelectorAll('.dropdown-item[data-acc]').forEach(item => {
        item.onclick = () => {
            document.getElementById('current-account-name').innerText = item.dataset.acc;
            showToast(`${item.dataset.acc} に切り替えました`);
        };
    });

    document.getElementById('btn-logout').onclick = () => {
        document.getElementById('app-root').style.display = 'none';
        document.getElementById('account-selection-screen').style.display = 'flex';
    };

    // --- Sidebar Navigation ---
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => {
            const target = item.dataset.view;
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.view-pane').forEach(v => v.classList.toggle('active', v.id === `view-${target}`));
            if (target === 'campaigns') renderCampaignMgmt('Meta');
            if (target === 'status') renderStatusHistory();
            if (target === 'settings') renderSettings('menu');
        };
    });

    // --- Interaction Router ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.creative-set-card');
        if (card) activeCardId = card.dataset.id;

        // Mode Toggles
        if (e.target.closest('.m-btn')) {
            const btn = e.target.closest('.m-btn');
            btn.parentElement.querySelectorAll('.m-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        // Add Field
        if (e.target.closest('.btn-add-field')) {
            const btn = e.target.closest('.btn-add-field');
            const type = btn.dataset.type;
            const container = btn.closest('.field-group').querySelector('.field-container');
            const row = document.createElement('div');
            row.className = 'field-row';
            const inputHtml = type === 'headline' ? `<input type="text" class="input-headline">` : `<textarea class="input-body"></textarea>`;
            row.innerHTML = `<div class="field-status"><i class="fas fa-check-circle"></i></div><div class="field-main">${inputHtml}<div class="field-counter"></div></div><button class="btn-del-field">×</button>`;
            container.appendChild(row);
            updateCounters(card);
        }

        // Delete Logic
        if (e.target.closest('.btn-del-field')) {
            const container = e.target.closest('.field-container');
            if (container.children.length > 1) e.target.closest('.field-row').remove();
            renderPreview();
        }
        if (e.target.closest('.btn-del-card')) {
            if (document.querySelectorAll('.creative-set-card').length > 1) e.target.closest('.creative-set-card').remove();
        }

        // Add Image Slot
        if (e.target.closest('.btn-add-img-slot')) {
            const container = card.querySelector('.main-image-slots');
            const next = container.querySelector('.image-box').cloneNode(true);
            next.querySelector('.thumb').classList.add('empty');
            next.querySelector('.thumb').style.backgroundImage = 'none';
            container.appendChild(next);
        }

        // Add Card Final
        if (e.target.id === 'btn-add-set-final') {
            const first = document.querySelector('.creative-set-card');
            const next = first.cloneNode(true);
            const count = document.querySelectorAll('.creative-set-card').length + 1;
            next.dataset.id = count;
            next.querySelector('.set-num').innerText = count.toString().padStart(2, '0');
            next.querySelectorAll('input, textarea').forEach(i => i.value = "");
            next.querySelectorAll('.thumb').forEach(t => { t.classList.add('empty'); t.style.backgroundImage = 'none'; });
            document.getElementById('creative-cards-list').appendChild(next);
        }

        // Image Selection
        if (e.target.closest('.upload-area')) {
            pendingUploadTarget = e.target.closest('.upload-area').querySelector('.thumb');
            document.getElementById('global-image-uploader').click();
        }

        // Matrix Selection
        if (e.target.closest('.ms-label')) {
            const pop = e.target.closest('.ms-box').querySelector('.ms-popover');
            const cards = document.querySelectorAll('.creative-set-card');
            pop.innerHTML = `<label style="display:block; padding:5px;"><input type="checkbox" checked> すべて選択</label>` + 
                Array.from(cards).map(c => `<label style="display:block; padding:5px;"><input type="checkbox" checked> 素材セット ${c.dataset.id}</label>`).join('');
            pop.classList.toggle('active');
        }

        if (e.target.id === 'btn-add-matrix-row') {
            const tbody = document.querySelector('#flow-matrix-table tbody');
            const newRow = tbody.rows[0].cloneNode(true);
            tbody.appendChild(newRow);
        }

        // Mgmt Tab Switch
        if (e.target.closest('.plt-tab')) {
            const tab = e.target.closest('.plt-tab');
            tab.parentElement.querySelectorAll('.plt-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderCampaignMgmt(tab.dataset.plt);
        }

        // Preview Navigation
        if (e.target.id === 'p-nav-prev') { currentVarIdx--; renderPreview(); }
        if (e.target.id === 'p-nav-next') { currentVarIdx++; renderPreview(); }

        // Modal Handlers
        if (e.target.closest('.btn-modal-close')) document.getElementById('modal-overlay').classList.remove('active');
    });

    const fileInp = document.getElementById('global-image-uploader');
    if (fileInp) {
        fileInp.onchange = (e) => {
            const file = e.target.files[0];
            if (!file || !pendingUploadTarget) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const url = ev.target.result;
                pendingUploadTarget.classList.remove('empty');
                pendingUploadTarget.style.backgroundImage = `url('${url}')`;
                pendingUploadTarget.dataset.img = url;
                const slot = pendingUploadTarget.closest('.asset-slot');
                if (slot.classList.contains('image-box')) {
                    slot.querySelectorAll('.avt').forEach(t => t.style.backgroundImage = `url('${url}')`);
                }
                renderPreview();
            };
            reader.readAsDataURL(file);
        };
    }

    document.addEventListener('input', (e) => {
        const card = e.target.closest('.creative-set-card');
        if (card) updateCounters(card);
        renderPreview();
    });

    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('sel-media')) {
            const row = e.target.closest('tr');
            const media = e.target.value;
            const cpSel = row.querySelector('.sel-cp');
            cpSel.innerHTML = '<option>キャンペーンを選択</option>';
            if (CAMPAIGN_DATA[media]) Object.keys(CAMPAIGN_DATA[media]).forEach(k => cpSel.add(new Option(k, k)));
        }
        if (e.target.classList.contains('sel-cp')) {
            const row = e.target.closest('tr');
            const media = row.querySelector('.sel-media').value;
            const asSel = row.querySelector('.sel-as');
            asSel.innerHTML = '<option>アドセットを選択</option>';
            if (CAMPAIGN_DATA[media][e.target.value]) {
                CAMPAIGN_DATA[media][e.target.value].adsets.forEach(item => asSel.add(new Option(item.name, item.name)));
            }
        }
    });

    // --- Rendering Functions ---
    function renderDashboard() {
        // Mock refresh
    }

    function renderCampaignMgmt(plt) {
        const body = document.getElementById('mgmt-table-body');
        if (!body) return;
        body.innerHTML = '';
        const data = CAMPAIGN_DATA[plt];
        if (!data) return;
        Object.entries(data).forEach(([cpName, info]) => {
            const cpTr = document.createElement('tr');
            cpTr.className = 'campaign-row';
            cpTr.innerHTML = `<td><span class="platform-badge" style="background:#0f172a; color:#fff">CP</span></td><td><strong>${cpName}</strong></td><td><span class="status-ok">配信中</span></td><td>${info.objective} / ${info.budget}</td><td><button class="btn-icon btn-edit"><i class="fas fa-edit"></i></button></td>`;
            body.appendChild(cpTr);
            info.adsets.forEach(as => {
                const asTr = document.createElement('tr');
                asTr.className = 'adset-row';
                asTr.innerHTML = `<td></td><td>${as.name}</td><td>配信中</td><td>${as.target}</td><td><button class="btn-icon btn-edit"><i class="fas fa-edit"></i></button></td>`;
                body.appendChild(asTr);
            });
        });
        body.querySelectorAll('.btn-edit').forEach(b => b.onclick = () => {
            showModal("詳細設定の編集", `<div class="form-item"><label>案件名</label><input type="text" class="saas-input" value="新作キャンペーン"></div><div class="form-item mt-10"><label>予算</label><input type="text" class="saas-input" value="¥50,000"></div>`);
        });
    }

    function renderStatusHistory() {
        const todo = document.getElementById('status-todo-list');
        const hist = document.getElementById('status-hist-list');
        if (!todo || !hist) return;
        todo.innerHTML = ''; hist.innerHTML = '';
        statusHistory.forEach(item => {
            const tr = document.createElement('tr');
            let btnLabel = item.isApproved ? "最終入稿" : "承認";
            tr.innerHTML = `<td>${item.date}</td><td><span class="platform-badge" style="background:#eef2ff; color:#4f46e5">${item.media}</span></td><td><strong>${item.name}</strong></td><td>${item.status}</td><td><button class="btn btn-primary btn-sm btn-status-action">${btnLabel}</button></td>`;
            tr.querySelector('.btn-status-action').onclick = () => showStatusModal(item);
            if (item.assigned) todo.appendChild(tr); else hist.appendChild(tr);
        });
    }

    function showStatusModal(item) {
        const html = `
            <div style="background:#f1f5f9; padding:20px; border-radius:12px; margin-bottom:20px;">
                <small>確認対象</small><h3>${item.name}</h3><p>媒体: ${item.media}</p>
            </div>
            <div style="max-height:200px; overflow-y:auto; border:1px solid #eee; border-radius:8px;">
                <table class="saas-table" style="font-size:0.8rem;">
                    <thead><tr><th>広告名</th><th>メイン見出し</th></tr></thead>
                    <tbody><tr><td>AD_001</td><td>【公式】最新トレンドアイテム...</td></tr></tbody>
                </table>
            </div>
            <button class="btn btn-primary btn-full mt-20" id="btn-modal-action-exec">${item.isApproved ? '媒体へ送信を確定する' : 'この内容で承認する'}</button>
        `;
        showModal("入稿内容の最終チェック", html);
        document.getElementById('btn-modal-action-exec').onclick = () => {
            if (!item.isApproved) { item.isApproved = true; item.status = "承認済み (作成者戻し)"; showToast("承認しました"); }
            else { item.status = "入稿完了"; item.assigned = false; showToast("各媒体へ入稿しました"); }
            document.getElementById('modal-overlay').classList.remove('active');
            renderStatusHistory();
        };
    }

    function renderSettings(view) {
        const cont = document.getElementById('settings-root');
        if (view === 'menu') {
            cont.innerHTML = `<div class="section-head"><h2>システム設定</h2></div>
            <div class="settings-grid">
                <div class="set-card" onclick="renderSettings('naming')"><i class="fas fa-font"></i><div><strong>広告名ルール</strong><br><small>自動生成の命名定義</small></div></div>
                <div class="set-card" onclick="renderSettings('accounts')"><i class="fas fa-link"></i><div><strong>アカウント連携</strong><br><small>外部媒体の接続管理</small></div></div>
                <div class="set-card" onclick="renderSettings('presets')"><i class="fas fa-tags"></i><div><strong>URLパラメーター</strong><br><small>計測用プリセット</small></div></div>
                <div class="set-card" onclick="renderSettings('user')"><i class="fas fa-user-circle"></i><div><strong>ユーザー設定</strong><br><small>プロフィール・通知</small></div></div>
            </div>`;
        } else if (view === 'naming') {
            cont.innerHTML = `<h2><button class="btn-icon" onclick="renderSettings('menu')"><i class="fas fa-arrow-left"></i></button> 広告名ルール</h2>
            <div class="settings-container mt-20"><label>規則定義</label><input type="text" class="saas-input" value="${namingRule}"><div class="save-bar mt-20" style="text-align:right"><button class="btn btn-primary">設定を保存</button></div></div>`;
        } else if (view === 'accounts') {
            cont.innerHTML = `<h2><button class="btn-icon" onclick="renderSettings('menu')"><i class="fas fa-arrow-left"></i></button> アカウント連携</h2>
            <div class="settings-container mt-20">
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eee;"><span><i class="fab fa-facebook" style="color:#1877f2"></i> Meta Ads (接続中)</span><button class="btn btn-secondary btn-sm">解除</button></div>
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eee;"><span><i class="fab fa-google" style="color:#ea4335"></i> Google Ads (未接続)</span><button class="btn btn-primary btn-sm">連携する</button></div>
                <button class="btn btn-primary mt-20">＋ 新しい媒体を連携</button>
            </div>`;
        } else if (view === 'user') {
            cont.innerHTML = `<h2><button class="btn-icon" onclick="renderSettings('menu')"><i class="fas fa-arrow-left"></i></button> ユーザー設定</h2>
            <div class="settings-container mt-20">
                <div class="form-item"><label>メールアドレス</label><input type="text" class="saas-input" value="flinters@example.com"></div>
                <div class="form-item mt-10"><label>通知設定</label><label><input type="checkbox" checked> 承認依頼をメールで受け取る</label></div>
                <div class="save-bar mt-20" style="text-align:right"><button class="btn btn-primary">更新</button></div>
            </div>`;
        }
    }

    function renderPreview() {
        const card = document.querySelector(`.creative-set-card[data-id="${activeCardId}"]`);
        if (!card) return;
        const h = card.querySelector('.input-headline').value || '見出し';
        const b = card.querySelector('.input-body').value || '本文';
        const cta = card.querySelector('.input-cta').value;
        const logo = card.querySelector('.logo-preview').dataset.img || "";
        const main = card.querySelector('.main-preview').dataset.img || "";

        document.querySelectorAll('.ref-headline').forEach(el => el.innerText = h);
        document.querySelectorAll('.ref-body').forEach(el => el.innerText = b);
        document.querySelectorAll('.ref-cta').forEach(el => el.innerText = cta);
        document.querySelectorAll('.ref-img').forEach(el => { el.style.backgroundImage = main ? `url('${main}')` : "none"; el.style.backgroundSize='cover'; });
        document.querySelectorAll('.ref-logo').forEach(el => { el.style.backgroundImage = logo ? `url('${logo}')` : "none"; el.style.backgroundSize='contain'; });
    }

    // --- Flow ---
    const btnNext = document.getElementById('btn-flow-next');
    const btnPrev = document.getElementById('btn-flow-prev');
    if (btnNext) {
        btnNext.onclick = () => {
            if (currentFlowStep < 2) { currentFlowStep++; updateFlow(); }
            else if (currentFlowStep === 2) { 
                document.getElementById('step-3-gen-box').innerHTML = `<div style="padding:80px; text-align:center;"><h3>データ生成完了</h3><p>24件のバリエーションを確認してください</p></div>`;
                currentFlowStep++; updateFlow();
            } else if (currentFlowStep === 3) {
                document.getElementById('step-4-final-box').innerHTML = `<div style="padding:80px; text-align:center;"><h3>最終確認完了</h3><p>全ての媒体設定に問題ありません。承認依頼へ進んでください。</p></div>`;
                currentFlowStep++; updateFlow();
            } else { showToast("承認依頼を送信しました"); }
        };
    }
    if (btnPrev) btnPrev.onclick = () => { currentFlowStep--; updateFlow(); };

    function updateFlow() {
        document.querySelectorAll('.pane').forEach((p, i) => p.classList.toggle('active', i+1 === currentFlowStep));
        document.querySelectorAll('.step').forEach((s, i) => s.classList.toggle('active', i+1 <= currentFlowStep));
        btnPrev.style.display = currentFlowStep > 1 ? 'block' : 'none';
        btnNext.innerText = currentFlowStep === 4 ? "承認依頼を送信" : "次へ進む";
        renderPreview();
    }

    function showModal(title, html) {
        document.getElementById('modal-body-content').innerHTML = `<h3>${title}</h3><div class="mt-20">${html}</div>`;
        document.getElementById('modal-overlay').classList.add('active');
    }
    document.getElementById('btn-modal-save-exec').onclick = () => { showToast("保存しました"); document.getElementById('modal-overlay').classList.remove('active'); };

    // --- Init ---
    renderDashboard();
    updateCounters(document.querySelector('.creative-set-card'));
    window.renderSettings = renderSettings; 
});
