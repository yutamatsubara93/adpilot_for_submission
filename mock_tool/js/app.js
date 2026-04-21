/* --- Main App Orchestrator --- */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Global State ---
    const state = {
        currentFlowStep: 1,
        activeCardId: "1"
    };

    // --- Helpers ---
    function showToast(msg) {
        const cont = document.getElementById('toast-container');
        if (!cont) return;
        const t = document.createElement('div');
        t.className = 'toast'; t.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
        cont.appendChild(t);
        setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 3000);
    }

    // --- Global Click Router ---
    document.addEventListener('click', (e) => {
        // 1. Auth & Account Switcher
        if (e.target.id === 'btn-login-exec') {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('account-selection-screen').style.display = 'flex';
        }
        
        const accBtn = e.target.closest('.btn-account-select');
        if (accBtn) {
            document.getElementById('account-selection-screen').style.display = 'none';
            document.getElementById('app-root').style.display = 'flex';
            document.getElementById('current-account-name').innerText = accBtn.dataset.account;
            renderDashboard();
        }

        if (e.target.id === 'btn-logout') {
            document.getElementById('app-root').style.display = 'none';
            document.getElementById('account-selection-screen').style.display = 'flex';
        }

        const switcher = e.target.closest('#account-switcher');
        if (switcher) {
            e.stopPropagation();
            document.getElementById('project-dropdown').classList.toggle('active');
        } else {
            const dropdown = document.getElementById('project-dropdown');
            if(dropdown) dropdown.classList.remove('active');
        }

        const dropItem = e.target.closest('.dropdown-item[data-acc]');
        if (dropItem) {
            e.stopPropagation();
            const name = dropItem.dataset.acc;
            document.getElementById('current-account-name').innerText = name;
            document.getElementById('project-dropdown').classList.remove('active');
            showToast(`${name} に切り替えました`);
        }

        // 2. Sidebar Navigation
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            const target = navItem.dataset.view;
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            navItem.classList.add('active');
            document.querySelectorAll('.view-pane').forEach(v => v.classList.toggle('active', v.id === `view-${target}`));
            if (target === 'dashboard') renderDashboard();
            if (target === 'campaigns') renderCampaignMgmt('Meta');
            if (target === 'status') renderStatusHistory();
            if (target === 'settings') renderSettings();
        }

        // 3. Flow Navigation
        if (e.target.id === 'btn-flow-next') {
            if (state.currentFlowStep < 4) { state.currentFlowStep++; window.updateFlow(state); }
            else if (state.currentFlowStep === 4) { state.currentFlowStep = 5; window.updateFlow(state); }
        }
        if (e.target.id === 'btn-flow-prev') { state.currentFlowStep--; window.updateFlow(state); }
        if (e.target.id === 'btn-success-back') {
            state.currentFlowStep = 1;
            const firstNav = document.querySelectorAll('.nav-item')[0];
            if(firstNav) firstNav.click();
        }

        // 4. Preview Specifics
        if (e.target.id === 'p-nav-prev') {
            const cards = document.querySelectorAll('.creative-set-card');
            let idx = Array.from(cards).findIndex(c => c.dataset.id === state.activeCardId);
            if (idx > 0) cards[idx - 1].click();
        }
        if (e.target.id === 'p-nav-next') {
            const cards = document.querySelectorAll('.creative-set-card');
            let idx = Array.from(cards).findIndex(c => c.dataset.id === state.activeCardId);
            if (idx < cards.length - 1) cards[idx + 1].click();
        }
        if (e.target.id === 'btn-open-preview') {
            const sidebar = document.getElementById('creation-preview-sidebar');
            const isVisible = sidebar.style.display === 'flex';
            sidebar.style.display = isVisible ? 'none' : 'flex';
            e.target.classList.toggle('active', !isVisible);
        }

        // 5. Creation Specifics (Delegate)
        window.handleCreationClick(e, state, showToast);

        // 6. Modals
        if (e.target.closest('.btn-modal-close')) document.getElementById('modal-overlay').classList.remove('active');
    });

    // --- Input Events ---
    document.addEventListener('input', (e) => {
        const card = e.target.closest('.creative-set-card');
        if (card) window.updateCounters(card);
    });

    // --- Media Change Logic ---
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('sel-media')) {
            const row = e.target.closest('tr');
            const media = e.target.value;
            const cpSel = row.querySelector('.sel-cp');
            cpSel.innerHTML = '<option>キャンペーンを選択</option>';
            if (window.CAMPAIGN_DATA[media]) Object.keys(window.CAMPAIGN_DATA[media]).forEach(k => cpSel.add(new Option(k, k)));
        }
        if (e.target.classList.contains('sel-cp')) {
            const row = e.target.closest('tr');
            const media = row.querySelector('.sel-media').value;
            const asSel = row.querySelector('.sel-as');
            asSel.innerHTML = '<option>アドセットを選択</option>';
            if (window.CAMPAIGN_DATA[media][e.target.value]) {
                window.CAMPAIGN_DATA[media][e.target.value].adsets.forEach(item => asSel.add(new Option(item.name, item.name)));
            }
        }
    });

    // --- Page Renders ---
    function renderDashboard() { /* Auto refresh via CSS */ }

    function renderCampaignMgmt(plt) {
        const body = document.getElementById('mgmt-table-body');
        if (!body) return; body.innerHTML = '';
        const data = window.CAMPAIGN_DATA[plt];
        if (!data) return;
        Object.entries(data).forEach(([cpName, info]) => {
            const cpTr = document.createElement('tr'); cpTr.className = 'campaign-row';
            cpTr.innerHTML = `<td><span class=\"platform-badge badge-${plt.toLowerCase()}\">CP</span></td><td><strong>${cpName}</strong></td><td><span class=\"success\">配信中</span></td><td>${info.objective} / ${info.budget}</td><td><button class=\"btn-icon\"><i class=\"fas fa-edit\"></i></button></td>`;
            body.appendChild(cpTr);
            info.adsets.forEach(as => {
                const asTr = document.createElement('tr'); asTr.className = 'adset-row';
                asTr.innerHTML = `<td></td><td>${as.name}</td><td>配信中</td><td>${as.target}</td><td><button class=\"btn-icon\"><i class=\"fas fa-edit\"></i></button></td>`;
                body.appendChild(asTr);
            });
        });
    }

    function renderStatusHistory() {
        const todo = document.getElementById('status-todo-list');
        if (!todo) return; todo.innerHTML = '';
        window.statusHistory.forEach(item => {
            const tr = document.createElement('tr');
            let btnLabel = item.isApproved ? "最終入稿" : "承認";
            let btnClass = item.isApproved ? "btn-status-final" : "btn-status-approve";
            tr.innerHTML = `<td>${item.date}</td><td><span class=\"platform-badge badge-${item.media.toLowerCase()}\">${item.media}</span></td><td><strong>${item.name}</strong></td><td>${item.status}</td><td><button class=\"btn btn-sm btn-status-action ${btnClass}\">${btnLabel}</button></td>`;
            todo.appendChild(tr);
        });
    }

    function renderSettings() {
        const root = document.getElementById('settings-root');
        if (!root) return;
        root.innerHTML = `
            <div class="view-title"><h2>設定</h2></div>
            <div class="settings-grid">
                <div class="set-card"><i class="fas fa-user-cog"></i><div><strong>ユーザープロフィール</strong><p>名前、メールアドレス、パスワードの変更</p></div></div>
                <div class="set-card"><i class="fas fa-shield-alt"></i><div><strong>セキュリティ</strong><p>2段階認証、ログイン履歴の確認</p></div></div>
                <div class="set-card"><i class="fas fa-bell"></i><div><strong>通知設定</strong><p>入稿承認、システムアラートの通知設定</p></div></div>
                <div class="set-card"><i class="fas fa-link"></i><div><strong>外部サービス連携</strong><p>各広告媒体のAPI認証管理</p></div></div>
            </div>`;
    }

    // --- Init ---
    window.updateFlow(state);
    const firstCard = document.querySelector('.creative-set-card');
    if(firstCard) firstCard.classList.add('active');
});
