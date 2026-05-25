/* ============================================================
   i18n — G20 languages
   Languages dropdown lives in #nav-panel (top-center) so it sits
   alongside the country flag strip rather than competing with
   Leaflet's layer control at top-right.
   ============================================================ */
(function () {
  var LANGS = [
    { code: 'en', label: 'English',          flag: '🇬🇧' },
    { code: 'fr', label: 'Français',         flag: '🇫🇷' },
    { code: 'es', label: 'Español',          flag: '🇪🇸' },
    { code: 'pt', label: 'Português',        flag: '🇧🇷' },
    { code: 'de', label: 'Deutsch',          flag: '🇩🇪' },
    { code: 'it', label: 'Italiano',         flag: '🇮🇹' },
    { code: 'ru', label: 'Русский',          flag: '🇷🇺' },
    { code: 'zh', label: '中文',              flag: '🇨🇳' },
    { code: 'ja', label: '日本語',            flag: '🇯🇵' },
    { code: 'ko', label: '한국어',            flag: '🇰🇷' },
    { code: 'hi', label: 'हिन्दी',           flag: '🇮🇳' },
    { code: 'ar', label: 'العربية',          flag: '🇸🇦' },
    { code: 'tr', label: 'Türkçe',           flag: '🇹🇷' },
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' }
  ];
  var RTL = { ar: true };

  var I18N = {
    en: {
      title: 'G20 Embassy Distance Map',
      description: 'Distance between G20 embassies and host country power centers. Click a flag button above or use the layer control to explore.',
      viewMatrix: 'View Distance Matrix Table',
      howToTitle: 'How to use',
      howToCountries: 'Open the country menu at the top, then click a country flag to zoom in. Click the same country again to zoom out.',
      howToMarkers: 'Click a flag marker on the map to see the embassy details and browse the timeline of past addresses.',
      hintsTitle: 'Quick tips',
      hintsCountries: 'Open the country menu at the top, then tap a country to zoom in. Tap it again to zoom out.',
      hintsMarkers: 'Tap an embassy flag on the map to open its history timeline.',
      dismissHints: 'Dismiss tips',
      avgRanking: 'Average Distance Ranking',
      legend: 'Legend',
      powerCenterLegend: 'Power Center (government seat)',
      embassyLegend: 'Embassy location (flag of origin country)',
      closeLegend: 'Close to power center',
      farLegend: 'Far from power center',
      easySpying: 'Easy spying (~1 km): documented SCS placements, GSM/WiFi/RF urban range',
     maxSpying: 'Max spying (~5 km): line-of-sight microwave, counter-intel zoning range',
      euDelegationLegend: 'EU points are delegations, not embassies — the EU is not a sovereign state.',
    },
    fr: {
      title: 'Carte des distances des ambassades du G20',
      description: 'Distance entre les ambassades du G20 et les centres du pouvoir du pays hôte. Cliquez un drapeau ci-dessus ou utilisez le contrôle des couches pour explorer.',
      viewMatrix: 'Voir le tableau des distances',
      howToTitle: 'Comment utiliser',
      howToCountries: 'Ouvrez le menu des pays en haut, puis cliquez sur un drapeau pour zoomer. Cliquez à nouveau sur le même pays pour dézoomer.',
      howToMarkers: 'Cliquez sur un drapeau de la carte pour voir les détails de l’ambassade et parcourir la chronologie des adresses passées.',
      hintsTitle: 'Astuces rapides',
      hintsCountries: 'Ouvrez le menu des pays en haut, puis touchez un pays pour zoomer. Re-touchez pour dézoomer.',
      hintsMarkers: 'Touchez un drapeau sur la carte pour ouvrir la chronologie de l’ambassade.',
      dismissHints: 'Fermer les astuces',
      avgRanking: 'Classement par distance moyenne',
      legend: 'Légende',
      powerCenterLegend: 'Centre du pouvoir (siège du gouvernement)',
      embassyLegend: 'Emplacement de l’ambassade (drapeau du pays d’origine)',
      closeLegend: 'Proche du centre du pouvoir',
      farLegend: 'Loin du centre du pouvoir',
      easySpying: 'Espionnage facile (~1 km) : emplacements SCS documentés, portée GSM/WiFi/RF urbaine',
     maxSpying: 'Espionnage max (~5 km) : micro-ondes en visibilité directe, périmètre de contre-espionnage',
      euDelegationLegend: 'Les points UE sont des délégations, pas des ambassades — l\u2019UE n\u2019est pas un État souverain.',
    },
    es: {
      title: 'Mapa de distancias de embajadas del G20',
      description: 'Distancia entre embajadas del G20 y los centros de poder del país anfitrión. Pulse una bandera arriba o use el control de capas para explorar.',
      viewMatrix: 'Ver tabla de distancias',
      howToTitle: 'Cómo usar',
      howToCountries: 'Abra el menú de países en la parte superior y luego haga clic en una bandera para acercar. Haga clic en el mismo país de nuevo para alejar.',
      howToMarkers: 'Haga clic en un marcador de bandera en el mapa para ver los detalles de la embajada y consultar la cronología de direcciones pasadas.',
      hintsTitle: 'Consejos rápidos',
      hintsCountries: 'Abra el menú de países arriba y luego toque un país para acercar. Toque de nuevo para alejar.',
      hintsMarkers: 'Toque la bandera de una embajada en el mapa para abrir su cronología histórica.',
      dismissHints: 'Cerrar consejos',
      avgRanking: 'Clasificación por distancia media',
      legend: 'Leyenda',
      powerCenterLegend: 'Centro de poder (sede del gobierno)',
      embassyLegend: 'Ubicación de la embajada (bandera del país de origen)',
      closeLegend: 'Cerca del centro de poder',
      farLegend: 'Lejos del centro de poder',
      easySpying: 'Espionaje fácil (~1 km): emplazamientos SCS documentados, alcance GSM/WiFi/RF urbano',
     maxSpying: 'Espionaje máx. (~5 km): microondas con línea de vista, perímetro de contraespionaje',
      euDelegationLegend: 'Los puntos de la UE son delegaciones, no embajadas — la UE no es un Estado soberano.',
    },
    pt: {
      title: 'Mapa de distâncias das embaixadas do G20',
      description: 'Distância entre embaixadas do G20 e os centros de poder do país anfitrião. Clique numa bandeira acima ou use o controlo de camadas para explorar.',
      viewMatrix: 'Ver tabela de distâncias',
      howToTitle: 'Como usar',
      howToCountries: 'Abra o menu de países no topo e depois clique numa bandeira para ampliar. Clique no mesmo país novamente para reduzir o zoom.',
      howToMarkers: 'Clique num marcador de bandeira no mapa para ver os detalhes da embaixada e percorrer a cronologia dos endereços anteriores.',
      hintsTitle: 'Dicas rápidas',
      hintsCountries: 'Abra o menu de países no topo e depois toque num país para ampliar. Toque novamente para reduzir.',
      hintsMarkers: 'Toque numa bandeira no mapa para abrir a cronologia da embaixada.',
      dismissHints: 'Fechar dicas',
      avgRanking: 'Classificação por distância média',
      legend: 'Legenda',
      powerCenterLegend: 'Centro do poder (sede do governo)',
      embassyLegend: 'Localização da embaixada (bandeira do país de origem)',
      closeLegend: 'Perto do centro do poder',
      farLegend: 'Longe do centro do poder',
      easySpying: 'Espionagem fácil (~1 km): instalações SCS documentadas, alcance GSM/WiFi/RF urbano',
     maxSpying: 'Espionagem máx. (~5 km): micro-ondas em linha de vista, perímetro de contraespionagem',
      euDelegationLegend: 'Os pontos da UE são delegações, não embaixadas — a UE não é um Estado soberano.',
    },
    de: {
      title: 'G20-Botschaftsentfernungskarte',
      description: 'Entfernung zwischen G20-Botschaften und den Machtzentren des Gastlandes. Klicken Sie auf eine Flagge oben oder verwenden Sie die Layer-Steuerung.',
      viewMatrix: 'Distanzmatrix anzeigen',
      howToTitle: 'Bedienung',
      howToCountries: 'Öffnen Sie das Ländermenü oben und klicken Sie dann auf eine Flagge, um hineinzuzoomen. Klicken Sie erneut auf dasselbe Land, um herauszuzoomen.',
      howToMarkers: 'Klicken Sie auf einen Flaggen-Marker auf der Karte, um die Botschaftsdetails zu sehen und die Zeitleiste der früheren Adressen zu durchsuchen.',
      hintsTitle: 'Schnelle Tipps',
      hintsCountries: 'Öffnen Sie das Ländermenü oben und tippen Sie dann auf ein Land, um hineinzuzoomen. Erneut antippen zum Herauszoomen.',
      hintsMarkers: 'Tippen Sie auf eine Botschaftsflagge auf der Karte, um deren Zeitleiste zu öffnen.',
      dismissHints: 'Tipps schließen',
      avgRanking: 'Rangliste nach Durchschnittsentfernung',
      legend: 'Legende',
      powerCenterLegend: 'Machtzentrum (Regierungssitz)',
      embassyLegend: 'Botschaftsstandort (Flagge des Herkunftslandes)',
      closeLegend: 'Nah am Machtzentrum',
      farLegend: 'Weit vom Machtzentrum',
      easySpying: 'Leichte Spionage (~1 km): dokumentierte SCS-Standorte, GSM/WiFi/RF-Reichweite in der Stadt',
     maxSpying: 'Max. Spionage (~5 km): Mikrowelle in Sichtlinie, Reichweite der Spionageabwehr',
      euDelegationLegend: 'EU-Punkte sind Delegationen, keine Botschaften — die EU ist kein souveräner Staat.',
    },
    it: {
      title: 'Mappa delle distanze delle ambasciate del G20',
      description: 'Distanza tra le ambasciate del G20 e i centri di potere del paese ospitante. Clicca una bandiera sopra o usa il controllo dei livelli.',
      viewMatrix: 'Visualizza tabella delle distanze',
      howToTitle: 'Come usare',
      howToCountries: 'Apri il menu dei paesi in alto, poi clicca su una bandiera per ingrandire. Clicca di nuovo sullo stesso paese per ridurre lo zoom.',
      howToMarkers: 'Clicca su un marker bandiera sulla mappa per vedere i dettagli dell’ambasciata e sfogliare la cronologia degli indirizzi passati.',
      hintsTitle: 'Consigli rapidi',
      hintsCountries: 'Apri il menu dei paesi in alto, poi tocca un paese per ingrandire. Tocca di nuovo per ridurre lo zoom.',
      hintsMarkers: 'Tocca una bandiera di ambasciata sulla mappa per aprire la cronologia.',
      dismissHints: 'Chiudi i consigli',
      avgRanking: 'Classifica per distanza media',
      legend: 'Legenda',
      powerCenterLegend: 'Centro del potere (sede del governo)',
      embassyLegend: 'Posizione dell’ambasciata (bandiera del paese d’origine)',
      closeLegend: 'Vicino al centro del potere',
      farLegend: 'Lontano dal centro del potere',
      easySpying: 'Spionaggio facile (~1 km): impianti SCS documentati, portata GSM/WiFi/RF urbana',
     maxSpying: 'Spionaggio max (~5 km): microonde in visibilità diretta, perimetro di controspionaggio',
      euDelegationLegend: 'I punti UE sono delegazioni, non ambasciate — l\u2019UE non è uno Stato sovrano.',
    },
    ru: {
      title: 'Карта расстояний посольств G20',
      description: 'Расстояние между посольствами G20 и центрами власти принимающей страны. Нажмите на флаг выше или используйте управление слоями.',
      viewMatrix: 'Смотреть таблицу расстояний',
      howToTitle: 'Как пользоваться',
      howToCountries: 'Откройте меню стран вверху, затем нажмите флаг страны, чтобы приблизить. Нажмите ту же страну ещё раз, чтобы отдалить.',
      howToMarkers: 'Нажмите на маркер флага на карте, чтобы увидеть сведения о посольстве и просмотреть хронологию прежних адресов.',
      hintsTitle: 'Краткие подсказки',
      hintsCountries: 'Откройте меню стран вверху, затем коснитесь страны, чтобы приблизить. Коснитесь снова, чтобы отдалить.',
      hintsMarkers: 'Коснитесь флага посольства на карте, чтобы открыть его историю.',
      dismissHints: 'Закрыть подсказки',
      avgRanking: 'Рейтинг по среднему расстоянию',
      legend: 'Условные обозначения',
      powerCenterLegend: 'Центр власти (резиденция правительства)',
      embassyLegend: 'Расположение посольства (флаг страны происхождения)',
      closeLegend: 'Близко к центру власти',
      farLegend: 'Далеко от центра власти',
      easySpying: 'Лёгкая слежка (~1 км): зафиксированные точки SCS, городская дальность GSM/WiFi/RF',
     maxSpying: 'Макс. слежка (~5 км): СВЧ в прямой видимости, зона контрразведки',
      euDelegationLegend: 'Точки ЕС — это делегации, а не посольства — ЕС не является суверенным государством.',
    },
    zh: {
      title: 'G20 大使馆距离地图',
      description: 'G20 大使馆与东道国权力中心之间的距离。点击上方国旗按钮或使用图层控件浏览。',
      viewMatrix: '查看距离矩阵表',
      howToTitle: '使用说明',
      howToCountries: '点击顶部的国家菜单，然后点击国旗即可放大。再次点击同一国家可缩小。',
      howToMarkers: '点击地图上的国旗标记可查看大使馆详情，并浏览过往地址的时间线。',
      hintsTitle: '快速提示',
      hintsCountries: '点击顶部的国家菜单，然后点选国家放大。再次点击可缩小。',
      hintsMarkers: '点击地图上的大使馆国旗即可打开其历史时间线。',
      dismissHints: '关闭提示',
      avgRanking: '平均距离排名',
      legend: '图例',
      powerCenterLegend: '权力中心（政府所在地）',
      embassyLegend: '大使馆位置（来源国国旗）',
      closeLegend: '靠近权力中心',
      farLegend: '远离权力中心',
      easySpying: '易窃听（约 1 公里）：有据可查的 SCS 部署、城市 GSM/WiFi/RF 范围',
     maxSpying: '最大窃听（约 5 公里）：视距微波、反情报警戒范围',
      euDelegationLegend: '欧盟点位为代表团，非大使馆——欧盟非主权国家。',
    },
    ja: {
      title: 'G20 大使館距離マップ',
      description: 'G20 諸国の大使館と受入国の権力中枢との距離。上の国旗ボタンをクリックするか、レイヤーコントロールで探索してください。',
      viewMatrix: '距離マトリクス表を見る',
      howToTitle: '使い方',
      howToCountries: '上部の国メニューを開き、国旗をクリックすると拡大します。同じ国を再度クリックすると縮小します。',
      howToMarkers: '地図上の旗マーカーをクリックすると、大使館の詳細と過去の所在地のタイムラインを閲覧できます。',
      hintsTitle: 'クイックヒント',
      hintsCountries: '上部の国メニューを開き、国をタップすると拡大します。もう一度タップすると縮小します。',
      hintsMarkers: '地図上の大使館旗をタップすると、その歴史タイムラインが開きます。',
      dismissHints: 'ヒントを閉じる',
      avgRanking: '平均距離ランキング',
      legend: '凡例',
      powerCenterLegend: '権力中枢（政府所在地）',
      embassyLegend: '大使館の位置（出身国の国旗）',
      closeLegend: '権力中枢に近い',
      farLegend: '権力中枢から遠い',
      easySpying: '容易な諜報（約1 km）：実証されたSCS配置、都市部GSM/WiFi/RFの到達範囲',
     maxSpying: '最大諜報（約5 km）：見通し線マイクロ波、対諜防衛範囲',
      euDelegationLegend: 'EUのポイントは大使館ではなく代表部です——EUは主権国家ではありません。',
    },
    ko: {
      title: 'G20 대사관 거리 지도',
      description: 'G20 대사관과 주재국 권력 중심 간의 거리. 위의 국기 버튼을 클릭하거나 레이어 컨트롤을 사용해 탐색하세요.',
      viewMatrix: '거리 매트릭스 표 보기',
      howToTitle: '사용 방법',
      howToCountries: '상단 국가 메뉴를 열고 국기 버튼을 클릭하면 확대됩니다. 같은 국가를 다시 클릭하면 축소됩니다.',
      howToMarkers: '지도의 국기 마커를 클릭하면 대사관 상세 정보와 과거 주소 타임라인을 확인할 수 있습니다.',
      hintsTitle: '간단한 도움말',
      hintsCountries: '상단 국가 메뉴를 열고 국가를 탭하면 확대됩니다. 다시 탭하면 축소됩니다.',
      hintsMarkers: '지도에서 대사관 국기를 탭하면 역사 타임라인이 열립니다.',
      dismissHints: '도움말 닫기',
      avgRanking: '평균 거리 순위',
      legend: '범례',
      powerCenterLegend: '권력 중심 (정부 소재지)',
      embassyLegend: '대사관 위치 (출신국 국기)',
      closeLegend: '권력 중심에 가까움',
      farLegend: '권력 중심에서 멈',
      easySpying: '용이한 감청 (~1 km): 문서화된 SCS 배치, 도심 GSM/WiFi/RF 범위',
     maxSpying: '최대 감청 (~5 km): 가시선 마이크로파, 방첩 구역',
      euDelegationLegend: 'EU 포인트는 대사관이 아닌 대표부입니다 — EU는 주권 국가가 아닙니다.',
    },
    hi: {
      title: 'G20 दूतावास दूरी मानचित्र',
      description: 'G20 दूतावासों और मेज़बान देश के सत्ता केंद्रों के बीच की दूरी। ऊपर एक झंडा क्लिक करें या लेयर नियंत्रण का उपयोग करें।',
      viewMatrix: 'दूरी सारणी देखें',
      howToTitle: 'उपयोग कैसे करें',
      howToCountries: 'ऊपर देश का मेनू खोलें, फिर ज़ूम इन करने के लिए किसी देश के झंडे पर क्लिक करें। उसी देश पर फिर से क्लिक करने पर ज़ूम आउट होगा।',
      howToMarkers: 'मानचित्र पर किसी झंडा मार्कर पर क्लिक करें ताकि दूतावास के विवरण देखे जा सकें और पिछले पतों की समयरेखा पढ़ी जा सके।',
      hintsTitle: 'त्वरित सुझाव',
      hintsCountries: 'ऊपर देशों का मेनू खोलें, फिर ज़ूम इन के लिए किसी देश को टैप करें। फिर से टैप करने पर ज़ूम आउट होगा।',
      hintsMarkers: 'मानचित्र पर किसी दूतावास के झंडे को टैप करें ताकि उसकी इतिहास समयरेखा खुले।',
      dismissHints: 'सुझाव बंद करें',
      avgRanking: 'औसत दूरी की रैंकिंग',
      legend: 'चिह्न-सूची',
      powerCenterLegend: 'सत्ता केंद्र (सरकार का स्थान)',
      embassyLegend: 'दूतावास स्थान (मूल देश का झंडा)',
      closeLegend: 'सत्ता केंद्र के पास',
      farLegend: 'सत्ता केंद्र से दूर',
      easySpying: 'आसान जासूसी (~1 कि.मी.): प्रलेखित SCS स्थान, शहरी GSM/WiFi/RF परास',
     maxSpying: 'अधिकतम जासूसी (~5 कि.मी.): दृष्टि-रेखा माइक्रोवेव, प्रति-जासूसी क्षेत्र',
      euDelegationLegend: 'EU बिंदु दूतावास नहीं, प्रतिनिधिमंडल हैं — EU एक संप्रभु राज्य नहीं है।',
    },
    ar: {
      title: 'خريطة مسافات سفارات مجموعة العشرين',
      description: 'المسافة بين سفارات مجموعة العشرين ومراكز السلطة في الدولة المضيفة. انقر على علم أعلاه أو استخدم لوحة الطبقات.',
      viewMatrix: 'عرض جدول المسافات',
      howToTitle: 'كيفية الاستخدام',
      howToCountries: 'افتح قائمة الدول في الأعلى ثم انقر على علم دولة للتكبير. انقر الدولة نفسها مرة أخرى للتصغير.',
      howToMarkers: 'انقر على علامة العلم على الخريطة لرؤية تفاصيل السفارة وتصفح الجدول الزمني للعناوين السابقة.',
      hintsTitle: 'نصائح سريعة',
      hintsCountries: 'افتح قائمة الدول في الأعلى ثم انقر على دولة للتكبير. انقر مرة أخرى للتصغير.',
      hintsMarkers: 'انقر على علم سفارة على الخريطة لفتح جدولها الزمني التاريخي.',
      dismissHints: 'إغلاق النصائح',
      avgRanking: 'الترتيب حسب المسافة المتوسطة',
      legend: 'مفتاح الخريطة',
      powerCenterLegend: 'مركز السلطة (مقر الحكومة)',
      embassyLegend: 'موقع السفارة (علم بلد الأصل)',
      closeLegend: 'قريب من مركز السلطة',
      farLegend: 'بعيد عن مركز السلطة',
      easySpying: 'تجسس سهل (~1 كم): مواقع SCS موثقة، نطاق GSM/WiFi/RF الحضري',
     maxSpying: 'تجسس أقصى (~5 كم): موجات دقيقة في خط الرؤية، نطاق مكافحة التجسس',
      euDelegationLegend: 'نقاط الاتحاد الأوروبي هي بعثات دبلوماسية وليست سفارات — الاتحاد الأوروبي ليس دولة ذات سيادة.',
    },
    tr: {
      title: 'G20 Büyükelçilik Mesafe Haritası',
      description: 'G20 büyükelçilikleri ile ev sahibi ülkenin güç merkezleri arasındaki mesafe. Yukarıdaki bir bayrağa tıklayın veya katman kontrolünü kullanın.',
      viewMatrix: 'Mesafe matrisini görüntüle',
      howToTitle: 'Nasıl kullanılır',
      howToCountries: 'Üstteki ülke menüsünü açın, ardından yakınlaştırmak için bir ülke bayrağına tıklayın. Aynı ülkeye tekrar tıklayarak uzaklaştırın.',
      howToMarkers: 'Büyükelçilik ayrıntılarını görmek ve eski adreslerin zaman çizelgesine göz atmak için haritadaki bir bayrak işaretçisine tıklayın.',
      hintsTitle: 'Hızlı ipuçları',
      hintsCountries: 'Üstteki ülke menüsünü açın, ardından yakınlaştırmak için bir ülkeye dokunun. Uzaklaştırmak için tekrar dokunun.',
      hintsMarkers: 'Tarihçeyi açmak için haritadaki bir büyükelçilik bayrağına dokunun.',
      dismissHints: 'İpuçlarını kapat',
      avgRanking: 'Ortalama mesafe sıralaması',
      legend: 'Lejant',
      powerCenterLegend: 'Güç merkezi (hükümet merkezi)',
      embassyLegend: 'Büyükelçilik konumu (köken ülke bayrağı)',
      closeLegend: 'Güç merkezine yakın',
      farLegend: 'Güç merkezinden uzak',
      easySpying: 'Kolay casusluk (~1 km): belgelenmiş SCS yerleşimleri, kentsel GSM/WiFi/RF menzili',
     maxSpying: 'Azami casusluk (~5 km): görüş hattı mikrodalga, karşı-istihbarat alanı',
      euDelegationLegend: 'AB noktaları büyükelçilik değil delegasyondur — AB egemen bir devlet değildir.',
    },
    id: {
      title: 'Peta Jarak Kedutaan G20',
      description: 'Jarak antara kedutaan G20 dan pusat kekuasaan negara tuan rumah. Klik tombol bendera di atas atau gunakan kontrol lapisan.',
      viewMatrix: 'Lihat tabel jarak',
      howToTitle: 'Cara penggunaan',
      howToCountries: 'Buka menu negara di atas, lalu klik bendera negara untuk memperbesar. Klik negara yang sama lagi untuk memperkecil.',
      howToMarkers: 'Klik penanda bendera di peta untuk melihat detail kedutaan dan menelusuri kronologi alamat sebelumnya.',
      hintsTitle: 'Tip cepat',
      hintsCountries: 'Buka menu negara di atas, lalu ketuk negara untuk memperbesar. Ketuk lagi untuk memperkecil.',
      hintsMarkers: 'Ketuk bendera kedutaan di peta untuk membuka kronologi sejarahnya.',
      dismissHints: 'Tutup tip',
      avgRanking: 'Peringkat berdasarkan jarak rata-rata',
      legend: 'Keterangan',
      powerCenterLegend: 'Pusat kekuasaan (kursi pemerintahan)',
      embassyLegend: 'Lokasi kedutaan (bendera negara asal)',
      closeLegend: 'Dekat dengan pusat kekuasaan',
      farLegend: 'Jauh dari pusat kekuasaan',
      easySpying: 'Penyadapan mudah (~1 km): penempatan SCS terdokumentasi, jangkauan GSM/WiFi/RF perkotaan',
      maxSpying: 'Penyadapan maks. (~5 km): gelombang mikro garis pandang, zona kontra-intelijen',
      euDelegationLegend: 'Titik UE adalah delegasi, bukan kedutaan besar — UE bukan negara berdaulat.',
      rankCol: '#',
      countryCol: 'Negara',
      distCol: 'Jarak Rata-rata',
      powerCenter: 'Pusat kekuasaan',
      capital: 'Ibu kota',
      avgEmbassyDist: 'Jarak rata-rata kedutaan',
      closestEmbassy: 'Kedutaan terdekat',
      farthestEmbassy: 'Kedutaan terjauh',
      openInMaps: 'Buka di Google Maps',
      archives: 'Arsip',
      embassyOf: 'Kedutaan {name} · di {host}',
      archivesTitle: 'Dua setengah abad <em>alamat Paris</em>',
      archivesLede: 'Dari Hôtel de Valentinois tempat Benjamin Franklin menandatangani aliansi Prancis-Amerika pada 1778, hingga kantor kanselir di Place de la Concorde — {n} alamat berurutan menceritakan diplomasi Amerika di Prancis.',
      kindLegation: 'legasi', kindEmbassy: 'kedutaan', kindChancery: 'kanselir', kindConsulate: 'konsulat', kindResidence: 'kediaman',
      languageLabel: 'Bahasa',
      collapsePanel: 'Lipat / buka panel',
      countries: 'Negara',
      toggleCountries: 'Tampilkan / sembunyikan negara',
      showHideLegend: 'Tampilkan / sembunyikan keterangan',
      closeArchives: 'Tutup arsip',
      navFirst: 'Alamat pertama (tertua)', navPrev: 'Alamat sebelumnya', navNext: 'Alamat berikutnya', navLast: 'Alamat terakhir (terbaru)',
      chronoNav: 'Navigasi kronologis',
      dataUnavailable: 'Data tidak tersedia',
      loading: 'Memuat…'
    }
  };

  /* Country names indexed by ISO code (matches the flagcdn lowercase code uppercased).
     Used both for the nav-panel flag buttons / ranking table AND for popup token replacement. */
  var COUNTRY_NAMES = {
    en: { AR:'Argentina', AU:'Australia', BR:'Brazil', CA:'Canada', CN:'China', FR:'France', DE:'Germany', IN:'India', ID:'Indonesia', IT:'Italy', JP:'Japan', MX:'Mexico', RU:'Russia', SA:'Saudi Arabia', ZA:'South Africa', KR:'South Korea', TR:'Turkey', GB:'United Kingdom', US:'United States', EU:'European Union', IL:'Israel' },
    fr: { AR:'Argentine', AU:'Australie', BR:'Brésil', CA:'Canada', CN:'Chine', FR:'France', DE:'Allemagne', IN:'Inde', ID:'Indonésie', IT:'Italie', JP:'Japon', MX:'Mexique', RU:'Russie', SA:'Arabie saoudite', ZA:'Afrique du Sud', KR:'Corée du Sud', TR:'Turquie', GB:'Royaume-Uni', US:'États-Unis', EU:'Union européenne', IL:'Israël' },
    es: { AR:'Argentina', AU:'Australia', BR:'Brasil', CA:'Canadá', CN:'China', FR:'Francia', DE:'Alemania', IN:'India', ID:'Indonesia', IT:'Italia', JP:'Japón', MX:'México', RU:'Rusia', SA:'Arabia Saudí', ZA:'Sudáfrica', KR:'Corea del Sur', TR:'Turquía', GB:'Reino Unido', US:'Estados Unidos', EU:'Unión Europea', IL:'Israel' },
    pt: { AR:'Argentina', AU:'Austrália', BR:'Brasil', CA:'Canadá', CN:'China', FR:'França', DE:'Alemanha', IN:'Índia', ID:'Indonésia', IT:'Itália', JP:'Japão', MX:'México', RU:'Rússia', SA:'Arábia Saudita', ZA:'África do Sul', KR:'Coreia do Sul', TR:'Turquia', GB:'Reino Unido', US:'Estados Unidos', EU:'União Europeia', IL:'Israel' },
    de: { AR:'Argentinien', AU:'Australien', BR:'Brasilien', CA:'Kanada', CN:'China', FR:'Frankreich', DE:'Deutschland', IN:'Indien', ID:'Indonesien', IT:'Italien', JP:'Japan', MX:'Mexiko', RU:'Russland', SA:'Saudi-Arabien', ZA:'Südafrika', KR:'Südkorea', TR:'Türkei', GB:'Vereinigtes Königreich', US:'Vereinigte Staaten', EU:'Europäische Union', IL:'Israel' },
    it: { AR:'Argentina', AU:'Australia', BR:'Brasile', CA:'Canada', CN:'Cina', FR:'Francia', DE:'Germania', IN:'India', ID:'Indonesia', IT:'Italia', JP:'Giappone', MX:'Messico', RU:'Russia', SA:'Arabia Saudita', ZA:'Sudafrica', KR:'Corea del Sud', TR:'Turchia', GB:'Regno Unito', US:'Stati Uniti', EU:'Unione Europea', IL:'Israele' },
    ru: { AR:'Аргентина', AU:'Австралия', BR:'Бразилия', CA:'Канада', CN:'Китай', FR:'Франция', DE:'Германия', IN:'Индия', ID:'Индонезия', IT:'Италия', JP:'Япония', MX:'Мексика', RU:'Россия', SA:'Саудовская Аравия', ZA:'ЮАР', KR:'Южная Корея', TR:'Турция', GB:'Великобритания', US:'США', EU:'Европейский союз', IL:'Израиль' },
    zh: { AR:'阿根廷', AU:'澳大利亚', BR:'巴西', CA:'加拿大', CN:'中国', FR:'法国', DE:'德国', IN:'印度', ID:'印度尼西亚', IT:'意大利', JP:'日本', MX:'墨西哥', RU:'俄罗斯', SA:'沙特阿拉伯', ZA:'南非', KR:'韩国', TR:'土耳其', GB:'英国', US:'美国', EU:'欧盟', IL:'以色列' },
    ja: { AR:'アルゼンチン', AU:'オーストラリア', BR:'ブラジル', CA:'カナダ', CN:'中国', FR:'フランス', DE:'ドイツ', IN:'インド', ID:'インドネシア', IT:'イタリア', JP:'日本', MX:'メキシコ', RU:'ロシア', SA:'サウジアラビア', ZA:'南アフリカ', KR:'韓国', TR:'トルコ', GB:'イギリス', US:'アメリカ合衆国', EU:'欧州連合', IL:'イスラエル' },
    ko: { AR:'아르헨티나', AU:'호주', BR:'브라질', CA:'캐나다', CN:'중국', FR:'프랑스', DE:'독일', IN:'인도', ID:'인도네시아', IT:'이탈리아', JP:'일본', MX:'멕시코', RU:'러시아', SA:'사우디아라비아', ZA:'남아프리카공화국', KR:'대한민국', TR:'튀르키예', GB:'영국', US:'미국', EU:'유럽 연합', IL:'이스라엘' },
    hi: { AR:'अर्जेंटीना', AU:'ऑस्ट्रेलिया', BR:'ब्राज़ील', CA:'कनाडा', CN:'चीन', FR:'फ़्रांस', DE:'जर्मनी', IN:'भारत', ID:'इंडोनेशिया', IT:'इटली', JP:'जापान', MX:'मेक्सिको', RU:'रूस', SA:'सऊदी अरब', ZA:'दक्षिण अफ़्रीका', KR:'दक्षिण कोरिया', TR:'तुर्की', GB:'यूनाइटेड किंगडम', US:'संयुक्त राज्य अमेरिका', EU:'यूरोपीय संघ', IL:'इज़राइल' },
    ar: { AR:'الأرجنتين', AU:'أستراليا', BR:'البرازيل', CA:'كندا', CN:'الصين', FR:'فرنسا', DE:'ألمانيا', IN:'الهند', ID:'إندونيسيا', IT:'إيطاليا', JP:'اليابان', MX:'المكسيك', RU:'روسيا', SA:'المملكة العربية السعودية', ZA:'جنوب أفريقيا', KR:'كوريا الجنوبية', TR:'تركيا', GB:'المملكة المتحدة', US:'الولايات المتحدة', EU:'الاتحاد الأوروبي', IL:'إسرائيل' },
    tr: { AR:'Arjantin', AU:'Avustralya', BR:'Brezilya', CA:'Kanada', CN:'Çin', FR:'Fransa', DE:'Almanya', IN:'Hindistan', ID:'Endonezya', IT:'İtalya', JP:'Japonya', MX:'Meksika', RU:'Rusya', SA:'Suudi Arabistan', ZA:'Güney Afrika', KR:'Güney Kore', TR:'Türkiye', GB:'Birleşik Krallık', US:'Amerika Birleşik Devletleri', EU:'Avrupa Birliği', IL:'İsrail' },
    id: { AR:'Argentina', AU:'Australia', BR:'Brasil', CA:'Kanada', CN:'Tiongkok', FR:'Prancis', DE:'Jerman', IN:'India', ID:'Indonesia', IT:'Italia', JP:'Jepang', MX:'Meksiko', RU:'Rusia', SA:'Arab Saudi', ZA:'Afrika Selatan', KR:'Korea Selatan', TR:'Turki', GB:'Britania Raya', US:'Amerika Serikat', EU:'Uni Eropa', IL:'Israel' }
  };

  var STORAGE_KEY = 'embassyLang';
  function getLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && I18N[saved]) return saved;
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return I18N[nav] ? nav : 'fr';
  }
  function setLang(code) {
    if (!I18N[code]) return;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
    applyI18n(code);
  }
  window.__getLang = getLang;
  window.I18N = I18N;
  window.COUNTRY_NAMES = COUNTRY_NAMES;

  function flagFromImg(img) {
    if (!img) return null;
    var m = (img.getAttribute('src') || '').match(/\/w\d+\/([a-z]{2})\.png/);
    return m ? m[1].toUpperCase() : null;
  }

  function applyStaticText(t) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] != null) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (t[key] != null) el.title = t[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (t[key] != null) el.setAttribute('aria-label', t[key]);
    });
  }

  function applyCountryNames(cn) {
    /* Nav-panel buttons: span next to the flag. */
    document.querySelectorAll('#flag-bar button').forEach(function (btn) {
      var img = btn.querySelector('img[src*="flagcdn.com"]');
      var code = flagFromImg(img);
      var span = btn.querySelector('span');
      if (code && cn[code] && span) span.textContent = cn[code];
    });
    /* Ranking table rows. */
    document.querySelectorAll('#info-panel table tbody td:nth-child(2)').forEach(function (td) {
      var img = td.querySelector('img[src*="flagcdn.com"]');
      var code = flagFromImg(img);
      if (!code || !cn[code]) return;
      /* Wipe existing text nodes after the image and append translated name. */
      var node = img.nextSibling;
      while (node) {
        var next = node.nextSibling;
        if (node.nodeType === 3) td.removeChild(node);
        node = next;
      }
      td.appendChild(document.createTextNode(' ' + cn[code]));
    });
  }

  var findMap = window.EmbassyUtils.findMap;
  var walkMarkers = window.EmbassyUtils.walkMarkers;
  function reEscape(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function translatePopups(t, cn) {
    var map = findMap();
    if (!map) return;
    walkMarkers(map, function (marker) {
      var p = marker.getPopup && marker.getPopup();
      if (!p) return;
      if (p.__origHtml == null) {
        var c = p.getContent();
        p.__origHtml = typeof c === 'string' ? c : ((c && c.outerHTML) || '');
      }
      var html = p.__origHtml;
      if (!html) return;
      /* Labels (English → translated). Use plain string replaceAll-style global. */
      html = html.replace(/Power Center:/g, t.powerCenter + ':')
                 .replace(/Capital:/g, t.capital + ':')
                 .replace(/Open in Google Maps/g, t.openInMaps)
                 .replace(/Avg\. embassy distance:/g, t.avgEmbassyDist + ':')
                 .replace(/Closest embassy:/g, t.closestEmbassy + ':')
                 .replace(/Farthest embassy:/g, t.farthestEmbassy + ':');
      /* Country names. Sort longest-first so 'United Kingdom' wins over 'United'. */
      var enNames = COUNTRY_NAMES.en;
      var codes = Object.keys(enNames).sort(function (a, b) { return enNames[b].length - enNames[a].length; });
      codes.forEach(function (code) {
        var en = enNames[code];
        var tr = cn[code];
        if (!tr || tr === en) return;
        /* Match within text or alt attribute, bounded by non-letter. */
        var re = new RegExp('\\b' + reEscape(en) + '\\b', 'g');
        html = html.replace(re, tr);
      });
      p.setContent(html);
      if (p.isOpen && p.isOpen()) {
        try { p.update(); } catch (e) {}
      }
    });
  }

  function applyI18n(lang) {
    var t = I18N[lang] || I18N.en;
    var cn = COUNTRY_NAMES[lang] || COUNTRY_NAMES.en;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL[lang] ? 'rtl' : 'ltr';
    applyStaticText(t);
    applyCountryNames(cn);
    translatePopups(t, cn);
    if (window.__refreshArchives) {
      try { window.__refreshArchives(); } catch (e) {}
    }
    markActiveMenuItem(lang);
  }
  window.__applyI18n = applyI18n;

  function markActiveMenuItem(lang) {
    document.querySelectorAll('#lang-menu .lang-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-lang') === lang);
      el.setAttribute('aria-selected', el.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  function buildMenu() {
    var menu = document.getElementById('lang-menu');
    if (!menu) return;
    menu.innerHTML = '';
    LANGS.forEach(function (l) {
      var item = document.createElement('div');
      item.className = 'lang-item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-lang', l.code);
      item.setAttribute('tabindex', '-1');
      item.innerHTML = '<span class="lang-flag" aria-hidden="true">' + l.flag + '</span><span>' + l.label + '</span>';
      item.addEventListener('click', function () {
        setLang(l.code);
        closeMenu();
      });
      menu.appendChild(item);
    });
  }

  function openMenu() {
    var menu = document.getElementById('lang-menu');
    var fab = document.getElementById('lang-fab');
    if (!menu || !fab) return;
    menu.classList.add('open');
    fab.setAttribute('aria-expanded', 'true');
    /* Defer outside-click binding so the same click that opened it doesn't immediately close it. */
    setTimeout(function () {
      document.addEventListener('click', onOutsideClick, true);
      document.addEventListener('keydown', onMenuKey, true);
    }, 0);
  }
  function closeMenu() {
    var menu = document.getElementById('lang-menu');
    var fab = document.getElementById('lang-fab');
    if (!menu || !fab) return;
    menu.classList.remove('open');
    fab.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onOutsideClick, true);
    document.removeEventListener('keydown', onMenuKey, true);
  }
  function onOutsideClick(e) {
    var menu = document.getElementById('lang-menu');
    var fab = document.getElementById('lang-fab');
    if (!menu || !fab) return;
    if (menu.contains(e.target) || fab.contains(e.target)) return;
    closeMenu();
  }
  function onMenuKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      var fab = document.getElementById('lang-fab');
      if (fab) fab.focus();
    }
  }

  function wireFab() {
    var fab = document.getElementById('lang-fab');
    if (!fab || fab.__wired) return;
    fab.__wired = true;
    fab.addEventListener('click', function () {
      var menu = document.getElementById('lang-menu');
      if (menu && menu.classList.contains('open')) closeMenu();
      else openMenu();
    });
  }

  function init() {
    buildMenu();
    wireFab();
    var lang = getLang();
    applyI18n(lang);
    /* Re-apply after Folium has finished wiring its popups & markers — the first
       pass at DOMContentLoaded sometimes runs before every marker is attached. */
    setTimeout(function () { applyI18n(lang); }, 400);
    setTimeout(function () { applyI18n(lang); }, 1200);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
