const fs = require('fs');
const path = require('path');

const ES_SYSTEMS_PATH = 'D:/Downloads/tmp/RIESCADE/tmp/RIESCADE_RETROBAT/emulationstation/.emulationstation/es_systems.cfg';
const PLATFORMS_IMAGES_PATH = path.join(__dirname, '../src/data/platform-images.json');
const OUTPUT_PATH = path.join(__dirname, '../src/data/wiki-systems.json');

// Read es_systems.cfg
const rawEsXml = fs.readFileSync(ES_SYSTEMS_PATH, 'utf8');

// Read platform images
let platformImages = {};
try {
  platformImages = JSON.parse(fs.readFileSync(PLATFORMS_IMAGES_PATH, 'utf8'));
} catch (e) {
  console.warn('Could not read platform-images.json', e.message);
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
    files: ['scph5501.bin', 'scph5502.bin', 'scph5500.bin'],
    notes: 'Coloque na pasta bios/. Essencial para compatibilidade máxima com DuckStation e SwanStation.',
  },
  ps2: {
    required: true,
    files: ['SCPH-70004.bin (ou qualquer BIOS SCPH-3xxxx a 9xxxx)'],
    notes: 'Coloque na pasta bios/ ou bios/pcsx2/bios/. Necessário para rodar o PCSX2.',
  },
  ps3: {
    required: true,
    files: ['PS3UPDAT.PUP (Firmware oficial da Sony)'],
    notes: 'Instalado dentro do emulador RPCS3 (File -> Install Firmware) ou via pacote automático de BIOS da RIESCADE.',
  },
  psp: {
    required: false,
    files: [],
    notes: 'PPSSPP tem HLE BIOS embutida, roda direto sem arquivos adicionais.',
  },
  psvita: {
    required: true,
    files: ['PSP2UPDAT.PUP (Firmware Vita)'],
    notes: 'Necessário para o emulador Vita3K.',
  },
  saturn: {
    required: true,
    files: ['sega_101.bin (Japão)', 'mpr-17933.bin (EUA/Europa)'],
    notes: 'Coloque na pasta bios/. Necessário para Mednafen / Beetle Saturn e Kronos.',
  },
  dreamcast: {
    required: true,
    files: ['dc_boot.bin', 'dc_flash.bin'],
    notes: 'Coloque dentro de bios/dc/. Necessário para Flycast e Redream.',
  },
  segacd: {
    required: true,
    files: ['bios_CD_U.bin', 'bios_CD_E.bin', 'bios_CD_J.bin'],
    notes: 'Coloque na pasta bios/. Essencial para Genesis Plus GX.',
  },
  megacd: {
    required: true,
    files: ['bios_CD_U.bin', 'bios_CD_E.bin', 'bios_CD_J.bin'],
    notes: 'Coloque na pasta bios/. Essencial para rodar discos de Sega CD.',
  },
  sega32x: {
    required: false,
    files: ['32X_G_BIOS.BIN', '32X_M_BIOS.BIN', '32X_S_BIOS.BIN'],
    notes: 'Opcional para Picodrive, recomendado para emulação com precisão máxima.',
  },
  switch: {
    required: true,
    files: ['prod.keys', 'title.keys', 'Firmware oficial'],
    notes: 'Coloque em bios/switch/keys/ e instale o firmware no emulador Ryujinx/Citron.',
  },
  wiiu: {
    required: false,
    files: ['otp.bin', 'seeprom.bin'],
    notes: 'Cemu roda a maioria dos jogos em formato RPX ou WUA sem dump de console.',
  },
  wii: {
    required: false,
    files: [],
    notes: 'Dolphin emula o sistema operacional do Wii internamente.',
  },
  gamecube: {
    required: false,
    files: [],
    notes: 'Dolphin roda jogos de GameCube direto sem BIOS obrigatória.',
  },
  n64: {
    required: false,
    files: [],
    notes: 'A maioria dos cores roda sem BIOS. Somente 64DD precisa de BIOS específica.',
  },
  n64dd: {
    required: true,
    files: ['64DD_IPL_US.bin', '64DD_IPL_JP.bin'],
    notes: 'Coloque na pasta bios/.',
  },
  gba: {
    required: false,
    files: ['gba_bios.bin'],
    notes: 'Opcional na maioria dos emuladores (mGBA usa emulação de BIOS por padrão).',
  },
  nds: {
    required: false,
    files: ['bios7.bin', 'bios9.bin', 'firmware.bin'],
    notes: 'MeloDS e DeSmuME rodam sem BIOS, mas usar BIOS original melhora fidelidade e áudio.',
  },
  '3ds': {
    required: false,
    files: ['aes_keys.txt (se roms forem criptografadas)'],
    notes: 'Utilize ROMs descriptografadas (.cci ou .3ds) para rodar direto sem chaves.',
  },
  neogeo: {
    required: true,
    files: ['neogeo.zip'],
    notes: 'Coloque o neogeo.zip junto com a rom na pasta roms/neogeo/ ou em bios/.',
  },
  neogeocd: {
    required: true,
    files: ['neocd.bin', 'neocd.zip'],
    notes: 'Coloque na pasta bios/ ou bios/neocd/.',
  },
  atomiswave: {
    required: true,
    files: ['awbios.zip'],
    notes: 'Coloque na pasta bios/ ou junto da rom.',
  },
  naomi: {
    required: true,
    files: ['naomi.zip', 'naomi_boot.bin'],
    notes: 'Coloque na pasta bios/ ou bios/dc/.',
  },
  naomi2: {
    required: true,
    files: ['naomi2.zip'],
    notes: 'Coloque na pasta bios/ ou bios/dc/.',
  },
  hikaru: {
    required: true,
    files: ['hikaru.zip'],
    notes: 'Coloque na pasta bios/.',
  },
  chihiro: {
    required: true,
    files: ['chihiro.zip'],
    notes: 'Coloque na pasta bios/chihiro/.',
  },
  triforce: {
    required: true,
    files: ['triforce.zip'],
    notes: 'Coloque na pasta bios/triforce/.',
  },
  model2: {
    required: false,
    files: [],
    notes: 'Emulador Model 2 Emulator já inclui arquivos internos de inicialização.',
  },
  model3: {
    required: false,
    files: [],
    notes: 'Supermodel já possui HLE das placas Sega Model 3.',
  },
  arcade: {
    required: true,
    files: ['neogeo.zip', 'pgm.zip', 'qsound_hle.zip', 'decocass.zip'],
    notes: 'MAME e FBNeo utilizam arquivos BIOS/Driver em formato .zip dentro de roms/arcade ou bios/.',
  },
  mame: {
    required: true,
    files: ['Arquivos de BIOS do ROMset MAME (ex: neogeo.zip, qsound.zip)'],
    notes: 'Mantenha na pasta roms/mame ou bios/.',
  },
  fbneo: {
    required: true,
    files: ['Arquivos de BIOS do ROMset FBNeo'],
    notes: 'Mantenha na pasta roms/fbneo ou bios/.',
  },
  pcenginecd: {
    required: true,
    files: ['syscard3.pce'],
    notes: 'Coloque na pasta bios/. Obrigatório para jogos de TurboGrafx-CD / PC Engine CD.',
  },
  pcfx: {
    required: true,
    files: ['pcfx.rom'],
    notes: 'Coloque na pasta bios/.',
  },
  '3do': {
    required: true,
    files: ['panafz10.bin', 'goldstar.bin'],
    notes: 'Coloque na pasta bios/.',
  },
  amiga500: {
    required: true,
    files: ['kick34005.A500 (Kickstart 1.3)'],
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
    notes: 'Opcional, mas melhora compatibilidade.',
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
    files: ['disksys.rom'],
    notes: 'Coloque na pasta bios/. Obrigatório para rodar jogos do Famicom Disk System.',
  },
  msx1: {
    required: false,
    files: [],
    notes: 'Cores de MSX incluem BIOS aberta C-BIOS. Jogos comerciais podem exigir BIOS oficial.',
  },
  msx2: {
    required: false,
    files: [],
    notes: 'C-BIOS inclusa. Dumps reais exigem MSX2.ROM e MSX2EXT.ROM na pasta bios/.',
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
    notes: 'Projetos recompilados nativos de PC (N64 Recomp, etc.). Executam direto no Windows.',
  },
  recomps: {
    required: false,
    files: [],
    notes: 'Projetos recompilados nativos de PC (N64 Recomp, etc.). Executam direto no Windows.',
  },
  pinballfx3: {
    required: false,
    files: [],
    notes: 'Configurado para carregar tabelas do Pinball FX3 via Steam ou standalone.',
  },
};

// Recommended format per hardware/system
function getRecommendedFormat(system) {
  const name = system.name.toLowerCase();
  const discSystems = ['psx', 'ps2', 'saturn', 'dreamcast', 'megacd', 'segacd', '3do', 'pcenginecd', 'pcfx', 'amigacd32'];
  if (name === 'arcadedumps') return '.game ou .bat (acompanhado da pasta de dump do jogo)';
  if (name === 'pgm3viper') return '.game (arquivo apontando para o identificador do jogo Viper/PGM3)';
  if (name === 'arcadews') return '.zip ou .7z (romset Arcade com patch Widescreen 16:9)';
  if (name === 'xboxlivearcade') return '.iso ou .m3u';
  if (name === 'recomp' || name === 'recomps') return '.game';
  if (name === 'switch') return '.nsp ou .xci';
  if (name === 'wiiu') return '.wua (formato compactado único) ou pasta extraída com .rpx';
  if (name === 'wii') return '.wbfs ou .rvz (RVZ é altamente recomendado por economia de espaço)';
  if (name === 'gamecube') return '.rvz (melhor formato para Dolphin com redução de até 60% do tamanho)';
  if (name === '3ds') return '.cci ou .3ds descriptografado';
  if (name === 'nds') return '.nds';
  if (name === 'psp') return '.cso ou .chd (economizam espaço) ou .iso';
  if (name === 'ps3') return 'Pasta do jogo com PS3_GAME (formato JB Folder) ou .pkg com licença .rap';
  if (discSystems.includes(name)) return '.chd (reduz em até 60% o tamanho da ISO/BIN mantendo áudio perfeito)';
  if (name.includes('arcade') || name === 'mame' || name === 'fbneo' || name === 'neogeo') return '.zip (ROMset não extraído)';
  return system.extensions[0] || '.zip';
}

// Special instructions and notes per system
function getSpecialNotes(system) {
  const notes = [];
  const name = system.name.toLowerCase();

  if (name === 'arcadedumps') {
    notes.push('Sistema exclusivo do RIESCADE para dumps de placas arcade modernas baseadas em PC (ex: Halo Fireteam Raven, Mario Kart Arcade GP DX, Star Wars Battle Pod).');
    notes.push('Estrutura de arquivos: coloque o script .bat ou arquivo .game na raiz de \\roms\\arcadedumps\\ e a pasta com os dados do jogo ao lado.');
    notes.push('O executável halo-loader64.exe e as bibliotecas do LinuxLoader ficam em \\emulators\\linuxloader-rawthrills\\.');
  } else if (name === 'pgm3viper') {
    notes.push('Sistema dedicado aos jogos da placa arcade IGS PGM3 e Konami Viper (ex: Boxing Mania, Knights of Valour 3 HD, GTI Club, Silent Scope EX).');
    notes.push('O emulador Kitsune foi integrado exclusivamente no emulatorLauncher do RIESCADE para carregar as roms via arquivos .game.');
    notes.push('O arquivo .game deve conter apenas a linha identificadora (ex: konami-viper.boxingm).');
  } else if (name === 'arcadews') {
    notes.push('Seleção exclusiva de jogos de Arcade modificados para proporção Widescreen 16:9 (sem esticar a imagem, ampliando a visão horizontal de tela).');
    notes.push('Utiliza cores especiais do FBNeo (fbneo_arcadews, fbneo_cps2_wide, fbneo_sf3tag, fbneo_sfa2, fbneo_ssf2t, fbneo_xmvsf3v3).');
  } else if (name === 'xboxlivearcade') {
    notes.push('ATENÇÃO PARA O NOME DA PASTA: os jogos devem ser colocados em \\roms\\xbla\\ (pasta abreviada), e não xboxlivearcade.');
    notes.push('Emulado com alta fidelidade pelo Xenia Canary.');
  } else if (name === 'recomp' || name === 'recomps') {
    notes.push('Projetos de recompilação estática de clássicos (como Zelda 64 Recompiled, Perfect Dark, etc.) executados nativamente no Windows.');
    notes.push('Oferece suporte a 60+ FPS sem travas, taxa de atualização variável, widescreen ultra-wide nativo e suporte completo a controles modernos.');
  } else if (['psx', 'saturn', 'dreamcast', 'megacd', 'pcenginecd', '3do'].includes(name)) {
    notes.push('Formato recomendado: CHD (.chd). Converte múltiplos .bin/.cue em um único arquivo compactado sem perda de qualidade de áudio.');
    notes.push('Jogos multidisco (CD 1, CD 2, etc.): crie um arquivo .m3u com o nome do jogo listando cada disco em uma linha para salvar o progresso unificado.');
  } else if (name === 'ps2') {
    notes.push('Formato recomendado: .chd ou .iso. O formato CHD economiza dezenas de gigabytes na sua coleção mantendo compatibilidade perfeita no PCSX2.');
    notes.push('Para jogos em DVD9 (dupla camada) ou com mais de 4 GB, o formato CHD roda direto e sem fragmentação.');
  } else if (name === 'wii' || name === 'gamecube') {
    notes.push('Formato recomendado: RVZ (.rvz). Reduz o tamanho da ISO descartando lixo e ruído de compressão do disco, mantendo hash 1:1 ao descompactar.');
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
  const name = system.fullname;
  const recommended = getRecommendedFormat(system);

  if (system.name === 'arcadedumps') {
    return [
      `Abra o diretório onde o RIESCADE está instalado no seu computador.`,
      `Navegue até a pasta: roms\\arcadedumps\\`,
      `Copie a pasta de dados do jogo arcade (ex: halo-fireteam-raven) para dentro de roms\\arcadedumps\\.`,
      `Certifique-se de que o arquivo disparador correspondente (.bat ou .game) esteja na raiz de roms\\arcadedumps\\.`,
      `Abra o RIESCADE e pressione F5 ou acesse Menu Principal → Atualizar Lista de Jogos. O jogo aparecerá com capa e informações prontas para jogar!`
    ];
  }

  if (system.name === 'pgm3viper') {
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
  const pathVal = getTag('path');
  const extensionVal = getTag('extension');
  const platform = getTag('platform');
  const theme = getTag('theme');

  // Extract folder name from path (e.g. ~\..\roms\xbla -> xbla)
  const folder = pathVal.split(/[\/\\]/).pop() || name;

  // Extensions clean array
  const rawExts = extensionVal.split(/\s+/).filter(Boolean);
  // Lowercase unique extensions
  const extensions = [...new Set(rawExts.map(e => e.toLowerCase()))];

  // Parse emulators
  const emuBlockMatch = block.match(/<emulators>([\s\S]*?)<\/emulators>/);
  const emulators = [];
  let defaultEmu = null;

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
  const biosInfo = BIOS_MAP[name] || {
    required: false,
    files: [],
    notes: null
  };

  // Custom RIESCADE systems
  const customRiescadeNames = ['arcadedumps', 'pgm3viper', 'arcadews', 'recomp', 'recomps', 'xboxlivearcade', 'pinballfx3'];
  const isCustomRiescade = customRiescadeNames.includes(name);

  // Logo & Image
  const imgMeta = platformImages[name] || platformImages[folder] || {};
  let logo = imgMeta.logo || null;
  let systemImg = imgMeta.system || null;

  // Fallback logos for custom systems
  if (!logo && name === 'pgm3viper') logo = '/images/platforms/logos/pgm3viper.webp';
  if (!logo && name === 'arcadews') logo = '/images/platforms/logos/arcadews.webp';
  if (!logo && name === 'arcadedumps') logo = '/images/platforms/logos/arcadedumps.webp';

  const summary = summaries[name] || summaries[folder] || `Configurações, pasta de ROMs e instruções de instalação para ${fullname} no RIESCADE.`;

  const systemObj = {
    id: name,
    slug: name,
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
    instructions: []
  };

  systemObj.recommendedFormat = getRecommendedFormat(systemObj);
  systemObj.notes = getSpecialNotes(systemObj);
  systemObj.instructions = getInstructions(systemObj);

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

console.log(`Writing ${parsedSystems.length} systems to ${OUTPUT_PATH}...`);
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsedSystems, null, 2), 'utf8');
console.log('Finished successfully!');
