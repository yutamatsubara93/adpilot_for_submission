/* --- Shared Data --- */
window.LIMITS = {
    headline: { Meta: 40, Google: 30, Yahoo: 20, LINE: 20, TikTok: 20, X: 20 },
    body: { Meta: 125, Google: 90, Yahoo: 75, LINE: 75, TikTok: 100, X: 280 }
};

window.CAMPAIGN_DATA = {
    Meta: { "CP_Meta_Spring": { objective: "CV", budget: "¥50,000", adsets: [{ name: "AS_Men_20s", target: "JP / 20-29 / Male" }, { name: "AS_Women_20s", target: "JP / 20-29 / Female" }] } },
    Google: { "CP_GSearch_Sales": { objective: "Sales", budget: "¥100,000", adsets: [{ name: "AG_Shoes", target: "KW: Shoes, Sneakers" }] } },
    Yahoo: { "CP_YDisplay_Main": { objective: "Traffic", budget: "¥15,000", adsets: [{ name: "AS_Standard", target: "JP / 18-65" }] } },
    LINE: { "CP_LINE_Friends": { objective: "Friends", budget: "¥30,000", adsets: [{ name: "AS_LINE_Users", target: "JP / 20-45" }] } },
    TikTok: { "CP_TikTok_Video": { objective: "Views", budget: "¥40,000", adsets: [{ name: "AS_TikTok_Youth", target: "JP / 13-24" }] } },
    X: { "CP_X_Trend": { objective: "Engagement", budget: "¥25,000", adsets: [{ name: "AS_X_Followers", target: "JP / All" }] } }
};

window.MOCK_IMAGES = {
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=300&q=80",
    main: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&h=628&q=80",
    sq: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&h=600&q=80",
    rect: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&h=628&q=80"
};

window.statusHistory = [
    { id: 401, date: "2026-04-16 10:05", media: "Meta", name: "春の新作キャンペーン", status: "承認済み (作成者戻し)", assigned: true, isApproved: true },
    { id: 402, date: "2026-04-16 09:30", media: "Google", name: "SALE素材A", status: "承認待ち", assigned: true, isApproved: false },
    { id: 403, date: "2026-04-15 15:00", media: "Yahoo", name: "冬物処分セール", status: "入稿完了", assigned: false, isApproved: true }
];
