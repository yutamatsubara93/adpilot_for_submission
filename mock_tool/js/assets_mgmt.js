/* --- Assets Management Logic --- */
window.renderAssets = function() {
    const uploadBtn = document.getElementById('btn-asset-upload-open');
    if (uploadBtn) {
        uploadBtn.onclick = () => {
            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-body-content');
            content.innerHTML = `
                <div class="view-title"><h2>新規素材アップロード</h2><p>ロゴや画像を登録します。</p></div>
                <div class="f-item mb-20">
                    <label>素材種別</label>
                    <select class="saas-input" id="upload-asset-type">
                        <option value="logo">ブランドロゴ (1:1)</option>
                        <option value="common">共通素材 (画像)</option>
                    </select>
                </div>
                <div class="upload-area" style="height:200px; border-style:dashed;">
                    <div class="upload-placeholder"><i class="fas fa-cloud-upload-alt"></i><span>ファイルをドラッグ＆ドロップ</span></div>
                </div>
            `;
            modal.classList.add('active');
            
            const saveBtn = document.getElementById('btn-modal-save-exec');
            saveBtn.onclick = () => {
                modal.classList.remove('active');
                if(window.showToast) window.showToast("素材をアップロードしました");
            };
        };
    }

    // Deletion Logic
    document.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.btn-asset-del');
        if (delBtn) {
            const card = delBtn.closest('.gallery-item-card');
            if (confirm("この素材を削除してもよろしいですか？")) {
                card.remove();
                if(window.showToast) window.showToast("素材を削除しました");
            }
        }
    });
};
