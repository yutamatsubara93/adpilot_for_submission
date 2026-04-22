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

        // 2. Sidebar Navigation
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            const target = navItem.dataset.view;
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            navItem.classList.add('active');
            document.querySelectorAll('.view-pane').forEach(v => v.classList.toggle('active', v.id === `view-${target}`));
            
            // Call modular render functions
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
            const statusNav = document.querySelector('.nav-item[data-view="status"]');
            if(statusNav) statusNav.click();
        }

        // 4. Modal Global Close
        if (e.target.closest('.btn-modal-close')) {
            document.getElementById('modal-overlay').classList.remove('active');
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
    });

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
