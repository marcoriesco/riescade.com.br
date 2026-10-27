// Portuguese landing-page content for platforms with real descriptions.
// Platforms missing here are served with noindex and left out of the sitemap.

export type PlatformKind =
  | "console"
  | "portable"
  | "computer"
  | "arcade"
  | "peripheral"
  | "engine"
  | "system"
  | "collection";

export interface PlatformContent {
  maker: string;
  year?: number;
  kind: PlatformKind;
  summary: string;
  /** Needs BIOS/firmware files to run games. */
  bios?: boolean;
}

export const PLATFORM_KIND_LABELS: Record<PlatformKind, string> = {
  console: "Console de mesa",
  portable: "Portátil",
  computer: "Computador",
  arcade: "Arcade",
  peripheral: "Acessório / expansão",
  engine: "Engine e fantasy console",
  system: "Sistema operacional",
  collection: "Coleção",
};

export const PLATFORM_CONTENT: Record<string, PlatformContent> = {
  // Nintendo
  nes: { maker: "Nintendo", year: 1985, kind: "console", summary: "O console de 8 bits que reergueu a indústria de videogames depois do crash de 1983. Foi a casa de Super Mario Bros., The Legend of Zelda, Metroid e Mega Man, e definiu como seria o videogame doméstico por décadas." },
  nesh: { maker: "Comunidade", kind: "collection", summary: "Hacks e traduções feitos por fãs para jogos do NES: fases novas, personagens trocados, correções e traduções para o português de clássicos de 8 bits." },
  fds: { maker: "Nintendo", year: 1986, kind: "peripheral", bios: true, summary: "Expansão do Famicom que lia disquetes próprios, mais baratos e regraváveis que cartuchos. Recebeu as versões originais de The Legend of Zelda e Metroid e muitos jogos lançados apenas no Japão." },
  snes: { maker: "Nintendo", year: 1990, kind: "console", summary: "O Super Nintendo é para muitos o auge da era 16 bits. Super Mario World, Donkey Kong Country, Super Metroid, Chrono Trigger e Street Fighter II fazem parte de uma biblioteca que continua entre as mais jogadas da emulação." },
  sfc: { maker: "Nintendo", year: 1990, kind: "console", summary: "O Super Famicom é a versão japonesa do Super Nintendo. Muitos RPGs e jogos de ação saíram apenas no Japão e hoje são jogáveis em português graças a traduções feitas por fãs." },
  snesh: { maker: "Comunidade", kind: "collection", summary: "Hacks e traduções de fãs para jogos do Super Nintendo, de versões revisadas de Super Mario World a traduções completas de RPGs japoneses." },
  sgb: { maker: "Nintendo", year: 1994, kind: "peripheral", summary: "Adaptador que permitia jogar cartuchos de Game Boy na TV pelo Super Nintendo, com bordas decorativas e paletas de cores para jogos originalmente monocromáticos." },
  satellaview: { maker: "Nintendo", year: 1995, kind: "peripheral", bios: true, summary: "Acessório japonês do Super Famicom que recebia jogos por transmissão via satélite. Muitos títulos exclusivos só sobreviveram graças à preservação feita por fãs." },
  sufami: { maker: "Bandai", year: 1996, kind: "peripheral", bios: true, summary: "Adaptador da Bandai para o Super Famicom com dois encaixes de minicartuchos, que podiam compartilhar dados entre si. Recebeu jogos de franquias como SD Gundam e Sailor Moon." },
  n64: { maker: "Nintendo", year: 1996, kind: "console", summary: "O console que levou a Nintendo ao 3D com Super Mario 64, The Legend of Zelda: Ocarina of Time, GoldenEye 007 e Mario Kart 64. Também popularizou o controle analógico e o multiplayer local para quatro pessoas." },
  n64dd: { maker: "Nintendo", year: 1999, kind: "peripheral", bios: true, summary: "Unidade de disco magnético do Nintendo 64, lançada apenas no Japão. Recebeu poucos jogos, como F-Zero X Expansion Kit e a série Mario Artist." },
  wii: { maker: "Nintendo", year: 2006, kind: "console", summary: "O Wii conquistou o público com controles de movimento em Wii Sports, Super Mario Galaxy, Mario Kart Wii e The Legend of Zelda: Twilight Princess. No PC, os jogos rodam em alta definição." },
  wiiu: { maker: "Nintendo", year: 2012, kind: "console", summary: "O Wii U apostou no GamePad com tela e foi a casa original de Mario Kart 8, Splatoon, Super Mario 3D World e Xenoblade Chronicles X." },
  switch: { maker: "Nintendo", year: 2017, kind: "console", bios: true, summary: "O híbrido da Nintendo, que funciona na TV e no modo portátil. The Legend of Zelda: Breath of the Wild, Super Mario Odyssey e Animal Crossing estão entre os destaques. Emular o Switch exige firmware e chaves do próprio console." },
  gb: { maker: "Nintendo", year: 1989, kind: "portable", summary: "O portátil que dominou os anos 90 com Tetris, Pokémon Red e Blue, Super Mario Land e The Legend of Zelda: Link's Awakening." },
  gbc: { maker: "Nintendo", year: 1998, kind: "portable", summary: "O Game Boy Color trouxe cores ao portátil e foi a casa de Pokémon Gold, Silver e Crystal, além de versões coloridas de vários clássicos do Game Boy." },
  gba: { maker: "Nintendo", year: 2001, kind: "portable", summary: "O Game Boy Advance levou a experiência de 16 bits para o bolso, com Pokémon Ruby, Sapphire e Emerald, Metroid Fusion, Golden Sun e Castlevania: Aria of Sorrow." },
  nds: { maker: "Nintendo", year: 2004, kind: "portable", summary: "O Nintendo DS e suas duas telas, uma delas sensível ao toque, venderam mais de 150 milhões de unidades. New Super Mario Bros., Pokémon Diamond e Pearl e Professor Layton são alguns dos destaques." },
  virtualboy: { maker: "Nintendo", year: 1995, kind: "portable", summary: "Uma das ideias mais ousadas da Nintendo: um console 3D estereoscópico com gráficos em vermelho e preto. Teve vida curta e hoje é uma curiosidade cobiçada por colecionadores." },
  gameandwatch: { maker: "Nintendo", year: 1980, kind: "portable", summary: "Os portáteis de tela de LCD que começaram a história da Nintendo nos portáteis e introduziram o direcional em cruz, presente em quase todo controle desde então." },
  pokemini: { maker: "Nintendo", year: 2001, kind: "portable", summary: "O menor console com cartuchos da Nintendo, dedicado a minijogos de Pokémon e com sensor de movimento e vibração embutidos." },

  // Sega
  mastersystem: { maker: "Sega", year: 1986, kind: "console", summary: "O 8 bits da Sega fez enorme sucesso no Brasil graças à Tectoy, com Alex Kidd in Miracle World, Sonic the Hedgehog, Wonder Boy e Phantasy Star." },
  genesis: { maker: "Sega", year: 1989, kind: "console", summary: "O Sega Genesis é a versão norte-americana do Mega Drive, o 16 bits que enfrentou a Nintendo com Sonic, Streets of Rage, Gunstar Heroes e Mortal Kombat." },
  megadrive: { maker: "Sega", year: 1988, kind: "console", summary: "O Mega Drive é um dos consoles mais queridos do Brasil, onde foi produzido pela Tectoy por décadas. Sonic the Hedgehog, Streets of Rage 2, Golden Axe e Shinobi III marcaram uma geração." },
  segacd: { maker: "Sega", year: 1992, kind: "peripheral", bios: true, summary: "Expansão em CD do Mega Drive, com trilhas em qualidade de CD e vídeo em movimento. Sonic CD, Lunar: The Silver Star e Snatcher são alguns destaques." },
  sega32x: { maker: "Sega", year: 1994, kind: "peripheral", summary: "Expansão de 32 bits que se encaixava no Mega Drive. Teve uma biblioteca pequena, com Knuckles' Chaotix, Virtua Racing Deluxe e Star Wars Arcade." },
  saturn: { maker: "Sega", year: 1994, kind: "console", bios: true, summary: "O Sega Saturn é lembrado pelos jogos 2D impecáveis e pelas conversões de arcade, como Panzer Dragoon Saga, NiGHTS into Dreams, Guardian Heroes e Radiant Silvergun." },
  dreamcast: { maker: "Sega", year: 1998, kind: "console", bios: true, summary: "O último console da Sega, à frente do seu tempo, com jogo online e jogos como Shenmue, Sonic Adventure, Jet Set Radio, Crazy Taxi e Soulcalibur." },
  gamegear: { maker: "Sega", year: 1990, kind: "portable", summary: "O portátil colorido da Sega, com hardware próximo ao Master System. Teve versões de Sonic, Shinobi e Columns e também foi produzido pela Tectoy no Brasil." },

  // Sony
  psx: { maker: "Sony", year: 1994, kind: "console", bios: true, summary: "O primeiro PlayStation popularizou os jogos em CD e o 3D, com Final Fantasy VII, Metal Gear Solid, Resident Evil, Gran Turismo e Crash Bandicoot." },
  ps2: { maker: "Sony", year: 2000, kind: "console", bios: true, summary: "O console mais vendido da história, com uma biblioteca enorme: God of War, Shadow of the Colossus, GTA San Andreas, Pro Evolution Soccer e Kingdom Hearts." },
  ps3: { maker: "Sony", year: 2006, kind: "console", bios: true, summary: "O PlayStation 3 recebeu The Last of Us, Uncharted 2, Demon's Souls e Metal Gear Solid 4. Sua arquitetura complexa exige um PC mais potente e o firmware oficial do console." },
  ps4: { maker: "Sony", year: 2013, kind: "console", summary: "O PlayStation 4 trouxe Bloodborne, God of War, Marvel's Spider-Man e Horizon Zero Dawn. A emulação ainda é experimental, mas muitos títulos já são jogáveis no PC." },
  ps5: { maker: "Sony", year: 2020, kind: "console", summary: "A geração atual da Sony, com jogos como Demon's Souls Remake, Ratchet & Clank: Em Uma Outra Dimensão e Astro Bot." },
  psp: { maker: "Sony", year: 2004, kind: "portable", summary: "O PlayStation Portable levou gráficos de nível PS2 para o bolso, com God of War: Chains of Olympus, Monster Hunter Freedom Unite, Crisis Core e Patapon." },
  psvita: { maker: "Sony", year: 2011, kind: "portable", bios: true, summary: "O PS Vita tinha tela OLED, controles duplos e jogos como Persona 4 Golden, Gravity Rush e Tearaway. A emulação exige o firmware do console." },

  // Microsoft
  xbox: { maker: "Microsoft", year: 2001, kind: "console", bios: true, summary: "A estreia da Microsoft nos consoles, com Halo: Combat Evolved, Fable, Jade Empire e Ninja Gaiden, além de popularizar o jogo online com a Xbox Live." },
  xbox360: { maker: "Microsoft", year: 2005, kind: "console", summary: "O Xbox 360 marcou a era HD com Halo 3, Gears of War, Forza Motorsport e Fable II e consolidou as conquistas e o multiplayer online." },
  msx1: { maker: "Microsoft e ASCII", year: 1983, kind: "computer", bios: true, summary: "O padrão MSX reuniu vários fabricantes no mesmo computador e fez sucesso no Brasil com o Gradiente Expert e o Sharp Hotbit. Recebeu os primeiros Metal Gear e muitos jogos da Konami." },
  msx2: { maker: "Microsoft e ASCII", year: 1985, kind: "computer", bios: true, summary: "A segunda geração do MSX, com mais cores e memória. É a casa de Metal Gear 2: Solid Snake, Space Manbow e de vários RPGs japoneses." },
  msxturbor: { maker: "Panasonic", year: 1990, kind: "computer", bios: true, summary: "O último e mais rápido modelo da família MSX, lançado apenas no Japão pela Panasonic." },
  dos: { maker: "Microsoft", year: 1981, kind: "system", summary: "O MS-DOS reinou nos PCs dos anos 80 e 90 com Doom, Prince of Persia, Monkey Island, Commander Keen e os primeiros jogos de estratégia e simulação." },
  windows: { maker: "Microsoft", year: 1985, kind: "system", summary: "Jogos de PC para Windows, organizados na mesma biblioteca dos consoles e iniciados com um clique, com controle e sem sair da interface." },

  // Atari
  atari2600: { maker: "Atari", year: 1977, kind: "console", summary: "O console que levou os videogames para dentro de casa, com Pitfall!, River Raid, Space Invaders e Enduro. No Brasil foi muito popular, inclusive em versões nacionais." },
  atari5200: { maker: "Atari", year: 1982, kind: "console", bios: true, summary: "O sucessor do 2600, com hardware baseado nos computadores Atari de 8 bits e controle analógico." },
  atari7800: { maker: "Atari", year: 1986, kind: "console", summary: "Console compatível com os cartuchos do 2600, com versões de arcade como Joust, Ms. Pac-Man e Food Fight." },
  atari800: { maker: "Atari", year: 1979, kind: "computer", bios: true, summary: "A linha de computadores de 8 bits da Atari, com gráficos e som avançados para a época e jogos como Star Raiders e M.U.L.E." },
  xegs: { maker: "Atari", year: 1987, kind: "console", bios: true, summary: "O Atari XE Game System transformou o computador Atari de 8 bits em console, com teclado opcional e compatibilidade com a biblioteca dos computadores." },
  atarist: { maker: "Atari", year: 1985, kind: "computer", bios: true, summary: "Computador de 16 bits muito usado por músicos graças às portas MIDI, com jogos como Dungeon Master, Populous e Xenon 2." },
  lynx: { maker: "Atari", year: 1989, kind: "portable", bios: true, summary: "O primeiro portátil com tela colorida retroiluminada, com recursos avançados de escala de sprites e jogos como California Games e Chip's Challenge." },
  jaguar: { maker: "Atari", year: 1993, kind: "console", summary: "O último console da Atari, anunciado como 64 bits, lembrado por Alien vs Predator, Tempest 2000 e Rayman." },
  jaguarcd: { maker: "Atari", year: 1995, kind: "peripheral", bios: true, summary: "Expansão em CD do Atari Jaguar, com poucos jogos lançados, como Myst e Battlemorph." },

  // NEC e Hudson
  pcengine: { maker: "NEC e Hudson Soft", year: 1987, kind: "console", summary: "O PC Engine foi um fenômeno no Japão, com shooters e jogos de plataforma de altíssimo nível, como Bonk's Adventure, R-Type e Bomberman." },
  tg16: { maker: "NEC", year: 1989, kind: "console", summary: "O TurboGrafx-16 é a versão americana do PC Engine, com Bonk's Adventure, Blazing Lazers e Military Madness." },
  pcenginecd: { maker: "NEC e Hudson Soft", year: 1988, kind: "peripheral", bios: true, summary: "O PC Engine CD foi o primeiro console com jogos em CD-ROM e recebeu Rondo of Blood, Ys I & II e Gate of Thunder." },
  supergrafx: { maker: "NEC", year: 1989, kind: "console", summary: "Versão turbinada do PC Engine com poucos jogos exclusivos, entre eles Daimakaimura (Ghouls 'n Ghosts) e Aldynes." },
  pcfx: { maker: "NEC", year: 1994, kind: "console", bios: true, summary: "Sucessor japonês do PC Engine, focado em vídeo animado e jogos em estilo anime." },
  pc88: { maker: "NEC", year: 1981, kind: "computer", bios: true, summary: "Computador japonês muito popular nos anos 80, onde nasceram as primeiras versões de Ys, Dragon Slayer e de vários RPGs clássicos." },
  pc98: { maker: "NEC", year: 1982, kind: "computer", bios: true, summary: "O computador dominante no Japão por mais de uma década, berço de Touhou e de muitos RPGs e visual novels." },

  // SNK
  neogeo: { maker: "SNK", year: 1990, kind: "arcade", bios: true, summary: "O sistema da SNK que levou o arcade para casa sem cortes: The King of Fighters, Metal Slug, Samurai Shodown, Fatal Fury e Garou: Mark of the Wolves." },
  neogeocd: { maker: "SNK", year: 1994, kind: "console", bios: true, summary: "Versão em CD do Neo Geo, mais barata que os cartuchos originais e com a mesma biblioteca de lutas e ação." },
  ngp: { maker: "SNK", year: 1998, kind: "portable", summary: "O primeiro portátil da SNK, com tela monocromática e o excelente direcional em formato de joystick." },
  ngpc: { maker: "SNK", year: 1999, kind: "portable", summary: "O Neo Geo Pocket Color recebeu SNK vs. Capcom: The Match of the Millennium, Metal Slug: 1st Mission e Sonic the Hedgehog Pocket Adventure." },

  // Arcades
  arcade: { maker: "Vários", kind: "collection", summary: "Os fliperamas clássicos reunidos em um só lugar: lutas, navinhas, beat 'em ups e corridas que marcaram as casas de jogos dos anos 80 e 90." },
  mame: { maker: "Equipe MAME", year: 1997, kind: "arcade", summary: "O MAME preserva milhares de placas de arcade com precisão, de Pac-Man e Donkey Kong a Street Fighter, Cadillacs and Dinosaurs e The Simpsons." },
  fbneo: { maker: "Equipe FinalBurn", year: 2019, kind: "arcade", summary: "O FinalBurn Neo é um emulador de arcade focado em desempenho e jogo online, ótimo para Neo Geo, CPS1, CPS2 e CPS3." },
  cps1: { maker: "Capcom", year: 1988, kind: "arcade", summary: "A primeira placa CP System da Capcom, com Street Fighter II, Final Fight, Captain Commando e Strider." },
  cps2: { maker: "Capcom", year: 1993, kind: "arcade", summary: "A segunda geração da Capcom nos arcades, com Super Street Fighter II Turbo, Marvel vs. Capcom, Alien vs. Predator e Dungeons & Dragons." },
  cps3: { maker: "Capcom", year: 1996, kind: "arcade", summary: "A placa mais avançada da Capcom para jogos 2D, com Street Fighter III: 3rd Strike, Red Earth e JoJo's Bizarre Adventure." },
  naomi: { maker: "Sega", year: 1998, kind: "arcade", bios: true, summary: "Placa de arcade da Sega baseada no Dreamcast, com Marvel vs. Capcom 2, Crazy Taxi, Virtua Tennis e Capcom vs. SNK." },
  naomi2: { maker: "Sega", year: 2000, kind: "arcade", bios: true, summary: "Evolução do Naomi com gráficos mais avançados, base de Virtua Fighter 4 e Initial D Arcade Stage." },
  atomiswave: { maker: "Sammy", year: 2003, kind: "arcade", bios: true, summary: "Placa de arcade da Sammy, sucessora do Neo Geo para a SNK, com Metal Slug 6, The King of Fighters XI e Samurai Shodown VI." },
  model2: { maker: "Sega", year: 1993, kind: "arcade", summary: "A placa 3D da Sega por trás de Daytona USA, Virtua Fighter 2, Sega Rally Championship e The House of the Dead." },
  model3: { maker: "Sega", year: 1996, kind: "arcade", summary: "A placa mais poderosa da Sega nos anos 90, com Virtua Fighter 3, Scud Race, Daytona USA 2 e Sega Rally 2." },
  triforce: { maker: "Sega, Namco e Nintendo", year: 2002, kind: "arcade", summary: "Placa de arcade criada em parceria e baseada no GameCube, com F-Zero AX e Mario Kart Arcade GP." },
  daphne: { maker: "Comunidade", year: 1999, kind: "arcade", summary: "Emulador dos jogos de laserdisc, os fliperamas com animação de cinema, como Dragon's Lair e Space Ace." },

  // Outros consoles
  "3do": { maker: "Panasonic e outros", year: 1993, kind: "console", bios: true, summary: "Console em CD licenciado para vários fabricantes, com Road Rash, Star Control II e The Need for Speed." },
  colecovision: { maker: "Coleco", year: 1982, kind: "console", bios: true, summary: "O ColecoVision trouxe conversões de arcade muito fiéis para a época, como Donkey Kong, Zaxxon e Venture." },
  intellivision: { maker: "Mattel", year: 1979, kind: "console", bios: true, summary: "O grande rival do Atari 2600, com gráficos mais detalhados e controle com teclado numérico." },
  vectrex: { maker: "Smith Engineering", year: 1982, kind: "console", summary: "Console com monitor vetorial embutido e gráficos em linhas, como nos arcades Asteroids e Tempest." },
  channelf: { maker: "Fairchild", year: 1976, kind: "console", bios: true, summary: "O primeiro console com cartuchos programáveis, lançado antes mesmo do Atari 2600." },
  astrocade: { maker: "Bally", year: 1977, kind: "console", summary: "Console da Bally com recursos avançados de cor e linguagem BASIC embutida." },
  arcadia: { maker: "Emerson", year: 1982, kind: "console", summary: "Console de 8 bits com muitas variações regionais e jogos inspirados em arcades da época." },
  crvision: { maker: "VTech", year: 1982, kind: "console", bios: true, summary: "Console e computador da VTech, com controles destacáveis que formavam um teclado." },
  pv1000: { maker: "Casio", year: 1983, kind: "console", summary: "Console japonês da Casio, com biblioteca pequena e vida curta." },
  scv: { maker: "Epoch", year: 1984, kind: "console", summary: "O Super Cassette Vision foi um console japonês da Epoch com versões de jogos de arcade e licenças de anime." },
  multivision: { maker: "Tsukuda Original", year: 1983, kind: "console", summary: "Clone japonês do Sega SG-1000, compatível com a biblioteca da Sega." },
  cdi: { maker: "Philips", year: 1991, kind: "console", bios: true, summary: "O CD-i da Philips é famoso pelos jogos da série Zelda produzidos fora da Nintendo e pelo foco em multimídia." },
  supracan: { maker: "Funtech", year: 1995, kind: "console", summary: "Console de 16 bits de Taiwan com pouquíssimos jogos lançados." },
  vsmile: { maker: "VTech", year: 2004, kind: "console", summary: "Console educativo da VTech para crianças, com jogos licenciados de personagens infantis." },
  uzebox: { maker: "Belogic", year: 2008, kind: "console", summary: "Console de código aberto feito por entusiastas, com jogos homebrew criados pela comunidade." },
  amigacd32: { maker: "Commodore", year: 1993, kind: "console", bios: true, summary: "Console de 32 bits baseado no Amiga 1200, com jogos em CD como Microcosm e versões de clássicos do Amiga." },
  gx4000: { maker: "Amstrad", year: 1990, kind: "console", summary: "Console da Amstrad baseado na linha CPC Plus, com biblioteca curta de cartuchos." },
  spectravideo: { maker: "Spectravideo", year: 1983, kind: "computer", bios: true, summary: "Computadores de 8 bits que serviram de base para o padrão MSX." },

  // Portáteis
  wswan: { maker: "Bandai", year: 1999, kind: "portable", summary: "Portátil japonês criado por Gunpei Yokoi, o mesmo do Game Boy, que podia ser jogado na vertical e na horizontal." },
  wswanc: { maker: "Bandai", year: 2000, kind: "portable", summary: "Versão colorida do WonderSwan, com remakes de Final Fantasy e jogos de franquias de anime." },
  lcdgames: { maker: "Vários", kind: "portable", summary: "Minigames de tela de LCD dos anos 80 e 90, de fabricantes como Tiger, Nintendo e Bandai." },
  gamecom: { maker: "Tiger Electronics", year: 1997, kind: "portable", summary: "Portátil da Tiger com tela sensível ao toque e acesso à internet, anos antes de isso virar padrão." },
  gamate: { maker: "Bit Corporation", year: 1990, kind: "portable", summary: "Portátil taiwanês que tentou competir com o Game Boy." },
  gmaster: { maker: "Hartung", year: 1990, kind: "portable", summary: "Portátil alemão de baixo custo lançado na era do Game Boy." },
  megaduck: { maker: "Welback", year: 1993, kind: "portable", summary: "Portátil semelhante ao Game Boy, vendido também com outros nomes em vários países." },
  supervision: { maker: "Watara", year: 1992, kind: "portable", summary: "Portátil barato da Watara, com tela monocromática e opção de ligar na TV." },
  ngage: { maker: "Nokia", year: 2003, kind: "portable", summary: "O celular-console da Nokia, com versões de Tomb Raider, Tony Hawk's Pro Skater e Pathway to Glory." },
  arduboy: { maker: "Kevin Bates", year: 2015, kind: "portable", summary: "Portátil de código aberto do tamanho de um cartão de crédito, com centenas de jogos homebrew." },
  palm: { maker: "Palm", year: 1996, kind: "system", summary: "Jogos e aplicativos dos PDAs Palm, que reinaram antes dos smartphones." },

  // Computadores
  c64: { maker: "Commodore", year: 1982, kind: "computer", summary: "O computador mais vendido da história, com trilhas sonoras do chip SID e jogos como Impossible Mission, Maniac Mansion e The Last Ninja." },
  amiga1200: { maker: "Commodore", year: 1992, kind: "computer", bios: true, summary: "O Amiga 1200 marcou os anos 90 com Lemmings, Sensible Soccer, Cannon Fodder e Shadow of the Beast." },
  zxspectrum: { maker: "Sinclair", year: 1982, kind: "computer", summary: "O computador que popularizou os jogos caseiros no Reino Unido, com Manic Miner, Jet Set Willy e Knight Lore." },
  zx81: { maker: "Sinclair", year: 1981, kind: "computer", summary: "Antecessor do ZX Spectrum, com tela em preto e branco e apenas 1 KB de memória, famoso no Brasil pelos clones TK." },
  apple2: { maker: "Apple", year: 1977, kind: "computer", summary: "Um dos primeiros computadores pessoais de sucesso, berço de Ultima, Wizardry, Lode Runner e Prince of Persia." },
  apple2gs: { maker: "Apple", year: 1986, kind: "computer", bios: true, summary: "O Apple II mais avançado, com gráficos e som de 16 bits." },
  amstradcpc: { maker: "Amstrad", year: 1984, kind: "computer", summary: "Computador de 8 bits muito popular na Europa, vendido já com monitor e gravador de fita." },
  bbcmicro: { maker: "Acorn", year: 1981, kind: "computer", summary: "Computador britânico usado nas escolas, onde nasceu Elite, um marco dos jogos de exploração espacial." },
  electron: { maker: "Acorn", year: 1983, kind: "computer", summary: "Versão mais barata do BBC Micro, compatível com boa parte da biblioteca." },
  archimedes: { maker: "Acorn", year: 1987, kind: "computer", bios: true, summary: "O primeiro computador com processador ARM, a arquitetura usada hoje em quase todos os celulares." },
  x68000: { maker: "Sharp", year: 1987, kind: "computer", bios: true, summary: "Computador japonês com conversões quase perfeitas de arcades da Capcom e da Konami." },
  x1: { maker: "Sharp", year: 1982, kind: "computer", bios: true, summary: "Computador japonês da Sharp, antecessor do X68000." },
  fmtowns: { maker: "Fujitsu", year: 1989, kind: "computer", bios: true, summary: "Computador japonês com CD-ROM de série e versões caprichadas de jogos de arcade e PC." },
  fm7: { maker: "Fujitsu", year: 1982, kind: "computer", bios: true, summary: "Computador japonês de 8 bits da Fujitsu, rival dos PC-88 da NEC." },
  coco: { maker: "Tandy", year: 1980, kind: "computer", bios: true, summary: "O TRS-80 Color Computer, popular nos Estados Unidos e com clones brasileiros como o CP 400." },
  dragon32: { maker: "Dragon Data", year: 1982, kind: "computer", bios: true, summary: "Computador britânico muito parecido com o TRS-80 Color Computer." },
  ti99: { maker: "Texas Instruments", year: 1981, kind: "computer", bios: true, summary: "O primeiro computador doméstico de 16 bits, com cartuchos e síntese de voz." },
  samcoupe: { maker: "MGT", year: 1989, kind: "computer", summary: "Computador britânico compatível com o ZX Spectrum, com gráficos e som melhores." },
  adam: { maker: "Coleco", year: 1983, kind: "computer", bios: true, summary: "Computador da Coleco baseado no ColecoVision, compatível com seus jogos." },

  // Engines e fantasy consoles
  scummvm: { maker: "Equipe ScummVM", year: 2001, kind: "engine", summary: "Roda os grandes adventures de apontar e clicar, como Monkey Island, Day of the Tentacle, Full Throttle e Broken Sword." },
  openbor: { maker: "Comunidade", year: 2004, kind: "engine", summary: "Engine de beat 'em up com centenas de jogos criados por fãs, inspirados em Streets of Rage e Final Fight." },
  mugen: { maker: "Elecbyte", year: 1999, kind: "engine", summary: "Engine de luta 2D com milhares de personagens e cenários criados por fãs." },
  easyrpg: { maker: "Equipe EasyRPG", year: 2007, kind: "engine", summary: "Executa jogos feitos com RPG Maker 2000 e 2003, como Yume Nikki e milhares de RPGs independentes." },
  flash: { maker: "Macromedia", year: 1996, kind: "engine", summary: "Os jogos em Flash que dominaram a internet dos anos 2000, preservados para jogar sem navegador." },
  pico8: { maker: "Lexaloffle", year: 2015, kind: "engine", summary: "Fantasy console com limitações de 8 bits e uma comunidade enorme de jogos, incluindo a primeira versão de Celeste." },
  tic80: { maker: "Vadim Grigoruk", year: 2017, kind: "engine", summary: "Fantasy console gratuito e de código aberto, com ferramentas para criar e jogar pequenos jogos retrô." },
  lowresnx: { maker: "Timo Kloss", year: 2017, kind: "engine", summary: "Fantasy console inspirado nos 16 bits, programado em BASIC." },
  lutro: { maker: "libretro", kind: "engine", summary: "Engine de jogos 2D em Lua, compatível com o framework LÖVE." },
  wasm4: { maker: "Bruno Garcia", year: 2021, kind: "engine", summary: "Fantasy console em WebAssembly com jogos minimalistas criados pela comunidade." },
  solarus: { maker: "Equipe Solarus", kind: "engine", summary: "Engine de RPG de ação no estilo Zelda, com jogos completos criados por fãs." },
  vpinball: { maker: "Comunidade", year: 2000, kind: "engine", summary: "O Visual Pinball recria mesas de pinball reais com física detalhada." },
  fpinball: { maker: "Christopher Leathley", year: 2005, kind: "engine", summary: "Engine de pinball com centenas de mesas recriadas e originais." },

  // Coleções
  ports: { maker: "Comunidade", kind: "collection", summary: "Versões nativas para PC de clássicos, feitas a partir do código-fonte ou de engines recriadas pela comunidade." },
};
