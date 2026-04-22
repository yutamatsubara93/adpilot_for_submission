/* --- Shared Data --- */
window.LIMITS = {
    headline: { Meta: 40, Google: 30, Yahoo: 20, LINE: 20, TikTok: 20, X: 20 },
    body: { Meta: 125, Google: 90, Yahoo: 75, LINE: 75, TikTok: 100, X: 280 }
};

window.CAMPAIGN_DATA = {
    Meta: { 
        "CP_Meta_Spring_2026": { objective: "CV", budget: "¥150,000", adsets: [
            { name: "AS_Men_20s_Tokyo", target: "Tokyo / 20-29 / Male" }, 
            { name: "AS_Women_20s_Tokyo", target: "Tokyo / 20-29 / Female" },
            { name: "AS_All_Interest_Fashion", target: "JP / 18-45 / Fashion Interest" }
        ]},
        "CP_Meta_ReTargeting": { objective: "Sales", budget: "¥80,000", adsets: [
            { name: "AS_ViewContent_7d", target: "Visitors / 7days" }
        ]}
    },
    Google: { 
        "CP_GSearch_Brand_Name": { objective: "Search", budget: "¥200,000", adsets: [
            { name: "AG_Official_Keywords", target: "KW: ADPILOT, アドパイロット" }
        ]},
        "CP_GDisplay_Prospecting": { objective: "Traffic", budget: "¥100,000", adsets: [
            { name: "AG_Display_Beauty", target: "Topic: Beauty & Fitness" },
            { name: "AG_Display_Gadget", target: "Audience: Tech Lovers" }
        ]}
    },
    Yahoo: { 
        "CP_YDisplay_TopPage": { objective: "Reach", budget: "¥50,000", adsets: [
            { name: "AS_Yahoo_Top_All", target: "JP / 18-65 / All" }
        ]} 
    },
    LINE: { 
        "CP_LINE_Timeline_Promo": { objective: "Friends", budget: "¥30,000", adsets: [
            { name: "AS_Timeline_User_JP", target: "JP / 20-49" }
        ]} 
    },
    TikTok: { 
        "CP_TikTok_Challenge": { objective: "Views", budget: "¥300,000", adsets: [
            { name: "AS_Challenge_Viral", target: "JP / 13-24 / Entertainment" }
        ]} 
    },
    X: { 
        "CP_X_Trend_Takeover": { objective: "Reach", budget: "¥1,000,000", adsets: [
            { name: "AS_Trend_Day1", target: "JP / All" }
        ]} 
    }
};

window.MOCK_IMAGES = {
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=300&q=80",
    main: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&h=628&q=80",
    sq: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&h=600&q=80",
    rect: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&h=628&q=80",
    img1: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
    img2: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    img3: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    img4: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80",
    img5: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80"
};

window.statusHistory = [
    { id: 401, date: "2026-04-21 10:05", media: "Meta", name: "春の新作キャンペーン", creator: "山田 太郎", assignee: "佐藤 健二", status: "承認待ち (上長承認)", assigned: true, isApproved: false, canFinalize: false },
    { id: 402, date: "2026-04-20 09:30", media: "Google", name: "SALE素材A", creator: "田中 美咲", assignee: "山田 太郎", status: "承認済み (要最終入稿)", assigned: true, isApproved: true, canFinalize: true },
    { id: 403, date: "2026-04-19 15:00", media: "Yahoo", name: "冬物処分セール", creator: "鈴木 一郎", assignee: "完了", status: "入稿完了", assigned: false, isApproved: true, canFinalize: false },
    { id: 404, date: "2026-04-18 11:20", media: "Meta", name: "リターゲティング春", creator: "山田 太郎", assignee: "田中 美咲", status: "差し戻し", assigned: false, isApproved: false, canFinalize: false }
];
