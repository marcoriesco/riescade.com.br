const fs = require('fs');
const path = require('path');

const ES_SYSTEMS_PATH = 'D:/Downloads/tmp/RIESCADE/tmp/RIESCADE_RETROBAT/emulationstation/.emulationstation/es_systems.cfg';
const PLATFORMS_IMAGES_PATH = path.join(__dirname, '../src/data/platform-images.json');
const LOGOS_DIR = path.join(__dirname, '../public/images/platforms/logos');
const OUTPUT_PATH = path.join(__dirname, '../src/data/wiki-systems.json');

// Read es_systems.cfg
const rawEsXml = fs.readFileSync(ES_SYSTEMS_PATH, 'utf8');

// Read existing platform images
let platformImages = {};
try {
  platformImages = JSON.parse(fs.readFileSync(PLATFORMS_IMAGES_PATH, 'utf8'));
} catch (e) {
  console.warn('Could not read platform-images.json', e.message);
}

// Read existing logos in public directory
const existingLogos = new Set(
  fs.existsSync(LOGOS_DIR) ? fs.readdirSync(LOGOS_DIR).map((f) => f.toLowerCase()) : []
);

function resolveLogo(name, folder, theme, platform) {
  const candidates = [
    name,
    folder,
    theme,
    platform,
    name.replace(/[^a-zA-Z0-9]/g, ''),
    folder.replace(/[^a-zA-Z0-9]/g, ''),
  ].filter(Boolean);

  for (const cand of candidates) {
    const filename = `${cand.toLowerCase()}.webp`;
    if (existingLogos.has(filename)) {
      return `/images/platforms/logos/${filename}`;
    }
  }

  // Check platformImages json
  if (platformImages[name]?.logo) return platformImages[name].logo;
  if (platformImages[folder]?.logo) return platformImages[folder].logo;

  return null;
}

// Read platform-content.ts to extract summaries
const platformContentFile = fs.readFileSync(path.join(__dirname, '../src/data/platform-content.ts'), 'utf8');
const summaries = {};
const summaryRegex = /([a-zA-Z0-9_-]+):\s*\{[^}]*?summary:\s*"([^"]+)"/g;
let sumMatch;
while ((sumMatch = summaryRegex.exec(platformContentFile)) !== null) {
  summaries[sumMatch[1]] = sumMatch[2];
}

// Known BIOS files map
const BIOS_MAP = {
  psx: {
    required: true,
    files: ['scph5501.bin (US - MD5: 490f666e1afb15b7362b406ed1cea246)', 'scph5502.bin (EU - MD5: 32736f17079d0b2b7024407c39bd3050)', 'scph5500.bin (JP - MD5: ff3eeb8c664e0536ead8d8724e72505a)'],
    notes: 'Coloque na pasta bios/. Essencial para compatibilidade máxima com DuckStation, SwanStation e Beetle PSX HW.',
  },
  ps2: {
    required: true,
    files: ['SCPH-70004.bin (ou qualquer BIOS SCPH-3xxxx a SCPH-9xxxx)', 'rom1.bin (opcional)', 'rom2.bin (opcional)'],
    notes: 'Coloque na pasta bios/ ou bios/pcsx2/bios/. Necessário para rodar o emulador PCSX2.',
  },
  ps3: {
    required: true,
    files: ['PS3UPDAT.PUP (Firmware oficial Sony PlayStation 3)'],
    notes: 'Instale dentro do RPCS3 através do menu File → Install Firmware ou use o instalador do RIESCADE.',
  },
  psp: {
    required: false,
    files: [],
    notes: 'PPSSPP tem HLE BIOS embutida de alta performance, iniciando os jogos imediatamente.',
  },
  psvita: {
    required: true,
    files: ['PSP2UPDAT.PUP (Firmware oficial PS Vita)', 'font package oficial'],
    notes: 'Instale o firmware através da interface gráfica do Vita3K.',
  },
  saturn: {
    required: true,
    files: ['sega_101.bin (Japão - MD5: 224b752f3434603c62ab0b03704efc38)', 'mpr-17933.bin (EUA/Europa - MD5: 4f1345d312bc85d21469e882a176d634)'],
    notes: 'Coloque na pasta bios/. Necessário para Mednafen / Beetle Saturn e Kronos.',
  },
  dreamcast: {
    required: true,
    files: ['dc_boot.bin (MD5: e10c53c2f8b90bab96eed2e9684f4fc5b)', 'dc_flash.bin (MD5: 0a93f7940c455905ab6e36b337ae04be)'],
    notes: 'Coloque dentro de bios/dc/. Necessário para Flycast e Redream.',
  },
  segacd: {
    required: true,
    files: ['bios_CD_U.bin (US)', 'bios_CD_E.bin (Europa)', 'bios_CD_J.bin (Japão)'],
    notes: 'Coloque na pasta bios/. Essencial para Genesis Plus GX e Picodrive.',
  },
  megacd: {
    required: true,
    files: ['bios_CD_U.bin (US)', 'bios_CD_E.bin (Europa)', 'bios_CD_J.bin (Japão)'],
    notes: 'Coloque na pasta bios/. Essencial para rodar imagens de CD do Mega CD.',
  },
  sega32x: {
    required: false,
    files: ['32X_G_BIOS.BIN', '32X_M_BIOS.BIN', '32X_S_BIOS.BIN'],
    notes: 'Opcional para Picodrive, mas recomendado para fidelidade total.',
  },
  switch: {
    required: true,
    files: ['prod.keys (Chaves de criptografia)', 'title.keys', 'Firmware oficial do Nintendo Switch'],
    notes: 'Coloque as chaves em bios/switch/keys/ e instale os arquivos de firmware descompactados em bios/switch/registered/.',
  },
  wiiu: {
    required: false,
    files: ['otp.bin', 'seeprom.bin'],
    notes: 'O emulador Cemu roda a maioria dos jogos em formato RPX ou WUA sem exigir dump da memória do console.',
  },
  wii: {
    required: false,
    files: [],
    notes: 'Dolphin emula o IOS e o sistema do Wii por HLE sem requerer BIOS externa.',
  },
  gamecube: {
    required: false,
    files: [],
    notes: 'Dolphin roda discos de GameCube diretamente sem BIOS obrigatória.',
  },
  n64: {
    required: false,
    files: [],
    notes: 'Emulação HLE no Simple64 e Mupen64Plus dispensa BIOS para cartuchos comerciais.',
  },
  arcade: {
    required: true,
    files: ['neogeo.zip', 'pgm.zip', 'qsound_hle.zip', 'decocass.zip', 'naomi.zip', 'namcoc75.zip'],
    notes: 'Mantenha os arquivos .zip de BIOS na mesma pasta roms/arcade/ ou em bios/.',
  },
  mame: {
    required: true,
    files: ['Arquivos de BIOS do ROMset MAME (neogeo.zip, qsound.zip, etc.)'],
    notes: 'Devem permanecer compactados em formato .zip dentro de roms/mame/ ou bios/.',
  },
  fbneo: {
    required: true,
    files: ['Arquivos de BIOS do ROMset FBNeo (neogeo.zip, pgm.zip, etc.)'],
    notes: 'Devem permanecer compactados em formato .zip dentro de roms/fbneo/ ou bios/.',
  },
  pcenginecd: {
    required: true,
    files: ['syscard3.pce (Super CD-ROM System V3.00)'],
    notes: 'Coloque na pasta bios/. Obrigatório para jogos em CD de PC Engine / TurboGrafx-CD.',
  },
  pcfx: {
    required: true,
    files: ['pcfx.rom'],
    notes: 'Coloque na pasta bios/.',
  },
  '3do': {
    required: true,
    files: ['panafz10.bin (Panasonic FZ-10)', 'goldstar.bin (Goldstar 3DO)'],
    notes: 'Coloque na pasta bios/. Opera com Opera e 4DO.',
  },
  amiga500: {
    required: true,
    files: ['kick34005.A500 (Kickstart 1.3 - MD5: c4f0f55f1d1e0855e342be99185e5b14)'],
    notes: 'Coloque na pasta bios/.',
  },
  amiga1200: {
    required: true,
    files: ['kick40068.A1200 (Kickstart 3.1)'],
    notes: 'Coloque na pasta bios/.',
  },
  amigacd32: {
    required: true,
    files: ['kick40060.CD32', 'kick40060.CD32.ext'],
    notes: 'Coloque na pasta bios/.',
  },
  atari5200: {
    required: true,
    files: ['5200.rom'],
    notes: 'Coloque na pasta bios/.',
  },
  atari7800: {
    required: false,
    files: ['7800 BIOS (U).rom'],
    notes: 'Opcional no ProSystem, recomendado para compatibilidade.',
  },
  jaguarcd: {
    required: true,
    files: ['jagcd.bin'],
    notes: 'Coloque na pasta bios/.',
  },
  lynx: {
    required: true,
    files: ['lynxboot.img'],
    notes: 'Coloque na pasta bios/.',
  },
  colecovision: {
    required: true,
    files: ['coleco.rom'],
    notes: 'Coloque na pasta bios/.',
  },
  intellivision: {
    required: true,
    files: ['exec.bin', 'grom.bin'],
    notes: 'Coloque na pasta bios/.',
  },
  fds: {
    required: true,
    files: ['disksys.rom (Famicom Disk System BIOS)'],
    notes: 'Coloque na pasta bios/. Obrigatório para jogos em formato .fds do Famicom Disk System.',
  },
  msx1: {
    required: false,
    files: [],
    notes: 'C-BIOS aberta inclusa. Jogos comerciais podem requerer MSX.ROM na pasta bios/.',
  },
  msx2: {
    required: false,
    files: [],
    notes: 'C-BIOS inclusa. Dumps autênticos exigem MSX2.ROM e MSX2EXT.ROM na pasta bios/.',
  },
  x68000: {
    required: true,
    files: ['iplrom.dat', 'cgrom.dat'],
    notes: 'Coloque dentro da pasta bios/keropi/.',
  },
  fmtowns: {
    required: true,
    files: ['FMT_DIC.ROM', 'FMT_DOS.ROM', 'FMT_FNT.ROM', 'FMT_SYS.ROM'],
    notes: 'Coloque dentro de bios/fmtowns/.',
  },
  pc98: {
    required: true,
    files: ['bios.rom', 'font.rom', 'sound.rom'],
    notes: 'Coloque dentro de bios/np2kai/.',
  },
  arcadedumps: {
    required: false,
    files: [],
    notes: 'Não precisa de BIOS tradicional. Utiliza os wrappers LinuxLoader 64-bit / Raw Thrills e UltraLoader já configurados pelo RIESCADE.',
  },
  pgm3viper: {
    required: false,
    files: [],
    notes: 'Os arquivos de launcher (.game) e dumps são executados pelo emulador Kitsune interno do RIESCADE.',
  },
  arcadews: {
    required: true,
    files: ['neogeo.zip (se jogar títulos Neo Geo Widescreen)'],
    notes: 'ROMs patchadas para 16:9 executadas pelo core especializado FBNeo Widescreen.',
  },
  xboxlivearcade: {
    required: false,
    files: [],
    notes: 'Xenia não exige dump de BIOS de Xbox 360.',
  },
  recomp: {
    required: false,
    files: [],
    notes: 'Projetos recompilados nativos de PC (N64 Recomp, etc.). Executam direto no Windows a 60/120fps nativos.',
  },
  recomps: {
    required: false,
    files: [],
    notes: 'Projetos recompilados nativos de PC (N64 Recomp, etc.). Executam direto no Windows a 60/120fps nativos.',
  },
  pinballfx3: {
    required: false,
    files: [],
    notes: 'Configurado para carregar tabelas do Pinball FX3 via Steam ou standalone.',
  },
};

// Recommended format per hardware/system
function getRecommendedFormat(system) {
  const name = system.id.toLowerCase();
  const discSystems = ['psx', 'ps2', 'saturn', 'dreamcast', 'megacd', 'segacd', '3do', 'pcenginecd', 'pcfx', 'amigacd32'];
  if (name === 'windows') return '.game (executáveis locais) ou .url / .lnk (Steam, Epic, Xbox)';
  if (name === 'arcadedumps') return '.game ou .bat (acompanhado da pasta de dump do jogo)';
  if (name === 'pgm3viper') return '.game (arquivo apontando para o identificador do jogo Viper/PGM3)';
  if (name === 'arcadews') return '.zip ou .7z (romset Arcade com patch Widescreen 16:9)';
  if (name === 'xboxlivearcade') return '.iso ou .m3u';
  if (name === 'recomp' || name === 'recomps') return '.game (apontando para o executável recompilado)';
  if (name === 'switch') return '.nsp ou .xci';
  if (name === 'wiiu') return '.wua (formato compactado único) ou pasta extraída com .rpx';
  if (name === 'wii') return '.rvz (RVZ é altamente recomendado por economia de espaço e integridade)';
  if (name === 'gamecube') return '.rvz (melhor formato para Dolphin com redução de até 60% do tamanho)';
  if (name === '3ds') return '.cci ou .3ds descriptografado';
  if (name === 'nds') return '.nds';
  if (name === 'psp') return '.cso ou .chd (economizam espaço) ou .iso';
  if (name === 'ps3') return 'Pasta do jogo com PS3_GAME (formato JB Folder) ou .pkg com licença .rap';
  if (discSystems.includes(name)) return '.chd (reduz em até 60% o tamanho da ISO/BIN mantendo áudio perfeito)';
  if (name.includes('arcade') || name === 'mame' || name === 'fbneo' || name === 'neogeo') return '.zip (ROMset não extraído)';
  return system.extensions[0] || '.zip';
}

// Rich detailed sections generator per system
function getDetailedSections(system) {
  const name = system.id.toLowerCase();
  const folder = system.folder;

  // WINDOWS COMPREHENSIVE GUIDE (MATCHING AND SURPASSING RETROBAT WIKI)
  if (name === 'windows') {
    return [
      {
        id: 'overview-folders',
        title: 'Informações Gerais e Estrutura de Pastas',
        description: 'Os jogos de Windows rodam nativamente no seu sistema operacional, sem passar por camadas lentas de emulação. O RIESCADE organiza os jogos em pastas dedicadas para facilitar o gerenciamento de cada loja ou formato.',
        callout: {
          type: 'info',
          title: 'Subpastas Dedicadas por Loja',
          text: 'Você pode colocar todos os atalhos diretamente em roms\\windows\\ ou organizá-los nas subpastas específicas da sua loja favorita.',
        },
        table: {
          headers: ['Loja / Tipo de Jogo', 'Pasta no RIESCADE', 'Formatos Recomendados'],
          rows: [
            ['Jogos Nativos / Portáteis / Outros', 'roms\\windows\\', '.game, .lnk, .bat, .exe'],
            ['Steam', 'roms\\steam\\ ou roms\\windows\\', '.url (atalho do Steam) ou .lnk'],
            ['Epic Games Store', 'roms\\epic\\ ou roms\\windows\\', '.url (atalho da Epic)'],
            ['Amazon Games', 'roms\\amazon\\ ou roms\\windows\\', '.url (atalho da Amazon)'],
            ['EA Games / EA App', 'roms\\eagames\\ ou roms\\windows\\', '.lnk, .url'],
            ['GOG Galaxy', 'roms\\gog\\ ou roms\\windows\\', '.lnk, .game, .bat'],
            ['Xbox Game Pass / Microsoft Store', 'roms\\windows\\', '.lnk + arquivo .uwp obrigatório'],
          ],
        },
      },
      {
        id: 'auto-scan',
        title: 'Varredura Automática de Lojas (Auto-Scan)',
        description: 'O RIESCADE possui um scanner nativo capaz de identificar automaticamente os jogos que você já tem instalados no seu PC nas plataformas Steam, Epic Games, GOG, EA App e Amazon Games, sem necessidade de criar atalhos manuais.',
        steps: [
          {
            stepNumber: 1,
            title: 'Abra o Menu Principal',
            text: 'Na interface do RIESCADE, pressione a tecla de menu (ou botão Start do controle).',
          },
          {
            stepNumber: 2,
            title: 'Navegue até as Configurações de Jogos de Windows',
            text: 'Acesse: Menu Principal → Configurações de Jogos → Jogos de Windows (Main Menu → Game Settings → Windows Games).',
          },
          {
            stepNumber: 3,
            title: 'Habilite as Lojas Desejadas',
            text: 'Ative os seletores correspondentes à Steam, Epic, GOG, EA ou Amazon. O RIESCADE atualizará a lista de jogos a cada inicialização.',
          },
        ],
      },
      {
        id: 'method-game-file',
        title: 'Método 1: Jogos Nativos e Portáteis (Arquivo .game)',
        badge: 'Recomendado para Jogos Standalone',
        description: 'O método mais limpo e confiável para jogos instalados no PC ou versões portáteis. Consiste em criar um arquivo de texto com o caminho exato do executável.',
        steps: [
          {
            stepNumber: 1,
            title: 'Copie o caminho do executável do seu jogo',
            text: 'No Windows Explorer, localize o arquivo .exe do jogo (exemplo: C:\\Games\\Dead Cells\\DeadCells.exe).',
          },
          {
            stepNumber: 2,
            title: 'Crie o arquivo de texto',
            text: 'Abra o Bloco de Notas, cole o caminho completo do executável na primeira linha e salve com o nome do jogo.',
          },
          {
            stepNumber: 3,
            title: 'Altere a extensão para .game',
            text: 'Renomeie o arquivo de .txt para .game (exemplo: Dead Cells.game) e mova para roms\\windows\\.',
          },
        ],
        snippets: [
          {
            filename: 'Dead Cells.game',
            language: 'text',
            description: 'Conteúdo do arquivo Dead Cells.game salvo em roms\\windows\\:',
            code: 'C:\\Games\\Dead Cells\\DeadCells.exe',
          },
        ],
      },
      {
        id: 'method-store-shortcuts',
        title: 'Método 2: Jogos Steam, Epic Games e Amazon (.url / .lnk)',
        description: 'Você pode usar diretamente os atalhos criados pelas lojas no seu Desktop.',
        steps: [
          {
            stepNumber: 1,
            title: 'Crie o atalho na Área de Trabalho',
            text: 'Dentro do client da Steam ou Epic Games, clique com o botão direito no jogo instalado e selecione "Criar atalho na Área de Trabalho".',
          },
          {
            stepNumber: 2,
            title: 'Mova o atalho para a pasta roms\\windows\\',
            text: 'Recorte o atalho gerado (.url ou .lnk) e cole na pasta roms\\windows\\ (ou na subpasta correspondente da loja).',
          },
          {
            stepNumber: 3,
            title: 'Atualize a lista no RIESCADE',
            text: 'Pressione F5 no RIESCADE para que o jogo apareça com suas capas e metadados.',
          },
        ],
        callout: {
          type: 'warning',
          title: 'Atenção com a música de fundo',
          text: 'Se a música do menu continuar tocando enquanto o jogo estiver aberto, aplique o truque do arquivo .gameexe detalhado abaixo!',
        },
      },
      {
        id: 'method-xbox-gamepass',
        title: 'Método 3: Jogos do Microsoft Xbox Game Pass e UWP',
        badge: 'Xbox Game Pass',
        description: 'Jogos do Xbox Game Pass são protegidos e empacotados em formato UWP ou pastas criptografadas do Windows. Para que o RIESCADE gerencie a execução corretamente, siga o procedimento com o arquivo .uwp.',
        steps: [
          {
            stepNumber: 1,
            title: 'Crie o atalho pelo aplicativo Xbox',
            text: 'No app Xbox no Windows, clique com o botão direito no jogo instalado e selecione "Criar atalho na Área de Trabalho".',
          },
          {
            stepNumber: 2,
            title: 'Mova o atalho para roms\\windows\\',
            text: 'Copie o atalho criado para dentro da pasta roms\\windows\\ (ex: Forza Horizon 5.lnk).',
          },
          {
            stepNumber: 3,
            title: 'Copie o nome do aplicativo UWP',
            text: 'Clique com o botão direito no atalho → Propriedades. Na aba Atalho, copie o texto do Destino ou nome do pacote UWP (ex: Microsoft.624F8B84B80_8wekyb3d8bbwe!ForzaHorizon5).',
          },
          {
            stepNumber: 4,
            title: 'Crie o arquivo com extensão .uwp',
            text: 'Crie um arquivo de texto ao lado do atalho com o mesmo nome e extensão .uwp, contendo apenas o nome do pacote UWP na primeira linha.',
          },
        ],
        snippets: [
          {
            filename: 'Forza Horizon 5.uwp',
            language: 'text',
            description: 'Arquivo Forza Horizon 5.uwp salvo em roms\\windows\\ ao lado de Forza Horizon 5.lnk:',
            code: 'Microsoft.624F8B84B80_8wekyb3d8bbwe!ForzaHorizon5',
          },
        ],
        callout: {
          type: 'info',
          title: 'Por que o arquivo .uwp é obrigatório?',
          text: 'O Windows gerencia jogos da Microsoft Store de forma isolada. Sem o arquivo .uwp, o RIESCADE não consegue detectar quando o jogo fecha e continuará tocando a música de fundo durante a gameplay.',
        },
      },
      {
        id: 'method-ubisoft',
        title: 'Método 4: Jogos Ubisoft Connect via Script Batch (.bat)',
        description: 'Os jogos da Ubisoft abrem através do Ubisoft Connect e fecham o processo disparador inicial. O script .bat mantém o EmulationStation em espera monitorando o executável real do jogo em loop.',
        snippets: [
          {
            filename: 'Assassin_Creed_Valhalla.bat',
            language: 'batch',
            description: 'Script .bat que monitora o jogo e fecha o Ubisoft Connect ao terminar:',
            code: `@echo OFF\n\nREM Insira aqui o AppID do jogo Ubisoft (obtido nas propriedades do atalho desktop):\nSTART uplay://launch/5059/0\n\nTIMEOUT /t 30\n:RUNNING\n\nREM Nome exato do processo do executável em execução no Gerenciador de Tarefas:\ntasklist|findstr "ACValhalla.exe" > nul\n\nIF %errorlevel%==1 timeout /t 5 & taskkill /F /IM upc.exe /T & GOTO ENDLOOP\ntimeout /t 2\nGOTO RUNNING\n:ENDLOOP`,
          },
          {
            filename: 'Rayman_Legends_NoKill.bat',
            language: 'batch',
            description: 'Script .bat que NÃO fecha o Ubisoft Connect (inicia mais rápido nas próximas vezes):',
            code: `@echo OFF\n\nREM Insira aqui o comando uplay:// do jogo:\nSTART uplay://launch/80/0\n\nTIMEOUT /t 20\n:RUNNING\n\ntasklist|findstr "Rayman Legends.exe" > nul\n\nIF %errorlevel%==1 timeout /t 5 & GOTO ENDLOOP\ntimeout /t 2\nGOTO RUNNING\n:ENDLOOP`,
          },
        ],
      },
      {
        id: 'method-gameexe-trick',
        title: 'O Truque do Arquivo .gameexe (Música tocando em segundo plano)',
        badge: 'Dica Crucial',
        description: 'Este problema ocorre quando o jogo possui um launcher intermediário (como Rockstar Launcher, 2K Launcher, EA App, Origin ou iniciadores de mods). O RIESCADE detecta o fechamento do launcher e acha que o jogo encerrou, voltando a tocar a música do menu por cima do jogo.',
        steps: [
          {
            stepNumber: 1,
            title: 'Abra o jogo fora do RIESCADE',
            text: 'Inicie o jogo e aguarde até estar na tela de título ou gameplay.',
          },
          {
            stepNumber: 2,
            title: 'Abra o Gerenciador de Tarefas do Windows',
            text: 'Pressione Ctrl + Shift + Esc (ou Ctrl + Alt + Del) e localize o nome exato do executável do jogo (exemplo: RDR2.exe).',
          },
          {
            stepNumber: 3,
            title: 'Crie o arquivo .gameexe',
            text: 'Na pasta roms\\windows\\, crie um arquivo de texto com o mesmo nome do seu atalho ou arquivo de jogo e extensão .gameexe (exemplo: Red Dead Redemption 2.gameexe).',
          },
          {
            stepNumber: 4,
            title: 'Cole o nome do processo SEM o .exe',
            text: 'Escreva apenas o nome do executável dentro do arquivo (exemplo: RDR2). Salve o arquivo.',
          },
        ],
        snippets: [
          {
            filename: 'Red Dead Redemption 2.gameexe',
            language: 'text',
            description: 'Conteúdo do arquivo Red Dead Redemption 2.gameexe:',
            code: 'RDR2',
          },
          {
            filename: 'JogoComDoisProcessos.gameexe',
            language: 'text',
            description: 'Se o jogo alternar entre dois executáveis durante a partida, adicione o segundo na linha 2:',
            code: 'LauncherProcess\nGameProcess',
          },
        ],
        callout: {
          type: 'tip',
          title: 'Compatibilidade Universal',
          text: 'O arquivo .gameexe funciona perfeitamente ao lado de atalhos .lnk, atalhos .url e arquivos .game.',
        },
      },
    ];
  }

  // PLAYSTATION 1 (PSX)
  if (name === 'psx') {
    return [
      {
        id: 'psx-m3u',
        title: 'Jogos Multi-Disco: Como Criar Arquivos .m3u',
        badge: 'Essencial para RPGs',
        description: 'Para jogos que possuem mais de um disco (como Final Fantasy VII, VIII, IX, Metal Gear Solid e Resident Evil 2), utilize uma playlist .m3u. Isso permite trocar de disco facilmente no DuckStation ou RetroArch sem perder o progresso e sem poluir sua lista com vários itens do mesmo jogo.',
        steps: [
          {
            stepNumber: 1,
            title: 'Coloque todos os discos na pasta',
            text: 'Coloque os arquivos dos discos (preferencialmente em formato .chd) na pasta roms\\psx\\.',
          },
          {
            stepNumber: 2,
            title: 'Crie o arquivo de texto .m3u',
            text: 'Crie um arquivo com o nome do jogo e extensão .m3u (exemplo: Final Fantasy VII.m3u).',
          },
          {
            stepNumber: 3,
            title: 'Liste o nome exato de cada disco',
            text: 'Escreva o nome do arquivo de cada disco, um por linha, respeitando as extensões.',
          },
        ],
        snippets: [
          {
            filename: 'Final Fantasy VII.m3u',
            language: 'text',
            description: 'Exemplo de playlist .m3u para Final Fantasy VII (3 Discos):',
            code: `Final Fantasy VII (Disc 1).chd\nFinal Fantasy VII (Disc 2).chd\nFinal Fantasy VII (Disc 3).chd`,
          },
          {
            filename: 'Metal Gear Solid.m3u',
            language: 'text',
            description: 'Exemplo para Metal Gear Solid (2 Discos):',
            code: `Metal Gear Solid (Disc 1).chd\nMetal Gear Solid (Disc 2).chd`,
          },
        ],
      },
      {
        id: 'psx-chd',
        title: 'Compressão CHD: Mais Espaço e Sem Perda de Áudio',
        description: 'O formato .chd (Compressed Hunks of Data) é o padrão ouro para discos de PlayStation 1. Ele reduz o tamanho das imagens .cue/.bin em até 60% e mantém todas as faixas de áudio CD-DA perfeitamente sincronizadas.',
      },
      {
        id: 'psx-bios-table',
        title: 'Tabela de BIOS Oficiais do PlayStation 1',
        description: 'Coloque as BIOS na pasta bios\\ do RIESCADE para compatibilidade total com DuckStation, SwanStation e Beetle PSX HW.',
        table: {
          headers: ['Região', 'Arquivo BIOS', 'Hash MD5 Verificado', 'Uso'],
          rows: [
            ['América do Norte (NTSC-U)', 'scph5501.bin', '490f666e1afb15b7362b406ed1cea246', 'Requerido para jogos dos EUA'],
            ['Europa (PAL)', 'scph5502.bin', '32736f17079d0b2b7024407c39bd3050', 'Requerido para jogos europeus'],
            ['Japão (NTSC-J)', 'scph5500.bin', 'ff3eeb8c664e0536ead8d8724e72505a', 'Requerido para jogos japoneses'],
          ],
        },
      },
      {
        id: 'psx-hd-textures',
        title: 'Pacotes de Texturas HD no DuckStation',
        description: 'O DuckStation suporta substituição de texturas em tempo real por texturas remasterizadas pela comunidade.',
        snippets: [
          {
            filename: 'Caminho das texturas',
            language: 'text',
            description: 'Extraia os pacotes de textura no seguinte diretório:',
            code: `emulators\\duckstation\\textures\\<GAME_ID>\\replacements\\\nExemplo: emulators\\duckstation\\textures\\SLUS-00067\\replacements\\`,
          },
        ],
      },
    ];
  }

  // PLAYSTATION 2 (PS2)
  if (name === 'ps2') {
    return [
      {
        id: 'ps2-formats',
        title: 'Formatos Recomendados: .chd e .iso',
        description: 'O emulador PCSX2 v2.x modernizado no RIESCADE possui suporte nativo integral a imagens .chd compactadas. Jogos convertidos para .chd economizam centenas de gigabytes no seu SSD sem nenhuma perda de performance.',
      },
      {
        id: 'ps2-bios',
        title: 'Configuração da BIOS do PlayStation 2',
        description: 'Coloque os arquivos de BIOS de PS2 dentro de bios\\ ou bios\\pcsx2\\bios\\.',
        table: {
          headers: ['Modelo', 'Arquivo Recomendado', 'Notas'],
          rows: [
            ['PS2 Slim (Universal)', 'SCPH-70004.bin ou SCPH-77001.bin', 'Maior compatibilidade global'],
            ['PS2 Fat', 'SCPH-39001.bin', 'Excelente para títulos clássicos'],
          ],
        },
      },
      {
        id: 'ps2-hd-textures',
        title: 'Remasterização com Texturas HD Comunitárias',
        description: 'O PCSX2 suporta texturas HD substitutas. Basta baixar o pacote comunitário do seu jogo e extrair na pasta de texturas:',
        snippets: [
          {
            filename: 'Caminho das texturas do PCSX2',
            language: 'text',
            description: 'Diretório de substituição de texturas:',
            code: `emulators\\pcsx2\\textures\\<SERIAL_DO_JOGO>\\replacements\\\nExemplo para Black: emulators\\pcsx2\\textures\\SLUS-21376\\replacements\\`,
          },
        ],
      },
    ];
  }

  // PLAYSTATION 3 (PS3)
  if (name === 'ps3') {
    return [
      {
        id: 'ps3-firmware',
        title: 'Instalação Obrigatória do Firmware Oficial',
        badge: 'Obrigatório',
        description: 'O RPCS3 necessita que os módulos oficiais da Sony estejam instalados no disco virtual.',
        steps: [
          {
            stepNumber: 1,
            title: 'Baixe o firmware oficial da Sony',
            text: 'O arquivo chama-se PS3UPDAT.PUP (membros RIESCADE podem baixar direto pelo pacote de BIOS).',
          },
          {
            stepNumber: 2,
            title: 'Instale no RPCS3',
            text: 'Abra o emulador RPCS3, clique no menu superior File → Install Firmware e selecione o PS3UPDAT.PUP.',
          },
          {
            stepNumber: 3,
            title: 'Aguarde a compilação dos módulos PPU',
            text: 'O emulador compilará os arquivos do sistema. Uma mensagem de sucesso confirmará a instalação.',
          },
        ],
      },
      {
        id: 'ps3-game-formats',
        title: 'Estrutura dos Jogos: JB Folder (.ps3dir) e Pacotes .pkg',
        description: 'O RIESCADE suporta tanto jogos em formato de pasta quanto instaladores digitais .pkg com chaves .rap.',
        snippets: [
          {
            filename: 'Estrutura de pasta (JB Folder)',
            language: 'text',
            description: 'Coloque a pasta do jogo dentro de roms\\ps3\\:',
            code: `roms\\ps3\\Demon's Souls [BLES00932]\\PS3_GAME\\USRDIR\\EBOOT.BIN\nroms\\ps3\\Demon's Souls [BLES00932]\\PS3_DISC.SFB`,
          },
          {
            filename: 'Licenças .rap para jogos .pkg',
            language: 'text',
            description: 'Coloque as licenças .rap das compras digitais na pasta exdata do RPCS3:',
            code: `emulators\\rpcs3\\dev_hdd0\\home\\00000001\\exdata\\<NOME_DA_LICENCA>.rap`,
          },
        ],
      },
    ];
  }

  // NINTENDO SWITCH
  if (name === 'switch') {
    return [
      {
        id: 'switch-keys',
        title: 'Arquivos de Chaves de Criptografia (prod.keys e title.keys)',
        badge: 'Obrigatório',
        description: 'Sem as chaves criptográficas (prod.keys), nenhum emulador de Switch conseguirá ler suas ROMs.',
        steps: [
          {
            stepNumber: 1,
            title: 'Obtenha os arquivos prod.keys e title.keys',
            text: 'As chaves devem ser da mesma versão ou mais recentes que o firmware do jogo que você pretende rodar.',
          },
          {
            stepNumber: 2,
            title: 'Copie para a pasta de chaves do RIESCADE',
            text: 'Cole os arquivos em: bios\\switch\\keys\\ (ou em bios\\ryujinx\\system\\).',
          },
        ],
        callout: {
          type: 'info',
          title: 'Facilidade para Membros',
          text: 'O pacote de BIOS da RIESCADE já inclui as chaves prod.keys e title.keys atualizadas na versão mais recente.',
        },
      },
      {
        id: 'switch-firmware',
        title: 'Instalação do Firmware do Console',
        description: 'Para jogos que utilizam fontes do sistema, menus Mii ou shaders avançados, o firmware oficial é exigido. Extraia os arquivos .nca do firmware dentro de bios\\switch\\registered\\.',
      },
      {
        id: 'switch-updates',
        title: 'Como Aplicar Updates e DLCs no Ryujinx',
        description: 'Mantenha os arquivos base (.nsp/.xci) em roms\\switch\\. No Ryujinx, clique com o botão direito no jogo e selecione "Manage Title Updates" ou "Manage DLC" para vincular as atualizações.',
      },
    ];
  }

  // GAMECUBE & WII
  if (name === 'gamecube' || name === 'wii') {
    return [
      {
        id: 'dolphin-rvz',
        title: 'Formato RVZ: O Padrão Moderno do Dolphin',
        badge: 'Altamente Recomendado',
        description: 'O formato .rvz foi desenvolvido especificamente pela equipe do Dolphin. Ele compacta as imagens ISO sem perdas (lossless), elimina lixo de dados do disco e mantém o hash MD5 intacto.',
        callout: {
          type: 'tip',
          title: 'Economia Gigante de Espaço',
          text: 'Um jogo como Super Smash Bros. Brawl pode cair de 7.9 GB em .iso para apenas 3.8 GB em .rvz sem nenhuma diferença visual ou de áudio.',
        },
      },
      {
        id: 'wii-controls',
        title: 'Controles no Wii: Controles Convencionais vs Wiimote Real',
        description: 'O Dolphin já vem pré-configurado no RIESCADE para que controles padrão (Xbox, PS4, PS5 e 8BitDo) simulem o Wiimote com o analógico direito apontando na tela. Para jogar com Wiimote Físico real, recomendamos a barra Mayflash DolphinBar conectada em Modo 4.',
      },
    ];
  }

  // ARCADE, MAME & FBNEO
  if (name === 'arcade' || name === 'mame' || name === 'fbneo') {
    return [
      {
        id: 'arcade-rule-no-unzip',
        title: 'A Regra de Ouro do Arcade: NUNCA Extraia os Arquivos .zip',
        badge: 'Regra Fundamental',
        description: 'Diferente de jogos de PC ou consoles de CD, emuladores de arcade (MAME e FinalBurn Neo) lêem os chips individuais de ROM diretamente de dentro do arquivo .zip. Se você extrair o conteúdo do .zip, o jogo NÃO FUNCIONARÁ!',
        callout: {
          type: 'danger',
          title: 'Não altere os nomes dos arquivos .zip',
          text: 'Os nomes como mslug.zip, kof98.zip, sf2.zip são códigos universais de identificação dos drivers da placa arcade. Nunca renomeie esses arquivos.',
        },
      },
      {
        id: 'arcade-bios',
        title: 'Arquivos de BIOS de Arcade',
        description: 'Certos sistemas (como Neo Geo, PolyGame Master e Capcom QSound) exigem um arquivo de BIOS acompanhando a ROM:',
        table: {
          headers: ['Placa Arcade', 'Arquivo de BIOS (.zip)', 'Localização'],
          rows: [
            ['SNK Neo Geo MVS/AES', 'neogeo.zip', 'roms\\arcade\\ ou bios\\'],
            ['Capcom CPS1 / CPS2 (Áudio)', 'qsound_hle.zip ou qsound.zip', 'roms\\arcade\\ ou bios\\'],
            ['IGS PolyGame Master (PGM)', 'pgm.zip', 'roms\\arcade\\ ou bios\\'],
            ['Sega Naomi / Atomiswave', 'naomi.zip, awbios.zip', 'roms\\arcade\\ ou bios\\'],
          ],
        },
      },
    ];
  }

  // EXCLUSIVOS RIESCADE
  if (name === 'arcadedumps') {
    return [
      {
        id: 'arcadedumps-intro',
        title: 'Arcade PC Dumps no RIESCADE',
        badge: 'Exclusivo RIESCADE',
        description: 'Sistema exclusivo para dumps de gabinetes arcade modernos baseados em hardware x86/PC (como Halo: Fireteam Raven, Mario Kart Arcade GP DX, Star Wars Battle Pod, Transformers Human Alliance, Luigi Mansion Arcade).',
        snippets: [
          {
            filename: 'Estrutura de pastas em roms\\arcadedumps\\',
            language: 'text',
            description: 'Como organizar os dados e launchers:',
            code: `roms\\arcadedumps\\Halo Fireteam Raven.bat\nroms\\arcadedumps\\halo-fireteam-raven\\ (pasta completa com os dados do jogo)\nroms\\arcadedumps\\Mario Kart Arcade GP DX.game`,
          },
        ],
        callout: {
          type: 'info',
          title: 'Loaders Integrados',
          text: 'O RIESCADE já inclui os launchers necessários pré-configurados em emulators\\linuxloader-rawthrills\\ com suporte a resoluções ultrawide e force feedback.',
        },
      },
    ];
  }

  if (name === 'recomp' || name === 'recomps') {
    return [
      {
        id: 'recomp-intro',
        title: 'Projetos de Recompilação Nativa para PC (PC Ports)',
        badge: 'Exclusivo RIESCADE',
        description: 'Clássicos reimaginados e recompilados em código C/C++ nativo para Windows. Não usam emulador e rodam a 60, 120 ou 144+ FPS destravados com suporte nativo a monitores ultrawide, iluminação avançada e texturas em altíssima resolução.',
        table: {
          headers: ['Título Recompilado', 'Projeto', 'Destaques'],
          rows: [
            ['Zelda 64: Ocarina of Time', 'Ship of Harkinian', '60 FPS, widescreen, câmera livre, controles modernos'],
            ['Zelda: Majora\'s Mask', 'Zelda 64 Recompiled', 'Taxa de quadros destravada, suporte ultrawide e gyro'],
            ['Perfect Dark PC', 'Perfect Dark Port', 'Suporte a teclado e mouse, 120 FPS e renderizador DirectX'],
            ['Super Mario 64 PC', 'Render96 / SM64 Plus', 'Modelos poligonais estilo Nintendo 64 Promo Art e 60 FPS'],
          ],
        },
      },
    ];
  }

  if (name === 'arcadews') {
    return [
      {
        id: 'arcadews-intro',
        title: 'Arcade Widescreen 16:9 Nativo',
        badge: 'Exclusivo RIESCADE',
        description: 'Coletânea exclusiva onde os clássicos dos arcades (Capcom CPS1, CPS2, CPS3, Neo Geo e Cave) recebem patches no código para renderizar a imagem em proporção panorâmica 16:9 sem esticar os sprites e expandindo o campo de visão.',
        callout: {
          type: 'tip',
          title: 'Core Especializado',
          text: 'O sistema utiliza a versão especial fbneo_arcadews embutida no RIESCADE, garantindo enquadramento perfeito em TVs modernas sem bordas pretas laterais.',
        },
      },
    ];
  }

  if (name === 'pgm3viper') {
    return [
      {
        id: 'pgm3viper-intro',
        title: 'Hardware IGS PGM3 e Konami Viper Arcade',
        badge: 'Exclusivo RIESCADE',
        description: 'Jogos da placa arcade IGS PolyGame Master 3 e hardware Konami Viper (títulos como Boxing Mania, Knights of Valour 3 HD, GTI Club e Silent Scope EX).',
        snippets: [
          {
            filename: 'Disparador .game',
            language: 'text',
            description: 'Executado diretamente através do emulador Kitsune interno do RIESCADE:',
            code: `roms\\pgm3viper\\Boxing Mania.game`,
          },
        ],
      },
    ];
  }

  return [];
}

// Special instructions and notes per system
function getSpecialNotes(system) {
  const notes = [];
  const name = system.id.toLowerCase();

  if (name === 'windows') {
    notes.push('Não necessita de emulador: os jogos são executados diretamente pelo Windows de forma nativa.');
    notes.push('Suporta atalhos diretos (.url) de lojas como Steam, Epic Games Store e Amazon Games.');
    notes.push('Para jogos do Xbox Game Pass, é fundamental criar o arquivo .uwp com o ID da aplicação para pausar a música de fundo.');
    notes.push('Para jogos com launchers (Rockstar, 2K, EA), use o truque do arquivo .gameexe para evitar música tocando durante a gameplay.');
  } else if (name === 'arcadedumps') {
    notes.push('Sistema exclusivo do RIESCADE para dumps de placas arcade modernas baseadas em PC (ex: Halo Fireteam Raven, Mario Kart Arcade GP DX, Star Wars Battle Pod).');
    notes.push('Estrutura de arquivos: coloque o script .bat ou arquivo .game na raiz de \\roms\\arcadedumps\\ e a pasta com os dados do jogo ao lado.');
    notes.push('O executável halo-loader64.exe e as bibliotecas do LinuxLoader ficam em \\emulators\\linuxloader-rawthrills\\.');
  } else if (name === 'pgm3viper') {
    notes.push('Sistema dedicado aos jogos da placa arcade IGS PGM3 e Konami Viper (ex: Boxing Mania, Knights of Valour 3 HD, GTI Club, Silent Scope EX).');
    notes.push('O emulador Kitsune foi integrado exclusivamente no emulatorLauncher do RIESCADE para carregar as roms via arquivos .game.');
  } else if (name === 'arcadews') {
    notes.push('ROMs de arcade com patch 16:9 executadas pelo core especializado FBNeo Widescreen sem esticar sprites.');
  } else if (name === 'recomp' || name === 'recomps') {
    notes.push('Projetos recompilados em C/C++ nativo rodando com resolução ultra-alta, 60/120+ fps e compatibilidade com controles modernos.');
  } else if (name === 'switch') {
    notes.push('Requer chaves prod.keys atualizadas na mesma versão do firmware instalado no emulador para descriptografar os títulos.');
    notes.push('DLCs e atualizações (updates) devem ser instalados dentro do emulador Ryujinx/Citron.');
  } else if (name === 'arcade' || name === 'mame' || name === 'fbneo') {
    notes.push('NUNCA extraia os arquivos .zip das ROMs de Arcade. Mantenha os arquivos .zip exatamente como vêm no ROMset.');
    notes.push('Sempre utilize a versão de ROMset compatível com o core/versão do MAME ou FBNeo configurado.');
  }

  return notes;
}

// Generate step-by-step instructions
function getInstructions(system) {
  const folder = system.folder;
  const recommended = getRecommendedFormat(system);

  if (system.id === 'windows') {
    return [
      `Localize a pasta de instalação do RIESCADE no seu disco (ex: C:\\RIESCADE).`,
      `Abra o diretório: roms\\windows\\ (ou a subpasta da loja correspondente, como roms\\steam\\).`,
      `Adicione seu jogo usando um arquivo .game apontando para o .exe, ou cole o atalho da Área de Trabalho (.url ou .lnk).`,
      `Para jogos do Xbox Game Pass, crie o arquivo .uwp acompanhante para que a música de fundo pause durante a partida.`,
      `Se o jogo tiver launcher próprio e a música continuar tocando, crie o arquivo .gameexe com o nome do processo.`,
      `Abra o RIESCADE e atualize a lista com F5. O jogo aparecerá pronto para ser executado!`
    ];
  }

  if (system.id === 'arcadedumps') {
    return [
      `Abra o diretório onde o RIESCADE está instalado no seu computador.`,
      `Navegue até a pasta: roms\\arcadedumps\\`,
      `Copie a pasta de dados do jogo arcade (ex: halo-fireteam-raven) para dentro de roms\\arcadedumps\\.`,
      `Certifique-se de que o arquivo disparador correspondente (.bat ou .game) esteja na raiz de roms\\arcadedumps\\.`,
      `Abra o RIESCADE e pressione F5 ou acesse Menu Principal → Atualizar Lista de Jogos. O jogo aparecerá com capa e informações prontas para jogar!`
    ];
  }

  if (system.id === 'pgm3viper') {
    return [
      `Acesse a pasta: roms\\pgm3viper\\ dentro da raiz do RIESCADE.`,
      `Copie o arquivo .game correspondente ao título (ex: Boxing Mania - Ashita no Joe.game).`,
      `Mantenha os arquivos de suporte na pasta roms\\pgm3viper\\library\\.`,
      `Abra o RIESCADE e atualize a lista de jogos para carregar o título com o emulador Kitsune.`
    ];
  }

  return [
    `Localize a pasta de instalação do RIESCADE no seu disco (ex: C:\\RIESCADE).`,
    `Abra a pasta: roms\\${folder}\\`,
    `Copie seus jogos para dentro desta pasta no formato recomendado (${recommended}).`,
    system.biosRequired ? `Verifique se o pacote de BIOS está instalado em bios\\ (assinantes RIESCADE instalam com 1 clique no app).` : `Este sistema não exige BIOS obrigatória, os jogos iniciam imediatamente.`,
    `Abra o RIESCADE, abra o menu principal e escolha "Atualizar Lista de Jogos" (ou pressione F5 no teclado). Pronto para jogar!`
  ];
}

// Parse system XML entries
const systemBlocks = [...rawEsXml.matchAll(/<system>([\s\S]*?)<\/system>/g)];
const parsedSystems = [];

for (const match of systemBlocks) {
  const block = match[1];
  const getTag = (tag) => {
    const m = block.match(new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>'));
    return m ? m[1].trim() : '';
  };

  const name = getTag('name');
  if (!name || name === 'riescade' || name === 'mess') continue; // Skip internal meta menus

  const fullname = getTag('fullname') || name;
  const manufacturer = getTag('manufacturer') || 'Vários';
  const hardware = getTag('hardware') || 'console';
  const release = getTag('release') || null;
  const rawPath = getTag('path') || name;
  let cleanFolder = rawPath
    .replace(/^~[\/\\]+(\.\.[\/\\]+)?/g, '')
    .replace(/^roms[\/\\]+/i, '')
    .replace(/^\.[\/\\]+/, '')
    .replace(/[\/\\]+$/, '');
  if (name.toLowerCase() === 'windows') cleanFolder = 'windows';
  const folder = cleanFolder || name.toLowerCase();
  const theme = getTag('theme') || name;
  const platform = getTag('platform') || name;

  // Extensions
  const extString = getTag('extension') || '';
  const extensions = extString
    .split(/\s+/)
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
    .map(e => (e.startsWith('.') ? e : '.' + e));

  // Emulators
  const emulators = [];
  let defaultEmu = null;

  const emuBlockMatch = block.match(/<emulators>([\s\S]*?)<\/emulators>/);
  if (emuBlockMatch) {
    const emuRegex = /<emulator\s+name="([^"]+)"([\s\S]*?)(?:<\/emulator>|\/>)/g;
    let emuMatch;
    while ((emuMatch = emuRegex.exec(emuBlockMatch[1])) !== null) {
      const emuName = emuMatch[1];
      const coreBlock = emuMatch[2] || '';
      const cores = [...coreBlock.matchAll(/<core(?:\s+default="true")?>([^<]+)<\/core>/g)].map(c => c[1]);

      if (!defaultEmu) {
        defaultEmu = {
          name: emuName,
          core: cores[0] || null
        };
      }

      emulators.push({
        name: emuName,
        cores
      });
    }
  }

  if (!defaultEmu && emulators.length > 0) {
    defaultEmu = { name: emulators[0].name, core: emulators[0].cores[0] || null };
  }

  // Bios info
  const biosInfo = BIOS_MAP[name.toLowerCase()] || {
    required: false,
    files: [],
    notes: null
  };

  // Custom RIESCADE systems
  const customRiescadeNames = ['arcadedumps', 'pgm3viper', 'arcadews', 'recomp', 'recomps', 'xboxlivearcade', 'pinballfx3'];
  const isCustomRiescade = customRiescadeNames.includes(name.toLowerCase());

  // Robust Logo Resolution
  const logo = resolveLogo(name, folder, theme, platform);
  const imgMeta = platformImages[name] || platformImages[folder] || {};
  const systemImg = imgMeta.system || null;

  const summary = summaries[name] || summaries[name.toLowerCase()] || summaries[folder] || `Configurações, pasta de ROMs e instruções de instalação para ${fullname} no RIESCADE.`;

  const systemObj = {
    id: name,
    slug: name.toLowerCase(),
    name: fullname,
    fullname,
    manufacturer,
    hardware,
    release,
    folder,
    folderPath: `roms\\${folder}\\`,
    extensions,
    recommendedFormat: '',
    biosRequired: biosInfo.required,
    biosFiles: biosInfo.files,
    biosNotes: biosInfo.notes,
    defaultEmulator: defaultEmu,
    emulators,
    platform,
    theme,
    isCustomRiescade,
    summary,
    logo,
    image: systemImg,
    notes: [],
    instructions: [],
    sections: []
  };

  systemObj.recommendedFormat = getRecommendedFormat(systemObj);
  systemObj.notes = getSpecialNotes(systemObj);
  systemObj.instructions = getInstructions(systemObj);
  systemObj.sections = getDetailedSections(systemObj);

  if (!parsedSystems.some(s => s.id === name)) {
    parsedSystems.push(systemObj);
  }
}

// Sort: custom RIESCADE first, then alphabetical by name
parsedSystems.sort((a, b) => {
  if (a.isCustomRiescade && !b.isCustomRiescade) return -1;
  if (!a.isCustomRiescade && b.isCustomRiescade) return 1;
  return a.name.localeCompare(b.name, 'pt-BR');
});

// Stats check
const withLogo = parsedSystems.filter(s => s.logo !== null).length;
const withSections = parsedSystems.filter(s => s.sections && s.sections.length > 0).length;
console.log(`Writing ${parsedSystems.length} systems to ${OUTPUT_PATH}...`);
console.log(`Systems with logo: ${withLogo}/${parsedSystems.length}`);
console.log(`Systems with rich sections: ${withSections}/${parsedSystems.length}`);

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsedSystems, null, 2), 'utf8');
console.log('Finished successfully!');
