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
      avgRanking: 'Average Distance Ranking',
      legend: 'Legend',
      powerCenterLegend: 'Power Center (government seat)',
      embassyLegend: 'Embassy location (flag of origin country)',
      closeLegend: 'Close to power center',
      farLegend: 'Far from power center',
      easySpying: 'Easy spying (~1 km): documented SCS placements, GSM/WiFi/RF urban range',
      maxSpying: 'Max spying (~5 km): line-of-sight microwave, counter-intel zoning range',
      rankCol: '#',
      countryCol: 'Country',
      distCol: 'Avg. Dist.',
      powerCenter: 'Power Center',
      capital: 'Capital',
      avgEmbassyDist: 'Avg. embassy distance',
      closestEmbassy: 'Closest embassy',
      farthestEmbassy: 'Farthest embassy',
      openInMaps: 'Open in Google Maps',
      archives: 'Archives',
      embassyOf: 'Embassy of {name} · in {host}',
      archivesTitle: 'Two and a half centuries of <em>Parisian addresses</em>',
      archivesLede: 'From the Hôtel de Valentinois where Benjamin Franklin signed the Franco-American alliance in 1778, to the chancery on Place de la Concorde — {n} successive addresses tell the story of American diplomacy in France.',
      kindLegation: 'legation', kindEmbassy: 'embassy', kindChancery: 'chancery', kindConsulate: 'consulate', kindResidence: 'residence',
      languageLabel: 'Language',
      collapsePanel: 'Collapse / expand panel',
      showHideLegend: 'Show / hide legend',
      closeArchives: 'Close archives',
      navFirst: 'First (oldest) address', navPrev: 'Previous address', navNext: 'Next address', navLast: 'Last (most recent) address',
      chronoNav: 'Chronological navigation',
      dataUnavailable: 'Data unavailable',
      loading: 'Loading…'
    },
    fr: {
      title: 'Carte des distances des ambassades du G20',
      description: 'Distance entre les ambassades du G20 et les centres du pouvoir du pays hôte. Cliquez un drapeau ci-dessus ou utilisez le contrôle des couches pour explorer.',
      viewMatrix: 'Voir le tableau des distances',
      avgRanking: 'Classement par distance moyenne',
      legend: 'Légende',
      powerCenterLegend: 'Centre du pouvoir (siège du gouvernement)',
      embassyLegend: 'Emplacement de l’ambassade (drapeau du pays d’origine)',
      closeLegend: 'Proche du centre du pouvoir',
      farLegend: 'Loin du centre du pouvoir',
      easySpying: 'Espionnage facile (~1 km) : emplacements SCS documentés, portée GSM/WiFi/RF urbaine',
      maxSpying: 'Espionnage max (~5 km) : micro-ondes en visibilité directe, périmètre de contre-espionnage',
      rankCol: '#',
      countryCol: 'Pays',
      distCol: 'Dist. moy.',
      powerCenter: 'Centre du pouvoir',
      capital: 'Capitale',
      avgEmbassyDist: 'Distance moyenne des ambassades',
      closestEmbassy: 'Ambassade la plus proche',
      farthestEmbassy: 'Ambassade la plus éloignée',
      openInMaps: 'Ouvrir dans Google Maps',
      archives: 'Archives',
      embassyOf: 'Ambassade des {name} · en {host}',
      archivesTitle: 'Deux siècles et demi <em>d’adresses</em> parisiennes',
      archivesLede: 'De l’hôtel de Valentinois où Benjamin Franklin signa en 1778 l’alliance franco-américaine, jusqu’à la chancellerie de la place de la Concorde — {n} adresses successives racontent la diplomatie américaine en France.',
      kindLegation: 'légation', kindEmbassy: 'ambassade', kindChancery: 'chancellerie', kindConsulate: 'consulat', kindResidence: 'résidence',
      languageLabel: 'Langue',
      collapsePanel: 'Réduire / agrandir le panneau',
      showHideLegend: 'Afficher / masquer la légende',
      closeArchives: 'Fermer les archives',
      navFirst: 'Première adresse (la plus ancienne)', navPrev: 'Adresse précédente', navNext: 'Adresse suivante', navLast: 'Dernière adresse (la plus récente)',
      chronoNav: 'Navigation chronologique',
      dataUnavailable: 'Données indisponibles',
      loading: 'Chargement…'
    },
    es: {
      title: 'Mapa de distancias de embajadas del G20',
      description: 'Distancia entre embajadas del G20 y los centros de poder del país anfitrión. Pulse una bandera arriba o use el control de capas para explorar.',
      viewMatrix: 'Ver tabla de distancias',
      avgRanking: 'Clasificación por distancia media',
      legend: 'Leyenda',
      powerCenterLegend: 'Centro de poder (sede del gobierno)',
      embassyLegend: 'Ubicación de la embajada (bandera del país de origen)',
      closeLegend: 'Cerca del centro de poder',
      farLegend: 'Lejos del centro de poder',
      easySpying: 'Espionaje fácil (~1 km): emplazamientos SCS documentados, alcance GSM/WiFi/RF urbano',
      maxSpying: 'Espionaje máx. (~5 km): microondas con línea de vista, perímetro de contraespionaje',
      rankCol: '#',
      countryCol: 'País',
      distCol: 'Dist. med.',
      powerCenter: 'Centro de poder',
      capital: 'Capital',
      avgEmbassyDist: 'Distancia media a las embajadas',
      closestEmbassy: 'Embajada más cercana',
      farthestEmbassy: 'Embajada más lejana',
      openInMaps: 'Abrir en Google Maps',
      archives: 'Archivos',
      embassyOf: 'Embajada de {name} · en {host}',
      archivesTitle: 'Dos siglos y medio de <em>direcciones parisinas</em>',
      archivesLede: 'Desde el Hôtel de Valentinois donde Benjamin Franklin firmó en 1778 la alianza franco-americana, hasta la cancillería de la Plaza de la Concordia — {n} direcciones sucesivas narran la diplomacia estadounidense en Francia.',
      kindLegation: 'legación', kindEmbassy: 'embajada', kindChancery: 'cancillería', kindConsulate: 'consulado', kindResidence: 'residencia',
      languageLabel: 'Idioma',
      collapsePanel: 'Plegar / desplegar panel',
      showHideLegend: 'Mostrar / ocultar leyenda',
      closeArchives: 'Cerrar archivos',
      navFirst: 'Primera dirección (la más antigua)', navPrev: 'Dirección anterior', navNext: 'Dirección siguiente', navLast: 'Última dirección (la más reciente)',
      chronoNav: 'Navegación cronológica',
      dataUnavailable: 'Datos no disponibles',
      loading: 'Cargando…'
    },
    pt: {
      title: 'Mapa de distâncias das embaixadas do G20',
      description: 'Distância entre embaixadas do G20 e os centros de poder do país anfitrião. Clique numa bandeira acima ou use o controlo de camadas para explorar.',
      viewMatrix: 'Ver tabela de distâncias',
      avgRanking: 'Classificação por distância média',
      legend: 'Legenda',
      powerCenterLegend: 'Centro do poder (sede do governo)',
      embassyLegend: 'Localização da embaixada (bandeira do país de origem)',
      closeLegend: 'Perto do centro do poder',
      farLegend: 'Longe do centro do poder',
      easySpying: 'Espionagem fácil (~1 km): instalações SCS documentadas, alcance GSM/WiFi/RF urbano',
      maxSpying: 'Espionagem máx. (~5 km): micro-ondas em linha de vista, perímetro de contraespionagem',
      rankCol: '#',
      countryCol: 'País',
      distCol: 'Dist. méd.',
      powerCenter: 'Centro do poder',
      capital: 'Capital',
      avgEmbassyDist: 'Distância média às embaixadas',
      closestEmbassy: 'Embaixada mais próxima',
      farthestEmbassy: 'Embaixada mais distante',
      openInMaps: 'Abrir no Google Maps',
      archives: 'Arquivos',
      embassyOf: 'Embaixada de {name} · em {host}',
      archivesTitle: 'Dois séculos e meio de <em>endereços parisienses</em>',
      archivesLede: 'Do Hôtel de Valentinois onde Benjamin Franklin assinou em 1778 a aliança franco-americana, até à chancelaria na Place de la Concorde — {n} endereços sucessivos contam a diplomacia americana em França.',
      kindLegation: 'legação', kindEmbassy: 'embaixada', kindChancery: 'chancelaria', kindConsulate: 'consulado', kindResidence: 'residência',
      languageLabel: 'Idioma',
      collapsePanel: 'Recolher / expandir painel',
      showHideLegend: 'Mostrar / ocultar legenda',
      closeArchives: 'Fechar arquivos',
      navFirst: 'Primeiro endereço (o mais antigo)', navPrev: 'Endereço anterior', navNext: 'Próximo endereço', navLast: 'Último endereço (o mais recente)',
      chronoNav: 'Navegação cronológica',
      dataUnavailable: 'Dados indisponíveis',
      loading: 'A carregar…'
    },
    de: {
      title: 'G20-Botschaftsentfernungskarte',
      description: 'Entfernung zwischen G20-Botschaften und den Machtzentren des Gastlandes. Klicken Sie auf eine Flagge oben oder verwenden Sie die Layer-Steuerung.',
      viewMatrix: 'Distanzmatrix anzeigen',
      avgRanking: 'Rangliste nach Durchschnittsentfernung',
      legend: 'Legende',
      powerCenterLegend: 'Machtzentrum (Regierungssitz)',
      embassyLegend: 'Botschaftsstandort (Flagge des Herkunftslandes)',
      closeLegend: 'Nah am Machtzentrum',
      farLegend: 'Weit vom Machtzentrum',
      easySpying: 'Leichte Spionage (~1 km): dokumentierte SCS-Standorte, GSM/WiFi/RF-Reichweite in der Stadt',
      maxSpying: 'Max. Spionage (~5 km): Mikrowelle in Sichtlinie, Reichweite der Spionageabwehr',
      rankCol: '#',
      countryCol: 'Land',
      distCol: 'Ø Dist.',
      powerCenter: 'Machtzentrum',
      capital: 'Hauptstadt',
      avgEmbassyDist: 'Durchschnittliche Botschaftsentfernung',
      closestEmbassy: 'Nächste Botschaft',
      farthestEmbassy: 'Entfernteste Botschaft',
      openInMaps: 'In Google Maps öffnen',
      archives: 'Archiv',
      embassyOf: 'Botschaft von {name} · in {host}',
      archivesTitle: 'Zweieinhalb Jahrhunderte <em>Pariser Adressen</em>',
      archivesLede: 'Vom Hôtel de Valentinois, wo Benjamin Franklin 1778 das französisch-amerikanische Bündnis unterzeichnete, bis zur Kanzlei an der Place de la Concorde — {n} aufeinanderfolgende Adressen erzählen die amerikanische Diplomatie in Frankreich.',
      kindLegation: 'Gesandtschaft', kindEmbassy: 'Botschaft', kindChancery: 'Kanzlei', kindConsulate: 'Konsulat', kindResidence: 'Residenz',
      languageLabel: 'Sprache',
      collapsePanel: 'Panel ein-/ausklappen',
      showHideLegend: 'Legende ein-/ausblenden',
      closeArchives: 'Archiv schließen',
      navFirst: 'Erste Adresse (älteste)', navPrev: 'Vorherige Adresse', navNext: 'Nächste Adresse', navLast: 'Letzte Adresse (neueste)',
      chronoNav: 'Chronologische Navigation',
      dataUnavailable: 'Daten nicht verfügbar',
      loading: 'Lädt…'
    },
    it: {
      title: 'Mappa delle distanze delle ambasciate del G20',
      description: 'Distanza tra le ambasciate del G20 e i centri di potere del paese ospitante. Clicca una bandiera sopra o usa il controllo dei livelli.',
      viewMatrix: 'Visualizza tabella delle distanze',
      avgRanking: 'Classifica per distanza media',
      legend: 'Legenda',
      powerCenterLegend: 'Centro del potere (sede del governo)',
      embassyLegend: 'Posizione dell’ambasciata (bandiera del paese d’origine)',
      closeLegend: 'Vicino al centro del potere',
      farLegend: 'Lontano dal centro del potere',
      easySpying: 'Spionaggio facile (~1 km): impianti SCS documentati, portata GSM/WiFi/RF urbana',
      maxSpying: 'Spionaggio max (~5 km): microonde in visibilità diretta, perimetro di controspionaggio',
      rankCol: '#',
      countryCol: 'Paese',
      distCol: 'Dist. media',
      powerCenter: 'Centro del potere',
      capital: 'Capitale',
      avgEmbassyDist: 'Distanza media delle ambasciate',
      closestEmbassy: 'Ambasciata più vicina',
      farthestEmbassy: 'Ambasciata più lontana',
      openInMaps: 'Apri in Google Maps',
      archives: 'Archivi',
      embassyOf: 'Ambasciata di {name} · in {host}',
      archivesTitle: 'Due secoli e mezzo di <em>indirizzi parigini</em>',
      archivesLede: 'Dall’Hôtel de Valentinois dove Benjamin Franklin firmò nel 1778 l’alleanza franco-americana, fino alla cancelleria di Place de la Concorde — {n} indirizzi successivi raccontano la diplomazia americana in Francia.',
      kindLegation: 'legazione', kindEmbassy: 'ambasciata', kindChancery: 'cancelleria', kindConsulate: 'consolato', kindResidence: 'residenza',
      languageLabel: 'Lingua',
      collapsePanel: 'Comprimi / espandi pannello',
      showHideLegend: 'Mostra / nascondi legenda',
      closeArchives: 'Chiudi archivi',
      navFirst: 'Primo indirizzo (più antico)', navPrev: 'Indirizzo precedente', navNext: 'Indirizzo successivo', navLast: 'Ultimo indirizzo (più recente)',
      chronoNav: 'Navigazione cronologica',
      dataUnavailable: 'Dati non disponibili',
      loading: 'Caricamento…'
    },
    ru: {
      title: 'Карта расстояний посольств G20',
      description: 'Расстояние между посольствами G20 и центрами власти принимающей страны. Нажмите на флаг выше или используйте управление слоями.',
      viewMatrix: 'Смотреть таблицу расстояний',
      avgRanking: 'Рейтинг по среднему расстоянию',
      legend: 'Условные обозначения',
      powerCenterLegend: 'Центр власти (резиденция правительства)',
      embassyLegend: 'Расположение посольства (флаг страны происхождения)',
      closeLegend: 'Близко к центру власти',
      farLegend: 'Далеко от центра власти',
      easySpying: 'Лёгкая слежка (~1 км): зафиксированные точки SCS, городская дальность GSM/WiFi/RF',
      maxSpying: 'Макс. слежка (~5 км): СВЧ в прямой видимости, зона контрразведки',
      rankCol: '№',
      countryCol: 'Страна',
      distCol: 'Ср. расст.',
      powerCenter: 'Центр власти',
      capital: 'Столица',
      avgEmbassyDist: 'Среднее расстояние до посольств',
      closestEmbassy: 'Ближайшее посольство',
      farthestEmbassy: 'Самое дальнее посольство',
      openInMaps: 'Открыть в Google Maps',
      archives: 'Архивы',
      embassyOf: 'Посольство {name} · в {host}',
      archivesTitle: 'Два с половиной века <em>парижских адресов</em>',
      archivesLede: 'От Hôtel de Valentinois, где Бенджамин Франклин подписал в 1778 году франко-американский союз, до канцелярии на площади Согласия — {n} последовательных адресов рассказывают историю американской дипломатии во Франции.',
      kindLegation: 'миссия', kindEmbassy: 'посольство', kindChancery: 'канцелярия', kindConsulate: 'консульство', kindResidence: 'резиденция',
      languageLabel: 'Язык',
      collapsePanel: 'Свернуть / развернуть панель',
      showHideLegend: 'Показать / скрыть легенду',
      closeArchives: 'Закрыть архивы',
      navFirst: 'Первый адрес (старейший)', navPrev: 'Предыдущий адрес', navNext: 'Следующий адрес', navLast: 'Последний адрес (новейший)',
      chronoNav: 'Хронологическая навигация',
      dataUnavailable: 'Данные недоступны',
      loading: 'Загрузка…'
    },
    zh: {
      title: 'G20 大使馆距离地图',
      description: 'G20 大使馆与东道国权力中心之间的距离。点击上方国旗按钮或使用图层控件浏览。',
      viewMatrix: '查看距离矩阵表',
      avgRanking: '平均距离排名',
      legend: '图例',
      powerCenterLegend: '权力中心（政府所在地）',
      embassyLegend: '大使馆位置（来源国国旗）',
      closeLegend: '靠近权力中心',
      farLegend: '远离权力中心',
      easySpying: '易窃听（约 1 公里）：有据可查的 SCS 部署、城市 GSM/WiFi/RF 范围',
      maxSpying: '最大窃听（约 5 公里）：视距微波、反情报警戒范围',
      rankCol: '#',
      countryCol: '国家',
      distCol: '平均距离',
      powerCenter: '权力中心',
      capital: '首都',
      avgEmbassyDist: '大使馆平均距离',
      closestEmbassy: '最近的大使馆',
      farthestEmbassy: '最远的大使馆',
      openInMaps: '在 Google 地图中打开',
      archives: '档案',
      embassyOf: '{name} 驻 {host} 大使馆',
      archivesTitle: '两个半世纪的 <em>巴黎地址</em>',
      archivesLede: '从 1778 年富兰克林签署法美同盟的 Hôtel de Valentinois，到协和广场上的使馆办公楼 —— {n} 个相继的地址讲述了美国在法国的外交史。',
      kindLegation: '使节团', kindEmbassy: '大使馆', kindChancery: '使馆办公楼', kindConsulate: '领事馆', kindResidence: '官邸',
      languageLabel: '语言',
      collapsePanel: '折叠 / 展开面板',
      showHideLegend: '显示 / 隐藏图例',
      closeArchives: '关闭档案',
      navFirst: '第一个地址（最早）', navPrev: '上一个地址', navNext: '下一个地址', navLast: '最后一个地址（最近）',
      chronoNav: '时间顺序导航',
      dataUnavailable: '数据不可用',
      loading: '加载中…'
    },
    ja: {
      title: 'G20 大使館距離マップ',
      description: 'G20 諸国の大使館と受入国の権力中枢との距離。上の国旗ボタンをクリックするか、レイヤーコントロールで探索してください。',
      viewMatrix: '距離マトリクス表を見る',
      avgRanking: '平均距離ランキング',
      legend: '凡例',
      powerCenterLegend: '権力中枢（政府所在地）',
      embassyLegend: '大使館の位置（出身国の国旗）',
      closeLegend: '権力中枢に近い',
      farLegend: '権力中枢から遠い',
      easySpying: '容易な諜報（約1 km）：実証されたSCS配置、都市部GSM/WiFi/RFの到達範囲',
      maxSpying: '最大諜報（約5 km）：見通し線マイクロ波、対諜防衛範囲',
      rankCol: '#',
      countryCol: '国',
      distCol: '平均距離',
      powerCenter: '権力中枢',
      capital: '首都',
      avgEmbassyDist: '大使館の平均距離',
      closestEmbassy: '最も近い大使館',
      farthestEmbassy: '最も遠い大使館',
      openInMaps: 'Google マップで開く',
      archives: '公文書',
      embassyOf: '{name} の {host} 駐在大使館',
      archivesTitle: '二世紀半の <em>パリの住所</em>',
      archivesLede: '1778年にベンジャミン・フランクリンが米仏同盟に署名したオテル・ド・ヴァランチノワから、コンコルド広場の大使館に至るまで — {n} の連続する住所がフランスにおけるアメリカの外交を物語る。',
      kindLegation: '公使館', kindEmbassy: '大使館', kindChancery: '事務局', kindConsulate: '領事館', kindResidence: '公邸',
      languageLabel: '言語',
      collapsePanel: 'パネルを折りたたむ / 展開する',
      showHideLegend: '凡例を表示 / 非表示',
      closeArchives: '公文書を閉じる',
      navFirst: '最初の住所（最も古い）', navPrev: '前の住所', navNext: '次の住所', navLast: '最後の住所（最新）',
      chronoNav: '年代順ナビゲーション',
      dataUnavailable: 'データなし',
      loading: '読み込み中…'
    },
    ko: {
      title: 'G20 대사관 거리 지도',
      description: 'G20 대사관과 주재국 권력 중심 간의 거리. 위의 국기 버튼을 클릭하거나 레이어 컨트롤을 사용해 탐색하세요.',
      viewMatrix: '거리 매트릭스 표 보기',
      avgRanking: '평균 거리 순위',
      legend: '범례',
      powerCenterLegend: '권력 중심 (정부 소재지)',
      embassyLegend: '대사관 위치 (출신국 국기)',
      closeLegend: '권력 중심에 가까움',
      farLegend: '권력 중심에서 멈',
      easySpying: '용이한 감청 (~1 km): 문서화된 SCS 배치, 도심 GSM/WiFi/RF 범위',
      maxSpying: '최대 감청 (~5 km): 가시선 마이크로파, 방첩 구역',
      rankCol: '#',
      countryCol: '국가',
      distCol: '평균 거리',
      powerCenter: '권력 중심',
      capital: '수도',
      avgEmbassyDist: '대사관 평균 거리',
      closestEmbassy: '가장 가까운 대사관',
      farthestEmbassy: '가장 먼 대사관',
      openInMaps: 'Google 지도에서 열기',
      archives: '아카이브',
      embassyOf: '{host} 주재 {name} 대사관',
      archivesTitle: '두 세기 반의 <em>파리 주소들</em>',
      archivesLede: '1778년 벤저민 프랭클린이 프랑스-미국 동맹에 서명한 오텔 드 발랑티누아부터 콩코르드 광장의 대사관에 이르기까지 — {n}개의 연속된 주소가 프랑스 내 미국 외교를 이야기합니다.',
      kindLegation: '공사관', kindEmbassy: '대사관', kindChancery: '집무실', kindConsulate: '영사관', kindResidence: '관저',
      languageLabel: '언어',
      collapsePanel: '패널 접기 / 펼치기',
      showHideLegend: '범례 표시 / 숨기기',
      closeArchives: '아카이브 닫기',
      navFirst: '첫 번째 주소 (가장 오래된)', navPrev: '이전 주소', navNext: '다음 주소', navLast: '마지막 주소 (가장 최근)',
      chronoNav: '연대순 탐색',
      dataUnavailable: '데이터 없음',
      loading: '로딩 중…'
    },
    hi: {
      title: 'G20 दूतावास दूरी मानचित्र',
      description: 'G20 दूतावासों और मेज़बान देश के सत्ता केंद्रों के बीच की दूरी। ऊपर एक झंडा क्लिक करें या लेयर नियंत्रण का उपयोग करें।',
      viewMatrix: 'दूरी सारणी देखें',
      avgRanking: 'औसत दूरी की रैंकिंग',
      legend: 'चिह्न-सूची',
      powerCenterLegend: 'सत्ता केंद्र (सरकार का स्थान)',
      embassyLegend: 'दूतावास स्थान (मूल देश का झंडा)',
      closeLegend: 'सत्ता केंद्र के पास',
      farLegend: 'सत्ता केंद्र से दूर',
      easySpying: 'आसान जासूसी (~1 कि.मी.): प्रलेखित SCS स्थान, शहरी GSM/WiFi/RF परास',
      maxSpying: 'अधिकतम जासूसी (~5 कि.मी.): दृष्टि-रेखा माइक्रोवेव, प्रति-जासूसी क्षेत्र',
      rankCol: '#',
      countryCol: 'देश',
      distCol: 'औसत दूरी',
      powerCenter: 'सत्ता केंद्र',
      capital: 'राजधानी',
      avgEmbassyDist: 'दूतावासों की औसत दूरी',
      closestEmbassy: 'सबसे निकट दूतावास',
      farthestEmbassy: 'सबसे दूर दूतावास',
      openInMaps: 'Google Maps में खोलें',
      archives: 'अभिलेखागार',
      embassyOf: '{host} में {name} का दूतावास',
      archivesTitle: 'ढाई शताब्दियों के <em>पेरिस के पते</em>',
      archivesLede: '1778 में बेंजामिन फ्रैंकलिन ने जहाँ फ्रांस-अमेरिकी संधि पर हस्ताक्षर किए थे, उस ओतेल दे वालंतिनुआ से लेकर प्लास द ला कोंकोर्द की चांसरी तक — {n} क्रमिक पते फ्रांस में अमेरिकी कूटनीति की कहानी कहते हैं।',
      kindLegation: 'दूतालय', kindEmbassy: 'दूतावास', kindChancery: 'चांसरी', kindConsulate: 'वाणिज्य दूतावास', kindResidence: 'आवास',
      languageLabel: 'भाषा',
      collapsePanel: 'पैनल बंद / खोलें',
      showHideLegend: 'चिह्न-सूची दिखाएँ / छिपाएँ',
      closeArchives: 'अभिलेखागार बंद करें',
      navFirst: 'पहला पता (सबसे पुराना)', navPrev: 'पिछला पता', navNext: 'अगला पता', navLast: 'अंतिम पता (सबसे हाल का)',
      chronoNav: 'कालक्रमिक नौसंचालन',
      dataUnavailable: 'डेटा उपलब्ध नहीं',
      loading: 'लोड हो रहा है…'
    },
    ar: {
      title: 'خريطة مسافات سفارات مجموعة العشرين',
      description: 'المسافة بين سفارات مجموعة العشرين ومراكز السلطة في الدولة المضيفة. انقر على علم أعلاه أو استخدم لوحة الطبقات.',
      viewMatrix: 'عرض جدول المسافات',
      avgRanking: 'الترتيب حسب المسافة المتوسطة',
      legend: 'مفتاح الخريطة',
      powerCenterLegend: 'مركز السلطة (مقر الحكومة)',
      embassyLegend: 'موقع السفارة (علم بلد الأصل)',
      closeLegend: 'قريب من مركز السلطة',
      farLegend: 'بعيد عن مركز السلطة',
      easySpying: 'تجسس سهل (~1 كم): مواقع SCS موثقة، نطاق GSM/WiFi/RF الحضري',
      maxSpying: 'تجسس أقصى (~5 كم): موجات دقيقة في خط الرؤية، نطاق مكافحة التجسس',
      rankCol: '#',
      countryCol: 'الدولة',
      distCol: 'متوسط المسافة',
      powerCenter: 'مركز السلطة',
      capital: 'العاصمة',
      avgEmbassyDist: 'متوسط مسافة السفارات',
      closestEmbassy: 'أقرب سفارة',
      farthestEmbassy: 'أبعد سفارة',
      openInMaps: 'فتح في خرائط جوجل',
      archives: 'الأرشيف',
      embassyOf: 'سفارة {name} · في {host}',
      archivesTitle: 'قرنان ونصف من <em>العناوين الباريسية</em>',
      archivesLede: 'من فندق فالنتينوا حيث وقع بنجامين فرانكلين عام 1778 التحالف الفرنسي-الأمريكي، إلى المستشارية في ميدان الكونكورد — {n} عنوانًا متعاقبًا تروي الدبلوماسية الأمريكية في فرنسا.',
      kindLegation: 'مفوضية', kindEmbassy: 'سفارة', kindChancery: 'مستشارية', kindConsulate: 'قنصلية', kindResidence: 'مقر إقامة',
      languageLabel: 'اللغة',
      collapsePanel: 'طي / توسيع اللوحة',
      showHideLegend: 'إظهار / إخفاء المفتاح',
      closeArchives: 'إغلاق الأرشيف',
      navFirst: 'العنوان الأول (الأقدم)', navPrev: 'العنوان السابق', navNext: 'العنوان التالي', navLast: 'العنوان الأخير (الأحدث)',
      chronoNav: 'تنقل زمني',
      dataUnavailable: 'البيانات غير متاحة',
      loading: 'جارٍ التحميل…'
    },
    tr: {
      title: 'G20 Büyükelçilik Mesafe Haritası',
      description: 'G20 büyükelçilikleri ile ev sahibi ülkenin güç merkezleri arasındaki mesafe. Yukarıdaki bir bayrağa tıklayın veya katman kontrolünü kullanın.',
      viewMatrix: 'Mesafe matrisini görüntüle',
      avgRanking: 'Ortalama mesafe sıralaması',
      legend: 'Lejant',
      powerCenterLegend: 'Güç merkezi (hükümet merkezi)',
      embassyLegend: 'Büyükelçilik konumu (köken ülke bayrağı)',
      closeLegend: 'Güç merkezine yakın',
      farLegend: 'Güç merkezinden uzak',
      easySpying: 'Kolay casusluk (~1 km): belgelenmiş SCS yerleşimleri, kentsel GSM/WiFi/RF menzili',
      maxSpying: 'Azami casusluk (~5 km): görüş hattı mikrodalga, karşı-istihbarat alanı',
      rankCol: '#',
      countryCol: 'Ülke',
      distCol: 'Ort. Mesafe',
      powerCenter: 'Güç merkezi',
      capital: 'Başkent',
      avgEmbassyDist: 'Ortalama büyükelçilik mesafesi',
      closestEmbassy: 'En yakın büyükelçilik',
      farthestEmbassy: 'En uzak büyükelçilik',
      openInMaps: 'Google Haritalar’da aç',
      archives: 'Arşivler',
      embassyOf: '{host}’deki {name} Büyükelçiliği',
      archivesTitle: 'İki buçuk yüzyıllık <em>Paris adresleri</em>',
      archivesLede: '1778’de Benjamin Franklin’in Fransa-Amerika ittifakını imzaladığı Hôtel de Valentinois’tan, Place de la Concorde’daki büyükelçilik binasına kadar — {n} ardışık adres, Amerika’nın Fransa’daki diplomasi tarihini anlatır.',
      kindLegation: 'elçilik', kindEmbassy: 'büyükelçilik', kindChancery: 'başkonsolosluk', kindConsulate: 'konsolosluk', kindResidence: 'ikametgâh',
      languageLabel: 'Dil',
      collapsePanel: 'Paneli daralt / genişlet',
      showHideLegend: 'Lejantı göster / gizle',
      closeArchives: 'Arşivleri kapat',
      navFirst: 'İlk adres (en eski)', navPrev: 'Önceki adres', navNext: 'Sonraki adres', navLast: 'Son adres (en yeni)',
      chronoNav: 'Kronolojik gezinme',
      dataUnavailable: 'Veri mevcut değil',
      loading: 'Yükleniyor…'
    },
    id: {
      title: 'Peta Jarak Kedutaan G20',
      description: 'Jarak antara kedutaan G20 dan pusat kekuasaan negara tuan rumah. Klik tombol bendera di atas atau gunakan kontrol lapisan.',
      viewMatrix: 'Lihat tabel jarak',
      avgRanking: 'Peringkat berdasarkan jarak rata-rata',
      legend: 'Keterangan',
      powerCenterLegend: 'Pusat kekuasaan (kursi pemerintahan)',
      embassyLegend: 'Lokasi kedutaan (bendera negara asal)',
      closeLegend: 'Dekat dengan pusat kekuasaan',
      farLegend: 'Jauh dari pusat kekuasaan',
      easySpying: 'Penyadapan mudah (~1 km): penempatan SCS terdokumentasi, jangkauan GSM/WiFi/RF perkotaan',
      maxSpying: 'Penyadapan maks. (~5 km): gelombang mikro garis pandang, zona kontra-intelijen',
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
