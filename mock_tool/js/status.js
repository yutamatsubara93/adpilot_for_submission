/* --- Status & Approval Flow Logic --- */

const currentUser = "山田 太郎"; // Simulate current user

window.renderStatusHistory = function() {
    const actionList = document.getElementById('status-action-list');
    const allList = document.getElementById('status-all-list');
    if (!actionList || !allList) return;
    
    actionList.innerHTML = '';
    allList.innerHTML = '';

    window.statusHistory.forEach(item => {
        let opsHtml = '';
        const isApplicant = item.creator === currentUser;
        const isApprover = item.assignee === currentUser;

        if (isApplicant) {
            if (item.status.includes("差し戻し")) {
                opsHtml = `<button class="btn btn-sm btn-primary">編集する</button>`;
            } else if (item.canFinalize) {
                opsHtml = `<button class="btn btn-sm btn-status-final">最終入稿する</button>`;
            } else if (!item.isApproved) {
                opsHtml = `<button class="btn btn-sm btn-secondary">承認依頼中</button>`;
            } else {
                opsHtml = `<button class="btn btn-sm btn-secondary btn-status-detail" data-id="${item.id}">詳細を確認</button>`;
            }
        } else if (isApprover) {
            opsHtml = `<button class="btn btn-sm btn-status-approve btn-status-detail" data-id="${item.id}">承認する</button>`;
        } else {
            opsHtml = `<button class="btn btn-sm btn-secondary btn-status-detail" data-id="${item.id}">詳細を確認</button>`;
        }

        const row = `
            <tr>
                <td><small>${item.date}</small></td>
                <td><span class="platform-badge badge-${item.media.toLowerCase()}">${item.media}</span></td>
                <td><strong>${item.name}</strong></td>
                <td>${item.creator}</td>
                <td>${item.assignee}</td>
                <td><span class="status-tag ${item.isApproved ? 'done' : 'waiting'}">${item.status}</span></td>
                <td>
                    <div class="mgmt-ops">
                        ${opsHtml}
                    </div>
                </td>
            </tr>`;
        
        if (item.assigned && (isApprover || (isApplicant && item.status.includes("差し戻し")))) actionList.innerHTML += row;
        allList.innerHTML += row;
    });
};

window.openStatusDetail = function(item) {
    if (!item) return;
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-body-content');
    const footer = document.getElementById('modal-footer-actions');
    
    content.innerHTML = `
        <div class="view-title"><h2>${item.name} の詳細確認</h2><p>媒体: ${item.media} / ステータス: ${item.status}</p></div>
        <div class="summary-alert"><i class="fas fa-info-circle"></i> 以下の内容で申請されています。内容を確認し、承認または差し戻しを行ってください。</div>
        <div class="table-container-card">
            <table class="saas-table">
                <thead><tr><th>サイズ</th><th>テキスト内容</th><th>URL</th></tr></thead>
                <tbody>
                    <tr><td>1:1</td><td>春の新作セール実施中！</td><td>https://example.com/item1</td></tr>
                    <tr><td>1.91:1</td><td>【限定】春の新作セール</td><td>https://example.com/item2</td></tr>
                    <tr><td>4:5</td><td>セール開催中。お見逃しなく</td><td>https://example.com/item3</td></tr>
                </tbody>
            </table>
        </div>
    `;

    if (item.canFinalize) {
        footer.innerHTML = `<button class="btn btn-primary" onclick="location.reload()"><i class="fas fa-paper-plane"></i> 最終入稿を実行する</button>`;
    } else if (item.assigned && !item.isApproved) {
        footer.innerHTML = `
            <button class="btn btn-secondary" onclick="location.reload()">差し戻す</button>
            <button class="btn btn-primary" onclick="location.reload()">承認する</button>
        `;
    } else {
        footer.innerHTML = `<button class="btn btn-secondary btn-modal-close">閉じる</button>`;
    }
    
    modal.classList.add('active');
};
