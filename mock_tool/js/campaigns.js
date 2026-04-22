/* --- Campaign Management Logic --- */
window.renderCampaignMgmt = function(plt) {
    const body = document.getElementById('mgmt-table-body');
    if (!body) return; body.innerHTML = '';
    const data = window.CAMPAIGN_DATA[plt];
    if (!data) return;
    
    Object.entries(data).forEach(([cpName, info]) => {
        const cpTr = document.createElement('tr'); cpTr.className = 'campaign-row';
        cpTr.innerHTML = `
            <td><span class="platform-badge badge-${plt.toLowerCase()}">CP</span></td>
            <td><strong>${cpName}</strong></td>
            <td><span class="status-tag done">配信中</span></td>
            <td>${info.objective} / ${info.budget}</td>
            <td>
                <div class="mgmt-ops">
                    <button class="btn-mgmt-icon"><i class="fas fa-edit"></i></button>
                    <button class="btn-mgmt-icon text-danger"><i class="fas fa-trash"></i></button>
                </div>
            </td>`;
        body.appendChild(cpTr);
        
        info.adsets.forEach(as => {
            const asTr = document.createElement('tr'); asTr.className = 'adset-row';
            asTr.innerHTML = `
                <td></td>
                <td><span class="tree-line">└</span> ${as.name}</td>
                <td><span class="status-tag done">有効</span></td>
                <td>${as.target}</td>
                <td>
                    <div class="mgmt-ops">
                        <button class="btn-mgmt-icon"><i class="fas fa-cog"></i></button>
                        <button class="btn-mgmt-icon text-danger"><i class="fas fa-trash"></i></button>
                    </div>
                </td>`;
            body.appendChild(asTr);
        });
    });

    const cpNewBtn = document.getElementById('btn-cp-new');
    const asNewBtn = document.getElementById('btn-as-new');
    
    if (cpNewBtn) cpNewBtn.onclick = () => window.openMgmtModal('campaign');
    if (asNewBtn) asNewBtn.onclick = () => window.openMgmtModal('adset');
};

window.openMgmtModal = function(type) {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-body-content');
    const isCp = type === 'campaign';
    
    content.innerHTML = `
        <div class="view-title"><h2>${isCp ? 'キャンペーン' : 'アドセット'}追加</h2><p>新しい情報を登録します。</p></div>
        <div class="f-item mb-15"><label>名称</label><input type="text" class="saas-input" placeholder="名称を入力"></div>
        <div class="f-item mb-15"><label>${isCp ? '目的' : 'ターゲット'}</label><input type="text" class="saas-input" placeholder="${isCp ? 'CV / トラフィック等' : 'ターゲット地域 / 属性'}"></div>
        ${isCp ? '<div class="f-item mb-15"><label>予算</label><input type="text" class="saas-input" placeholder="¥10,000"></div>' : ''}
    `;
    modal.classList.add('active');
    
    const saveBtn = document.getElementById('btn-modal-save-exec');
    saveBtn.onclick = () => {
        modal.classList.remove('active');
        if(window.showToast) window.showToast(`${isCp ? 'キャンペーン' : 'アドセット'}を追加しました`);
    };
};
