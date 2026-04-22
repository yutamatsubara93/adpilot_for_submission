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
            <td><button class="btn-icon"><i class="fas fa-edit"></i></button><button class="btn-icon text-danger"><i class="fas fa-trash"></i></button></td>`;
        body.appendChild(cpTr);
        
        info.adsets.forEach(as => {
            const asTr = document.createElement('tr'); asTr.className = 'adset-row';
            asTr.innerHTML = `
                <td></td>
                <td><span class="tree-line">└</span> ${as.name}</td>
                <td><span class="status-tag done">有効</span></td>
                <td>${as.target}</td>
                <td><button class="btn-icon"><i class="fas fa-cog"></i></button></td>`;
            body.appendChild(asTr);
        });
    });
};
