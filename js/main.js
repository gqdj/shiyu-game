/* =========================================================================
   尸语 · 七魔逐道   —— 第一关原型（洪流之主）
   Phaser 3 · 单文件实现
   ========================================================================= */
const W = 1280, H = 720;
const GROUND_Y = 600;
const WORLD_W = 4200;
const ARENA_L = 3300, ARENA_R = 4100;

/* ---------------- 武器配置 ---------------- */
const LEVELS = [
  {
    id: 1,
    title: '第一关 · 洪流之逐',
    bg: 'bg_cave',
    goal: '前往龙树大师的洞府',
    bossGoal: '击败洪流之主',
    enemy: { tex: 'spr_zombie', hp: 40, speed: 72, touch: 8, scale: 0.82, label: '起尸' },
    boss: { tex: 'boss1', name: '第一魔 · 洪流之主', sub: '七兄弟之末　化河为兵', hp: 600 },
    tint: 0x3aa6d8,
  },
  {
    id: 2,
    title: '第二关 · 獭影之森',
    bg: 'bg_forest',
    goal: '穿过雪林，寻灵獭巢穴',
    bossGoal: '击败灵獭猎手',
    enemy: { tex: 'spr_otter', hp: 34, speed: 168, touch: 10, scale: 0.62, label: '灵獭' },
    boss: { tex: 'boss2', name: '第二魔 · 灵獭猎手', sub: '七兄弟之次　驭水而行', hp: 780 },
    tint: 0x6fd3a8,
  },
];

const WEAPONS = [
  { id: 'knife',  name: '藏刀',   type: 'melee',  dmg: 14, cd: 320, range: 205, kb: 260, color: 0xffe6a8, arc: 1.0 },
  { id: 'vajra',  name: '金刚杵', type: 'melee',  dmg: 28, cd: 640, range: 215, kb: 300, color: 0xffc857, arc: 1.25 },
  { id: 'beads',  name: '念珠',   type: 'orb',    dmg: 11, cd: 480, speed: 560, color: 0x9be7ff },
  { id: 'musket', name: '火绳枪', type: 'bullet', dmg: 36, cd: 900, speed: 1250, color: 0xffd166 },
];

/* =========================================================================
   Boot：加载图片 + 程序生成矢量贴图
   ========================================================================= */
if (window.__log) window.__log('main.js loaded');

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.load.image('bg_new',    'assets/bg_new.jpg');
    this.load.image('bg_temple2', 'assets/bg_temple2.jpg');
    this.load.image('bg_cave', 'assets/bg_cave.jpg');
    this.load.image('reward_l1', 'assets/reward_l1.png');
    this.load.image('bg_forest', 'assets/bg_forest.jpg');
    this.load.image('boss2', 'assets/boss2.webp');
    this.load.image('spr_otter', 'assets/spr_otter.png');
    this.load.image('spr_hero',  'assets/spr_hero.png');
    this.load.image('spr_hero_run', 'assets/spr_hero_run.png');
    this.load.image('spr_run',  'assets/spr_run.png');
    this.load.image('spr_atk',  'assets/spr_atk.png');
    this.load.image('spr_jump', 'assets/spr_jump.png');
    for (let i = 0; i < 8; i++) this.load.image('spr_walk' + i, 'assets/spr_walk' + i + '.png');
    this.load.image('spr_idle', 'assets/spr_idle.png');
    this.load.image('spr_atk2', 'assets/spr_atk2.png');
    this.load.image('spr_jump2', 'assets/spr_jump2.png');
    this.load.image('spr_zombie','assets/spr_zombie.png');
    this.load.image('spr_ghost', 'assets/spr_ghost.png');
    this.load.image('boss1',   'assets/boss1.webp');
  }

  create() {
    this.makeFx();
    this.scene.start('Game');
  }

  /* ---- 主角：藏袍少年（矢量） ---- */
  makeHero() {
    const draw = (g, legs, lean, armOut) => {
      g.clear();
      const x = lean;

      // 腿
      g.fillStyle(0x101820, 1);
      if (legs === 0) { g.fillRect(20, 62, 9, 20); g.fillRect(31, 62, 9, 20); }
      else if (legs === 1) { g.fillRect(13, 62, 9, 20); g.fillRect(35, 60, 9, 22); }
      else { g.fillRect(24, 62, 9, 18); g.fillRect(33, 64, 9, 18); }
      // 靴
      g.fillStyle(0x0a0f16, 1);
      g.fillRect(13, 80, 11, 4); g.fillRect(35, 80, 11, 4);

      // 袍身：暗→中→亮三层
      g.fillStyle(0x142434, 1);
      g.beginPath();
      g.moveTo(14 + x, 26); g.lineTo(46 + x, 26);
      g.lineTo(50 + x, 68); g.lineTo(10 + x, 68); g.closePath(); g.fillPath();

      g.fillStyle(0x22415f, 1);
      g.beginPath();
      g.moveTo(17 + x, 27); g.lineTo(43 + x, 27);
      g.lineTo(46 + x, 66); g.lineTo(14 + x, 66); g.closePath(); g.fillPath();

      // 受光面
      g.fillStyle(0x335f85, 1);
      g.beginPath();
      g.moveTo(17 + x, 27); g.lineTo(26 + x, 27);
      g.lineTo(24 + x, 66); g.lineTo(14 + x, 66); g.closePath(); g.fillPath();

      // 袍摆开衩
      g.fillStyle(0x0e1a26, 1);
      g.beginPath();
      g.moveTo(29 + x, 52); g.lineTo(33 + x, 52);
      g.lineTo(36 + x, 72); g.lineTo(26 + x, 72); g.closePath(); g.fillPath();

      // 白色斜襟
      g.fillStyle(0xe9e2d0, 1);
      g.beginPath();
      g.moveTo(28 + x, 27); g.lineTo(40 + x, 27);
      g.lineTo(33 + x, 50); g.lineTo(26 + x, 50); g.closePath(); g.fillPath();
      g.fillStyle(0xc9c2b0, 1);
      g.beginPath();
      g.moveTo(32 + x, 27); g.lineTo(40 + x, 27);
      g.lineTo(33 + x, 50); g.lineTo(30 + x, 50); g.closePath(); g.fillPath();

      // 金腰带 + 扣
      g.fillStyle(0xc9a227, 1); g.fillRect(12 + x, 50, 40, 4);
      g.fillStyle(0xf0d878, 1); g.fillRect(27 + x, 49, 8, 6);

      // 肩甲
      g.fillStyle(0x1b2f45, 1);
      g.fillCircle(17 + x, 30, 8);
      g.fillStyle(0x2b4a68, 1);
      g.fillCircle(17 + x, 29, 5);

      // 手臂
      g.fillStyle(0x22415f, 1);
      g.fillRect(armOut ? 43 + x : 40 + x, 32, 8, 20);
      g.fillStyle(0xe8c9a0, 1);
      g.fillRect(armOut ? 43 + x : 40 + x, 50, 8, 5);

      // 头
      g.fillStyle(0xe8c9a0, 1); g.fillCircle(30 + x, 18, 9);
      g.fillStyle(0xd9b58a, 1);
      g.beginPath(); g.arc(30 + x, 18, 9, 0.2, Math.PI - 0.2, false); g.fillPath();

      // 头发
      g.fillStyle(0x14161c, 1);
      g.beginPath(); g.arc(30 + x, 16, 10, Math.PI, 0, false); g.fillPath();
      g.fillRect(19 + x, 13, 5, 13);
      g.fillRect(36 + x, 13, 5, 13);
      g.fillStyle(0x2a2f3a, 1);
      g.fillRect(21 + x, 8, 18, 3);

      // 眼
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(26 + x, 18, 3, 2);
      g.fillRect(33 + x, 18, 3, 2);

      // 兵器（刀）
      if (armOut) {
        g.fillStyle(0xdfe6ef, 1); g.fillRect(52 + x, 16, 3, 30);
        g.fillStyle(0xb9c4d1, 1); g.fillRect(52 + x, 30, 3, 16);
        g.fillStyle(0xc9a227, 1); g.fillRect(49 + x, 24, 9, 3);
      } else {
        g.fillStyle(0xdfe6ef, 1); g.fillRect(46 + x, 40, 3, 22);
        g.fillStyle(0xc9a227, 1); g.fillRect(43 + x, 38, 9, 3);
      }
    };

    const g = this.make.graphics({ x: 0, y: 0, add: false });
    draw(g, 0, 0, false);  g.generateTexture('hero_idle', 68, 86);
    draw(g, 1, 1, false);  g.generateTexture('hero_run1', 68, 86);
    draw(g, 2, -1, false); g.generateTexture('hero_run2', 68, 86);
    draw(g, 2, 3, true);   g.generateTexture('hero_atk',  68, 86);
    g.destroy();
  }

  /* ---- 起尸：藏袍尸傀 ---- */
  makeZombie() {
    const draw = (g, phase) => {
      g.clear();
      // 腿
      g.fillStyle(0x1a1510, 1);
      g.fillRect(16, 54, 8, 16); g.fillRect(28, 54, 8, 16);
      // 袍（暗棕，下摆撕裂）
      g.fillStyle(0x4a3a28, 1);
      g.beginPath();
      g.moveTo(12, 24); g.lineTo(40, 24); g.lineTo(44, 58); g.lineTo(8, 58);
      g.closePath(); g.fillPath();
      g.fillStyle(0x5d4a34, 1);
      g.beginPath();
      g.moveTo(16, 25); g.lineTo(36, 25); g.lineTo(39, 56); g.lineTo(13, 56);
      g.closePath(); g.fillPath();
      // 撕裂下摆
      g.fillStyle(0x0e0c08, 1);
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        g.moveTo(9 + i * 6, 58); g.lineTo(12 + i * 6, 66); g.lineTo(15 + i * 6, 58);
        g.closePath(); g.fillPath();
      }
      // 破布条
      g.fillStyle(0x6b563c, 0.9);
      g.fillRect(14, 30, 4, 18); g.fillRect(36, 34, 2, 14);
      // 手（灰白）
      g.fillStyle(0xc9c1b2, 1);
      g.fillRect(phase ? 2 : 38, 30, 6, 20);
      g.fillStyle(0xa89f8f, 1);
      g.fillRect(phase ? 2 : 38, 46, 6, 4);
      // 头
      g.fillStyle(0xe4dccb, 1); g.fillCircle(26, 16, 9);
      g.fillStyle(0xc9c0ae, 1);
      g.beginPath(); g.arc(26, 16, 9, 0.3, Math.PI - 0.1, false); g.fillPath();
      // 眼窝
      g.fillStyle(0x0a0a0a, 1);
      g.fillCircle(22, 15, 2.6); g.fillCircle(30, 15, 2.6);
      g.fillStyle(0xc03030, 0.9);
      g.fillCircle(22, 15, 1.1); g.fillCircle(30, 15, 1.1);
      // 嘴
      g.fillStyle(0x7a2020, 1); g.fillRect(24, 21, 5, 2.4);
      // 乱发
      g.fillStyle(0x12100c, 1);
      g.fillRect(16, 6, 21, 5);
      g.fillRect(14, 8, 3, 10); g.fillRect(37, 8, 3, 10);
    };
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    draw(g, 0); g.generateTexture('zombie1', 54, 70);
    draw(g, 1); g.generateTexture('zombie2', 54, 70);
    g.destroy();
  }

  /* ---- 中阴身：黑烟幽灵 ---- */
  makeGhost() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // 外层烟
    g.fillStyle(0x141c28, 0.55); g.fillCircle(32, 30, 26);
    g.fillStyle(0x1d2836, 0.75); g.fillCircle(32, 28, 20);
    // 内层
    g.fillStyle(0x2a3a4e, 0.9); g.fillCircle(32, 27, 14);
    // 幽光
    g.fillStyle(0x6b4fa8, 0.55); g.fillCircle(32, 26, 9);
    // 眼
    g.fillStyle(0xd8c8ff, 1);
    g.fillCircle(26, 24, 3); g.fillCircle(38, 24, 3);
    g.fillStyle(0x120e1a, 1);
    g.fillCircle(26, 24, 1.5); g.fillCircle(38, 24, 1.5);
    // 拖尾（三层递减）
    g.fillStyle(0x141c28, 0.5);
    g.beginPath(); g.moveTo(16, 44); g.lineTo(48, 44); g.lineTo(32, 62); g.closePath(); g.fillPath();
    g.fillStyle(0x1d2836, 0.35);
    g.beginPath(); g.moveTo(22, 44); g.lineTo(42, 44); g.lineTo(32, 70); g.closePath(); g.fillPath();
    g.generateTexture('ghost', 64, 72);
    g.destroy();
  }

  /* ---- 特效贴图 ---- */
  makeFx() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // 刀光
    g.lineStyle(7, 0xffffff, 1);
    g.beginPath(); g.arc(60, 60, 46, -0.9, 0.9, false); g.strokePath();
    g.generateTexture('fx_slash', 120, 120);
    g.clear();

    // 粒子方块
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 6, 6);
    g.generateTexture('fx_px', 6, 6);
    g.clear();

    // 水柱：分层渐变 + 顶部水花
    for (let i = 0; i < 6; i++) {
      const w = 64 - i * 8;
      g.fillStyle(0x3aa6d8, 0.10 + i * 0.05);
      g.fillRect((64 - w) / 2, 0, w, 300);
    }
    g.fillStyle(0x9be7ff, 0.55); g.fillRect(26, 0, 12, 300);
    g.fillStyle(0xffffff, 0.65); g.fillRect(30, 0, 4, 300);
    g.fillStyle(0xbfeaff, 0.9);
    g.fillCircle(18, 14, 10); g.fillCircle(46, 22, 8); g.fillCircle(32, 6, 9);
    g.generateTexture('fx_column', 64, 300);
    g.clear();

    // 巨浪：半透明水墙 + 浪尖泡沫
    g.fillStyle(0x1f6f96, 0.55);
    g.beginPath();
    g.moveTo(0, 150); g.lineTo(30, 60); g.lineTo(80, 96); g.lineTo(130, 40);
    g.lineTo(190, 96); g.lineTo(240, 70); g.lineTo(240, 150); g.closePath(); g.fillPath();
    g.fillStyle(0x3aa6d8, 0.45);
    g.beginPath();
    g.moveTo(0, 150); g.lineTo(20, 90); g.lineTo(70, 120); g.lineTo(120, 66);
    g.lineTo(180, 118); g.lineTo(240, 96); g.lineTo(240, 150); g.closePath(); g.fillPath();
    g.fillStyle(0xe8f7ff, 0.85);
    g.fillCircle(30, 62, 12); g.fillCircle(130, 42, 14); g.fillCircle(240, 72, 12);
    g.fillCircle(80, 96, 9); g.fillCircle(190, 96, 9);
    g.generateTexture('fx_wave', 240, 150);
    g.clear();

    // 念珠
    g.fillStyle(0x0d1a26, 1); g.fillCircle(10, 10, 10);
    g.fillStyle(0x9be7ff, 1); g.fillCircle(10, 10, 6);
    g.fillStyle(0xffffff, 1); g.fillCircle(10, 10, 3);
    g.generateTexture('fx_orb', 20, 20);
    g.clear();

    // 子弹
    g.fillStyle(0xffd166, 1); g.fillCircle(8, 6, 6);
    g.fillStyle(0xfff3c4, 1); g.fillCircle(8, 6, 3);
    g.generateTexture('fx_bullet', 16, 12);
    g.clear();

    // 柔光圆（同心圆叠加模拟渐变）
    g.clear();
    for (let i = 12; i >= 1; i--) {
      const r = i * 16;
      g.fillStyle(0xffffff, 0.05 + (12 - i) * 0.012);
      g.fillCircle(200, 200, r);
    }
    g.generateTexture('fx_aura', 400, 400);
    g.clear();

    // 风刃：细长刀气（多边形，兼容 Phaser Graphics）
    g.clear();
    g.fillStyle(0x9be7ff, 0.95);
    g.beginPath();
    g.moveTo(0, 18); g.lineTo(34, 8); g.lineTo(74, 20);
    g.lineTo(74, 26); g.lineTo(34, 34); g.lineTo(0, 40);
    g.closePath(); g.fillPath();
    g.fillStyle(0xeafcff, 1);
    g.beginPath();
    g.moveTo(4, 22); g.lineTo(36, 15); g.lineTo(66, 23);
    g.lineTo(36, 27); g.lineTo(4, 32);
    g.closePath(); g.fillPath();
    g.generateTexture('fx_blade', 78, 46);
    g.clear();

    // 长剑（程序绘制，长度=攻击范围）
    g.clear();
    g.fillStyle(0x2a2f38, 1); g.fillRect(0, 10, 26, 6);          // 刀柄
    g.fillStyle(0xc9a227, 1); g.fillRect(24, 4, 6, 18);          // 护手
    g.fillStyle(0xdfe8f2, 1);                                    // 刀身
    g.beginPath();
    g.moveTo(30, 8); g.lineTo(126, 12); g.lineTo(126, 16); g.lineTo(30, 16);
    g.closePath(); g.fillPath();
    g.fillStyle(0xffffff, 0.85); g.fillRect(32, 9, 92, 3);       // 高光
    g.fillStyle(0x8fb6d8, 0.9); g.fillRect(30, 14, 96, 2);       // 刃口冷光
    g.generateTexture('sword', 130, 26);
    g.clear();

    // 预警圈
    g.lineStyle(4, 0xff5a5a, 0.9); g.strokeCircle(40, 40, 34);
    g.generateTexture('fx_warn', 80, 80);
    g.destroy();
  }
}

/* =========================================================================
   主场景
   ========================================================================= */
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    // 支持 ?level=2 直接进入第二关（方便测试）
    let urlLevel = 1;
    try { urlLevel = parseInt(new URLSearchParams(location.search).get('level') || '1', 10) || 1; } catch (e) {}
    this.level = (data && data.level) || urlLevel;
  }

  create() {
    if (window.__log) window.__log('GameScene.create L=' + (this.level||1));
    this.level = this.level || 1;
    this.cfg = LEVELS[this.level - 1] || LEVELS[0];
    this.phase = 'play';
    this.wi = 0;                  // 当前武器索引
    this.lastAttack = 0;
    this.playerHP = 100;
    this.bossHP = this.cfg.boss.hp;
    this.bossMaxHP = this.cfg.boss.hp;
    this.bossActive = false;
    this.flags = { ghostWave: false, mixedWave: false };
    this.camL = 0;

    this.physics.world.setBounds(0, 0, WORLD_W, H);
    this.cameras.main.setBounds(0, 0, WORLD_W, H);

    this.buildBackground();
    this.buildGround();
    this.buildPlayer();
    this.buildGroups();
    this.buildWaves();
    this.buildHUD();
    this.dbgblade = this.add.text(20, 660, '', { fontFamily: 'monospace', fontSize: '15px', color: '#00ff88' }).setScrollFactor(0).setDepth(999);
    this.dbgblade = this.add.text(20, 690, '', { fontFamily: 'monospace', fontSize: '15px', color: '#00ff88' }).setScrollFactor(0).setDepth(999);


    this.buildSkills();
    this.buildTouch();
    this.buildKeys();
    let auto = false;
    try { auto = new URLSearchParams(location.search).get('auto') === '1'; } catch (e) {}
    if (auto) { this.phase = 'play'; } else { this.showTitle(); }

    // ?boss=1 直接到 Boss 战场（测试用）
    let toBoss = false;
    try { toBoss = new URLSearchParams(location.search).get('boss') === '1'; } catch (e) {}
    let toWin = false;
    try { toWin = new URLSearchParams(location.search).get('win') === '1'; } catch (e) {}
    if (toWin) { this.time.delayedCall(600, () => this.showWin()); }

    if (toBoss && this.player) {
      this.player.x = ARENA_L + 120;
      this.cameras.main.scrollX = ARENA_L - 200;
    }
  }

  /* ---------------- 背景视差 ---------------- */
  buildBackground() {
    this.sky = this.add.rectangle(0, 0, W, H, 0x060c16).setOrigin(0).setScrollFactor(0);

    // 远景：雪山佛窟（单张大图，按高度铺满）
    this.far = this.add.image(0, 0, this.cfg.bg).setOrigin(0).setScrollFactor(0)
      .setDisplaySize(W * 1.12, H * 1.12).setX(-W * 0.06).setY(-H * 0.06).setAlpha(0.96);
    // 中景：藏式牌楼


    // 佛光放射（从洞口位置）
    const rays = this.add.graphics().setScrollFactor(0).setDepth(1);
    for (let i = 0; i < 5; i++) {
      rays.fillStyle(0xffd88a, 0.035);
      rays.beginPath();
      rays.moveTo(W * 0.5, -40);
      rays.lineTo(W * 0.5 - 620 + i * 250, H);
      rays.lineTo(W * 0.5 - 500 + i * 250, H);
      rays.closePath(); rays.fillPath();
    }
    this.rays = rays;

    // 压暗（保证玩法可读）
    this.add.rectangle(0, 0, W, H, 0x05090f, 0.26).setOrigin(0).setScrollFactor(0).setDepth(2);
    // 雾
    this.fog = this.add.rectangle(0, H - 200, W, 200, 0x8fb6d8, 0.10).setOrigin(0).setScrollFactor(0);
    // 暗角
    const v = this.add.graphics().setScrollFactor(0).setDepth(900);
    v.fillStyle(0x000000, 0.55);
    v.fillRect(0, 0, W, 60); v.fillRect(0, H - 60, W, 60);
    v.fillRect(0, 0, 90, H); v.fillRect(W - 90, 0, 90, H);
  }

  buildGround() {
    // 地面（石阶感）
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x1a2230, 1); g.fillRect(0, GROUND_Y, WORLD_W, H - GROUND_Y);
    g.fillStyle(0x232f40, 1); g.fillRect(0, GROUND_Y, WORLD_W, 10);
    for (let x = 0; x < WORLD_W; x += 120) {
      g.fillStyle(0x1d2736, 1);
      g.fillRect(x + 4, GROUND_Y + 14, 108, 3);
    }
    // 雪
    g.fillStyle(0xdfe9f5, 0.85); g.fillRect(0, GROUND_Y - 4, WORLD_W, 5);

    // 地面碰撞体（静态组 + 刷新，最可靠）
    this.ground = this.physics.add.staticGroup();
    const gs = this.ground.create(WORLD_W / 2, GROUND_Y + 60, 'fx_px');
    gs.setVisible(false);
    gs.setDisplaySize(WORLD_W, 120);
    gs.refreshBody();

    // 浮空石台（可跳）
    this.plats = this.physics.add.staticGroup();
    [].forEach(([x, y]) => {
      const rock = this.add.graphics().setDepth(6);
      // 投影
      rock.fillStyle(0x05080e, 0.5); rock.fillRect(x - 88, y + 22, 176, 8);
      // 岩体（上亮下暗）
      rock.fillStyle(0x222e3d, 1); rock.fillRect(x - 90, y - 12, 180, 36);
      rock.fillStyle(0x2c3c50, 1); rock.fillRect(x - 90, y - 12, 180, 12);
      rock.fillStyle(0x141b26, 1); rock.fillRect(x - 90, y + 14, 180, 10);
      // 岩石棱角
      rock.fillStyle(0x35475e, 1);
      for (let k = 0; k < 5; k++) {
        const bx = x - 80 + k * 36;
        rock.beginPath();
        rock.moveTo(bx, y - 12); rock.lineTo(bx + 18, y - 12); rock.lineTo(bx + 9, y + 2);
        rock.closePath(); rock.fillPath();
      }
      // 积雪
      rock.fillStyle(0xe6effa, 0.95); rock.fillRect(x - 90, y - 15, 180, 6);
      const p = this.add.rectangle(x, y, 180, 22, 0x000000, 0).setDepth(6);
      this.physics.add.existing(p, true);
      this.plats.add(p);
      this.add.rectangle(x, y - 14, 178, 6, 0xdfe9f5, 0.75).setDepth(7);
    });
  }

  /* ---------------- 主角 ---------------- */
  buildPlayer() {
    this.player = this.physics.add.sprite(300, GROUND_Y - 120, 'spr_hero').setDepth(20).setScale(0.82);
    this.player.body.setSize(96, 236).setOffset(12, 2);
    this.player.setCollideWorldBounds(true);
    this.player.setDragX(1800);
    this.player.setMaxVelocity(420, 1100);

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.plats);

    this.cameras.main.startFollow(this.player, true, 0.12, 0);
    this.cameras.main.setDeadzone(240, 120);
    this.cameras.main.setZoom(1);

    // 脚下影子
    this.shadow = this.add.ellipse(0, 0, 62, 16, 0x000000, 0.38).setDepth(18);

    this.sword = this.add.image(0, 0, 'sword').setOrigin(0.18, 0.5).setDepth(21);
    this.swordBaseAngle = -18;

    // 光环（幻术灵光）
    this.aura = this.add.circle(this.player.x, this.player.y, 34, 0x6ec8ff, 0.10)
      .setDepth(19).setBlendMode(Phaser.BlendModes.ADD);
  }

  buildGroups() {
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.dangers = this.physics.add.group();

    this.physics.add.collider(this.enemies, this.ground);
    this.physics.add.collider(this.player, this.ground);

    this.physics.add.overlap(this.player, this.enemies, (p, e) => this.hurtPlayer((e.cfg && e.cfg.touch) || 14, e));
    this.physics.add.overlap(this.player, this.dangers, (p, d) => this.hurtPlayer(d.dmg || 12, null));
  }

  /* ---------------- 敌人生成 ---------------- */
  spawnZombie(x) {
    const E = this.cfg.enemy;
    const z = this.enemies.create(x, GROUND_Y - 40, E.tex).setDepth(19).setScale(E.scale);
    if (E.tex === 'spr_otter') z.body.setSize(120, 150).setOffset(40, 34);
    else z.body.setSize(64, 206).setOffset(7, 2);
    z.cfg = { hp: E.hp, speed: E.speed, touch: E.touch, type: 'zombie', melee: 1,
              fast: E.speed > 120 };
    z.hp = E.hp;
    z.spawnX = x;
    z.setCollideWorldBounds(true);
    z.body.setAllowGravity(false);
    z.y = GROUND_Y - z.displayHeight / 2;
    z.baseY = z.y;

    // 行走摇摆
    this.tweens.add({ targets: z, angle: 3, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    return z;
  }

  spawnGhost(x, y) {
    const g = this.enemies.create(x, y || GROUND_Y - 200, 'spr_ghost').setDepth(19).setScale(0.85);
    g.body.setAllowGravity(false);
    g.body.setSize(120, 220).setOffset(16, 8);
    g.cfg = { hp: 26, speed: 58, touch: 11, type: 'ghost', float: 1 };
    g.hp = 26;
    g.baseY = g.y;
    return g;
  }

  /* ---------------- 关卡编排 ---------------- */
  buildWaves() {
    const E = this.cfg.enemy;
    const xs = this.level === 2 ? [760, 940, 1160, 1380, 1620] : [980, 1180, 1420];
    xs.forEach((x, i) => {
      this.time.delayedCall(1200 + i * 750, () => this.spawnZombie(x));
    });
    this.toast(this.level === 2 ? '雪林 · 灵獭出没' : '河谷 · 第一重试炼：起尸');
  }

  /* ---------------- 魔法技能 ---------------- */
  buildSkills() {
    this.skills = [
      { name: '风刃', key: 'Q', cd: 1600, ready: 0, color: 0x9be7ff },
      { name: '冰封', key: 'E', cd: 8000, ready: 0, color: 0x7fd4ff },
      { name: '佛光', key: 'R', cd: 15000, ready: 0, color: 0xffd166 },
    ];
    this.skillUI = [];
    this.skills.forEach((sk, i) => {
      const x = W - 110, y = H - 300 + i * 86;
      const bg = this.add.circle(x, y, 34, 0x0b1220, 0.85).setScrollFactor(0).setDepth(860)
        .setStrokeStyle(3, sk.color, 0.9).setInteractive();
      const txt = this.add.text(x, y - 2, sk.name, {
        fontFamily: 'Microsoft YaHei', fontSize: '15px', color: '#e8f3ff'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(861);
      const key = this.add.text(x - 46, y + 2, sk.key, {
        fontFamily: 'Microsoft YaHei', fontSize: '15px', color: '#6a7a90'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(861);
      const mask = this.add.circle(x, y, 34, 0x000000, 0.65).setScrollFactor(0).setDepth(862);
      bg.on('pointerdown', () => this.castSkill(i));
      this.skillUI.push({ bg, txt, key, mask, x, y });
    });
    this.input.keyboard.on('keydown-Q', () => this.castSkill(0));
    this.input.keyboard.on('keydown-E', () => this.castSkill(1));
    this.input.keyboard.on('keydown-R', () => this.castSkill(2));
  }

  castSkill(i) {
    if (this.phase !== 'play' && this.phase !== 'boss') return;
    const sk = this.skills[i];
    const now = this.time.now;
    if (now < sk.ready) return;
    sk.ready = now + sk.cd;
    this.skillUI[i].mask.setScale(0.01);

    const p = this.player;

    if (i === 0) {
      // 风刃：向面朝方向射出三道刀气
      const dir = this.player.flipX ? -1 : 1;
      for (let k = -1; k <= 1; k++) {
        const b = this.physics.add.image(p.x + dir * 30, p.y - 20 + k * 18, 'fx_blade')
          .setDepth(24).setScale(1.5, 1.2);
        b.dmg = 26; b.life = 1100; b.pierce = 2;
        this.bullets.add(b);                 // 先入组
        b.body.allowGravity = false;
        b.body.setGravityY(0);
        b.setVelocity(dir * 980, k * 40);    // 再设速度（入组会重置速度）
        b.setFlipX(dir < 0);
        b.setAngle(0);
        // 拖影
        const ghost = this.add.image(b.x, b.y, 'fx_blade')
          .setDepth(23).setScale(1.5, 1.2).setTint(0x9be7ff).setAlpha(0.45)
          .setBlendMode(Phaser.BlendModes.ADD).setFlipX(dir < 0);
        this.tweens.add({ targets: ghost, alpha: 0, duration: 260, onComplete: () => ghost.destroy() });
        // 拖尾
        const trail = this.add.rectangle(b.x, b.y, 46, 6, 0x9be7ff, 0.5).setDepth(23)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: trail, alpha: 0, scaleX: 0.2, duration: 220, onComplete: () => trail.destroy() });
      }
      this.cameras.main.shake(80, 0.003);
      this.flashSkill(0x9be7ff);
    } else if (i === 1) {
      // 冰封：范围冻结
      const ring = this.add.circle(p.x, p.y, 40, 0x7fd4ff, 0.35).setDepth(23);
      this.tweens.add({ targets: ring, radius: 280, alpha: 0, duration: 500, onComplete: () => ring.destroy() });
      this.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        if (Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y) < 300) {
          this.hitEnemy(e, 34, 0);
          if (e.active && e.cfg && e.cfg.type !== 'boss') {
            e.setVelocity(0, 0);
            e.freezeUntil = this.time.now + 2000;
            e.setTint(0x7fd4ff);
            this.time.delayedCall(2000, () => { if (e.active) e.clearTint(); });
          }
        }
      });
      this.cameras.main.flash(200, 120, 200, 255);
    } else {
      // 佛光：大范围伤害 + 回血
      this.playerHP = Math.min(100, this.playerHP + 22);
      this.hpBar.width = 374 * (this.playerHP / 100);
      this.hpText.setText(String(Math.round(this.playerHP)));
      for (let r = 0; r < 3; r++) {
        this.time.delayedCall(r * 120, () => {
          const ring = this.add.circle(p.x, p.y, 30, 0xffd166, 0.45).setDepth(24).setBlendMode(Phaser.BlendModes.ADD);
          this.tweens.add({ targets: ring, radius: 420, alpha: 0, duration: 620, onComplete: () => ring.destroy() });
        });
      }
      this.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        if (Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y) < 420) this.hitEnemy(e, 95, 0);
      });
      this.cameras.main.flash(400, 255, 220, 150);
      this.cameras.main.shake(300, 0.008);
    }
  }

  flashSkill(color) {
    const c = this.add.rectangle(0, 0, W, H, color, 0.10).setOrigin(0).setScrollFactor(0).setDepth(870);
    this.tweens.add({ targets: c, alpha: 0, duration: 180, onComplete: () => c.destroy() });
  }

  /* ---------------- 输入 ---------------- */
  buildKeys() {
    this.keys = this.input.keyboard.addKeys({
      left: 'A', right: 'D', jump: 'K', atk: 'J',
      w1: 'ONE', w2: 'TWO', w3: 'THREE', w4: 'FOUR', pause: 'P'
    });
    this.input.keyboard.on('keydown-ONE', () => this.switchWeapon(0));
    this.input.keyboard.on('keydown-TWO', () => this.switchWeapon(1));
    this.input.keyboard.on('keydown-THREE', () => this.switchWeapon(2));
    this.input.keyboard.on('keydown-FOUR', () => this.switchWeapon(3));
    this.input.keyboard.on('keydown-B', () => {
      if (this.phase === 'play') { this.player.x = ARENA_L + 120; this.player.y = GROUND_Y - 120; }
    });
    this.input.keyboard.on('keydown-P', () => {
      if (this.physics.world.isPaused) { this.physics.world.resume(); this.physics.pause === undefined; }
      else this.physics.world.pause();
    });
  }

  buildTouch() {
    this.touch = { left: false, right: false };
    if (!this.sys.game.device.input.touch) return;

    const mk = (x, y, label, onDown, onUp) => {
      const c = this.add.circle(x, y, 46, 0xffffff, 0.10).setScrollFactor(0).setDepth(950)
        .setStrokeStyle(2, 0xffffff, 0.35).setInteractive();
      const t = this.add.text(x, y, label, {
        fontFamily: 'Microsoft YaHei', fontSize: '20px', color: '#cfe6ff'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(951);
      c.on('pointerdown', onDown);
      c.on('pointerup', onUp); c.on('pointerout', onUp);
      return { c, t };
    };

    mk(140, H - 120, '←', () => this.touch.left = true, () => this.touch.left = false);
    mk(260, H - 120, '→', () => this.touch.right = true, () => this.touch.right = false);
    mk(W - 260, H - 110, '跳', () => this.doJump(), () => {});
    mk(W - 140, H - 110, '攻', () => this.doAttack(), () => {});
    mk(W - 200, H - 210, '换器', () => this.switchWeapon((this.wi + 1) % WEAPONS.length), () => {});
  }

  /* ---------------- 标题 ---------------- */
  showTitle() {
    this.physics.world.pause();
    const ov = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);
    const bg = this.add.rectangle(0, 0, W, H, 0x05080f, 0.92).setOrigin(0);
    const t1 = this.add.text(W / 2, 240, '尸 语', {
      fontFamily: 'Microsoft YaHei', fontSize: '96px', color: '#e8f3ff'
    }).setOrigin(0.5).setShadow(0, 0, '#6ec8ff', 24, true, true);
    const t2 = this.add.text(W / 2, 330, '· 七 魔 逐 道 ·', {
      fontFamily: 'Microsoft YaHei', fontSize: '34px', color: '#c9a227'
    }).setOrigin(0.5);
    const t3 = this.add.text(W / 2, 420, this.cfg.title, {
      fontFamily: 'Microsoft YaHei', fontSize: '26px', color: '#8fb6d8'
    }).setOrigin(0.5);
    const t4 = this.add.text(W / 2, 540, '按 任意键 / 点击屏幕 开始', {
      fontFamily: 'Microsoft YaHei', fontSize: '22px', color: '#6a7a90'
    }).setOrigin(0.5);
    ov.add([bg, t1, t2, t3, t4]);

    this.tweens.add({ targets: t4, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    const start = () => {
      ov.destroy();
      this.physics.world.resume();
      this.playStart = this.time.now;
    };
    this.input.keyboard.once('keydown', start);
    this.input.once('pointerdown', start);
  }

  /* ---------------- HUD ---------------- */
  buildHUD() {
    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(800);

    const barBg = this.add.rectangle(40, 46, 380, 36, 0x0b1220, 0.85).setOrigin(0, 0.5)
      .setStrokeStyle(3, 0x3f6488);
    this.hpBar = this.add.rectangle(43, 46, 374, 29, 0xd94a4a).setOrigin(0, 0.5);
    this.hpText = this.add.text(52, 46, '100', {
      fontFamily: 'Microsoft YaHei', fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.wpText = this.add.text(40, 84, '藏刀', {
      fontFamily: 'Microsoft YaHei', fontSize: '18px', color: '#ffd166'
    });

    this.goalText = this.add.text(W - 40, 46, this.cfg.goal, {
      fontFamily: 'Microsoft YaHei', fontSize: '16px', color: '#8fb6d8'
    }).setOrigin(1, 0.5);

    this.bossBarBg = this.add.rectangle(W / 2, H - 46, 700, 18, 0x0b1220, 0.85)
      .setStrokeStyle(2, 0x7a2b2b).setVisible(false);
    this.bossBar = this.add.rectangle(W / 2 - 350, H - 46, 700, 14, 0xd94a4a).setOrigin(0, 0.5).setVisible(false);
    this.bossName = this.add.text(W / 2, H - 74, this.cfg.boss.name, {
      fontFamily: 'Microsoft YaHei', fontSize: '20px', color: '#ffd166'
    }).setOrigin(0.5).setVisible(false);

    this.hud.add([barBg, this.hpBar, this.hpText, this.wpText, this.goalText,
      this.bossBarBg, this.bossBar, this.bossName]);
  }

  toast(msg) {
    const t = this.add.text(W / 2, 170, msg, {
      fontFamily: 'Microsoft YaHei', fontSize: '28px', color: '#e8f3ff',
      backgroundColor: '#0b1220cc', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(900).setAlpha(0);
    this.tweens.add({
      targets: t, alpha: 1, duration: 300, hold: 1500, yoyo: true,
      onComplete: () => t.destroy()
    });
  }

  /* ---------------- 武器 ---------------- */
  switchWeapon(i) {
    this.wi = (i + WEAPONS.length) % WEAPONS.length;
    const w = WEAPONS[this.wi];
    this.wpText.setText(w.name);
    this.wpText.setColor('#' + w.color.toString(16).padStart(6, '0'));
    // 切换音效感：一圈光
    const c = this.add.circle(this.player.x, this.player.y, 30, w.color, 0.5)
      .setDepth(21).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: c, radius: 90, alpha: 0, duration: 300, onComplete: () => c.destroy() });
  }

  doAttack() {
    if (this.phase !== 'play' && this.phase !== 'boss') return;
    const now = this.time.now;
    const w = WEAPONS[this.wi];
    if (now - this.lastAttack < w.cd) return;
    this.lastAttack = now;

    this.player.__atkUntil = this.time.now + 260;
    this.tweens.add({ targets: this.player, angle: this.player.flipX ? -4 : 4, duration: 90, yoyo: true });

    if (w.type === 'melee') {
      const dir = this.player.flipX ? -1 : 1;

      // ---- 连击判定：700ms 内连按可以接下一段 ----
      if (now - (this.comboAt || 0) < 700) this.comboN = ((this.comboN || 0) % 3) + 1;
      else this.comboN = 1;
      this.comboAt = now;
      const step = this.comboN;

      let dmg = w.dmg, range = w.range, kb = w.kb, up = 0, shake = 0.002;
      let color = w.color;

      if (step === 1) {
        // 横劈：沉腰发力，横向掠过
        dmg = Math.round(w.dmg * 1.0);
      } else if (step === 2) {
        // 上挑：自下向上挑击，掀雪沫，带击飞
        dmg = Math.round(w.dmg * 1.2);
        up = -320;
        shake = 0.004;
        color = 0xdff0ff;
      } else {
        // 连斩：短促两层刀光，伤害最高
        dmg = Math.round(w.dmg * 1.6);
        range = w.range * 1.15;
        shake = 0.006;
        color = 0xffd166;
      }

      // ---- 刀光 ----
      const slash = (ang, sy, alpha, delay) => {
        this.time.delayedCall(delay, () => {
          const sl = this.add.image(this.player.x + dir * 96, this.player.y - 26, 'fx_slash')
            .setDepth(25).setTint(color).setAlpha(alpha)
            .setScale(1.55, sy * 1.25).setAngle(ang).setFlipX(dir < 0);
          this.tweens.add({
            targets: sl, alpha: 0, scaleX: sl.scaleX * 1.35, scaleY: sl.scaleY * 1.35,
            duration: 190, onComplete: () => sl.destroy()
          });
        });
      };

      if (step === 1) slash(8, 0.55, 0.95, 0);            // 横向
      else if (step === 2) slash(-62, 0.7, 0.95, 0);       // 上挑
      else { slash(-25, 0.6, 0.95, 0); slash(35, 0.55, 0.85, 70); }  // 连斩两层

      // ---- 命中判定 ----
      let hitAny = false;
      this.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        const dx = e.x - this.player.x, dy = Math.abs(e.y - this.player.y);
        const isBoss = e.cfg && e.cfg.type === 'boss';
        const halfW = (e.displayWidth || 60) * 0.5;
        const dyLimit = isBoss ? 340 : 130;
        const xLimit = isBoss ? range + 120 : range + halfW;
        if (Math.abs(dx) < xLimit && dy < dyLimit) {
          hitAny = true;
          this.hitEnemy(e, dmg, kb * dir);
          if (up && e.body && !isBoss) e.setVelocityY(up);

          // 上挑：掀起雪沫
          if (step === 2) {
            for (let i = 0; i < 10; i++) {
              const sn = this.add.circle(
                e.x + Phaser.Math.Between(-24, 24), e.y + 24,
                Phaser.Math.Between(2, 5), 0xeaf4ff, 0.9).setDepth(26);
              this.tweens.add({
                targets: sn, y: sn.y - Phaser.Math.Between(30, 80),
                x: sn.x + Phaser.Math.Between(-30, 30), alpha: 0,
                duration: 420, onComplete: () => sn.destroy()
              });
            }
          }
          // 连斩：金色火星
          if (step === 3) {
            for (let i = 0; i < 6; i++) {
              const sp = this.add.circle(e.x, e.y, 3, 0xffd166, 0.95).setDepth(26);
              this.tweens.add({
                targets: sp, x: e.x + Phaser.Math.Between(-60, 60),
                y: e.y + Phaser.Math.Between(-50, 30), alpha: 0,
                duration: 320, onComplete: () => sp.destroy()
              });
            }
          }
        }
      });

      // 第三段震屏更明显
      this.cameras.main.shake(step === 3 ? 150 : 70, shake);
      if (step === 3) this.flashSkill(0xffd166);
    } else if (w.type === 'orb') {
      const orb = this.bullets.create(this.player.x, this.player.y - 6, 'fx_orb').setDepth(24);
      orb.dmg = w.dmg;
      orb.homing = true;
      orb.life = 2200;
      orb.body.allowGravity = false;
      orb.body.setGravityY(0);
      orb.setVelocity((this.player.flipX ? -1 : 1) * 380, 0);
    } else {
      const dir = this.player.flipX ? -1 : 1;
      const b = this.bullets.create(this.player.x + dir * 34, this.player.y - 6, 'fx_bullet').setDepth(24);
      b.dmg = w.dmg;
      b.pierce = 1;
      b.life = 1400;
      b.body.allowGravity = false;
      b.body.setGravityY(0);
      b.setVelocityX(w.speed * dir);
      // 枪口火光
      const m = this.add.circle(this.player.x + dir * 40, this.player.y - 6, 18, 0xffd166, 0.8)
        .setDepth(25).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: m, alpha: 0, scale: 2, duration: 140, onComplete: () => m.destroy() });
      this.cameras.main.shake(90, 0.004);
    }
  }

  doJump() {
    if (this.phase !== 'play' && this.phase !== 'boss') return;
    const onGround = this.isOnGround(this.player);
    if (onGround) {
      this.player.setVelocityY(-620);
      const ring = this.add.circle(this.player.x, this.player.y + 40, 14, 0xffffff, 0.35)
        .setDepth(19).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: ring, radius: 60, alpha: 0, duration: 260, onComplete: () => ring.destroy() });
    }
  }

  /* ---------------- 伤害 ---------------- */
  hitEnemy(e, dmg, kb) {
    e.hp -= dmg;
    if (e.cfg && e.cfg.type === 'boss') {
      this.bossHP = Math.max(0, e.hp);
      this.bossBar.width = 700 * (this.bossHP / this.bossMaxHP);
    }
    if (e.cfg && e.cfg.type === 'boss') {
      const s0 = e.scaleX;
      this.tweens.add({ targets: e, scaleX: s0 * 1.04, scaleY: s0 * 1.04, duration: 60, yoyo: true });
      this.tweens.add({ targets: e, alpha: 0.65, duration: 50, yoyo: true });
    } else {
      e.setTintFill(0xffffff);
      this.time.delayedCall(70, () => { if (e.active) e.clearTint(); });
    }

    // 击退（Boss 不推，否则会滑出屏幕）
    if (kb && e.body && !(e.cfg && e.cfg.type === 'boss')) { e.setVelocityX(kb * 3.0); }

    // 飘字
    const t = this.add.text(e.x, e.y - 40, String(dmg), {
      fontFamily: 'Microsoft YaHei', fontSize: '22px', color: '#ffd166'
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, y: t.y - 46, alpha: 0, duration: 600, onComplete: () => t.destroy() });

    // 粒子
    for (let i = 0; i < 5; i++) {
      const p = this.add.circle(e.x, e.y, 3, 0xffd166, 0.9).setDepth(29);
      this.tweens.add({
        targets: p,
        x: e.x + Phaser.Math.Between(-50, 50),
        y: e.y + Phaser.Math.Between(-50, 20),
        alpha: 0, duration: 380, onComplete: () => p.destroy()
      });
    }

    if (e.hp <= 0) this.killEnemy(e);
  }

  killEnemy(e) {
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(e.x, e.y, Phaser.Math.Between(2, 5), 0x9be7ff, 0.9).setDepth(29);
      this.tweens.add({
        targets: p, x: e.x + Phaser.Math.Between(-70, 70), y: e.y + Phaser.Math.Between(-70, 40),
        alpha: 0, duration: 500, onComplete: () => p.destroy()
      });
    }
    if (e.cfg && e.cfg.type === 'boss') { this.onBossDead(e); return; }
    e.destroy();
  }

  hurtPlayer(dmg, src) {
    if (this.player.invuln || this.phase === 'win' || this.phase === 'dead') return;
    this.playerHP = Math.max(0, this.playerHP - dmg);
    this.player.invuln = true;
    this.player.setAlpha(0.45);
    this.time.delayedCall(110, () => { if (this.player.active) { this.player.setAlpha(1); } });
    const hurtFx = this.add.rectangle(0, 0, W, H, 0xff2b2b, 0.16)
      .setOrigin(0).setScrollFactor(0).setDepth(880);
    this.tweens.add({ targets: hurtFx, alpha: 0, duration: 220, onComplete: () => hurtFx.destroy() });
    this.time.delayedCall(1100, () => { this.player.invuln = false; });

    const dir = src ? Math.sign(this.player.x - src.x) || 1 : 1;
    this.player.setVelocity(dir * 260, -220);
    this.cameras.main.shake(160, 0.008);

    this.hpBar.width = 374 * (this.playerHP / 100);
    this.hpText.setText(String(this.playerHP));
    this.hpBar.fillColor = this.playerHP > 50 ? 0xd94a4a : 0xff8b3d;

    if (this.playerHP <= 0) this.gameOver();
  }

  gameOver() {
    this.phase = 'dead';
    this.physics.world.pause();
    const ov = this.add.container(0, 0).setScrollFactor(0).setDepth(1100);
    ov.add(this.add.rectangle(0, 0, W, H, 0x1a0505, 0.88).setOrigin(0));
    ov.add(this.add.text(W / 2, 300, '你被幻术吞没', {
      fontFamily: 'Microsoft YaHei', fontSize: '54px', color: '#ff8b8b'
    }).setOrigin(0.5));
    ov.add(this.add.text(W / 2, 390, '按 R 重来', {
      fontFamily: 'Microsoft YaHei', fontSize: '24px', color: '#c9a227'
    }).setOrigin(0.5));
    this.input.keyboard.once('keydown-R', () => this.scene.restart());
    this.input.once('pointerdown', () => this.scene.restart());
  }

  /* 贴地：把角色脚底钳制在地面高度（不依赖物理体，稳定） */
  stickToGround(obj) {
    const feet = obj.y + obj.displayHeight * (1 - obj.originY);
    if (feet > GROUND_Y) {
      obj.y -= (feet - GROUND_Y);
      if (obj.body) obj.body.setVelocityY(0);
      return true;
    }
    return false;
  }

  isOnGround(obj) {
    const feet = obj.y + obj.displayHeight * (1 - obj.originY);
    return feet >= GROUND_Y - 2;
  }

  /* ---------------- 每帧 ---------------- */
  update(time, dt) {
    const d = dt / 1000;

    // 锁定垂直视角
    this.cameras.main.scrollY = 0;

    // 背景视差
    const camX = this.cameras.main.scrollX;
    if (this.far) {
      this.far.x = -W * 0.12 - camX * 0.035;
    }

    if (this.phase === 'dead' || this.phase === 'win' || this.phase === 'bossIntro') return;

    const p = this.player;
    const w = WEAPONS[this.wi];
    this.stickToGround(p);
    const onGround = this.isOnGround(p);

    // 移动
    const left = this.keys.left.isDown || this.touch.left;
    const right = this.keys.right.isDown || this.touch.right;
    if (left && !right) { p.setVelocityX(-300); p.flipX = true; }
    else if (right && !left) { p.setVelocityX(300); p.flipX = false; }

    // 动作状态机
    const moving = Math.abs(p.body.velocity.x) > 40;
    const airborne = !onGround;

    const attacking = p.__atkUntil && time < p.__atkUntil;

    if (attacking) {
      if (p.texture.key !== 'spr_atk2') p.setTexture('spr_atk2');
      p.setAngle(0);
      p.setScale(0.82, 0.82);
    } else if (airborne) {
      if (p.texture.key !== 'spr_jump2') p.setTexture('spr_jump2');
      p.setAngle(p.body.velocity.y < 0 ? -5 : 4);
    } else if (moving) {
      // 4 帧走路循环
      if (!this.runTick || time - this.runTick > 85) {
        this.runTick = time;
        this.walkFrame = ((this.walkFrame || 0) + 1) % 8;
        p.setTexture('spr_walk' + this.walkFrame);
        p.setFlipX(p.flipDirection ? true : false);
        // 跑步上下起伏
        p.setScale(0.82, 0.82 + (this.runFlip ? 0.02 : -0.01));
      }
      p.setAngle(this.walkFrame % 2 ? -1.5 : 1.5);
      // 脚下尘土
      if (Math.random() < 0.18) {
        const d = this.add.circle(p.x - (p.flipX ? -14 : 14), GROUND_Y - 6, 4, 0xbfcfe0, 0.35).setDepth(17);
        this.tweens.add({ targets: d, x: d.x + (p.flipX ? 30 : -30), alpha: 0, y: d.y - 10,
                          duration: 380, onComplete: () => d.destroy() });
      }
    } else {
      if (p.texture.key !== 'spr_idle') p.setTexture('spr_idle');
      p.setScale(0.82, 0.82);
      p.setAngle(Phaser.Math.Linear(p.angle, 0, 0.25));
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.jump)) this.doJump();
    if (Phaser.Input.Keyboard.JustDown(this.keys.atk)) this.doAttack();

    // 剑跟随
    if (this.sword) {
      const dir = p.flipX ? -1 : 1;
      const attacking = p.__atkUntil && time < p.__atkUntil;
      // 手的位置（相对角色中心）：攻击帧里手在身体前上方
      const handX = p.x + dir * 44;
      const handY = p.y - 34;
      if (attacking) {
        const t = Phaser.Math.Clamp(1 - (p.__atkUntil - time) / 260, 0, 1);
        // 从举刀（-115°）挥到前下方（+35°），绕手旋转
        const ang = Phaser.Math.Linear(-115, 35, t);
        this.sword.setPosition(handX, handY);
        this.sword.setAngle(dir > 0 ? ang : -ang);
        this.sword.setFlipX(dir < 0);
      } else {
        // 待机/走路：剑挂在腰间（手自然下垂的位置）
        this.sword.setPosition(p.x - dir * 8, p.y + 30);
        this.sword.setAngle(dir > 0 ? 72 : -72);
        this.sword.setFlipX(dir < 0);
      }
      this.sword.setScale(0.82);
    }

    // 影子 / 光环
    this.shadow.setPosition(p.x, GROUND_Y - 6);
    this.shadow.setScale(Phaser.Math.Clamp(1 - (GROUND_Y - p.y) / 600, 0.4, 1.1));
    this.aura.setPosition(p.x, p.y);
    this.aura.setAlpha(0.08 + Math.sin(time / 300) * 0.04);

    {
      const bs = this.bullets.getChildren();
      const b0 = bs[0];
      this.dbgblade.setText(b0
        ? `bullets=${bs.length} x=${b0.x|0} vx=${b0.body?b0.body.velocity.x|0:'-'} g=${b0.body?b0.body.allowGravity:'-'}`
        : `bullets=0`);
    }
    {
      const es = this.enemies ? this.enemies.getChildren() : [];
      this.dbgblade.setText('敌人=' + es.length + '  ' +
        es.slice(0, 5).map(e => (e.texture ? e.texture.key : '?') + '@' + (e.x|0) + ',' + (e.y|0)).join(' | ') +
        '  player.x=' + (this.player ? this.player.x|0 : '-'));
    }
    // 技能冷却显示
    if (this.skills) {
      this.skills.forEach((sk, i) => {
        const remain = Math.max(0, sk.ready - time);
        const ui = this.skillUI[i];
        if (remain > 0) {
          ui.mask.setScale(remain / sk.cd);
          ui.mask.setAlpha(0.7);
        } else {
          ui.mask.setScale(0.01);
          ui.bg.setStrokeStyle(3, sk.color, 0.9 + Math.sin(time / 200) * 0.1);
        }
      });
    }

    // 敌人行为
    this.enemies.getChildren().forEach(e => {
      if (!e.active || !e.cfg) return;
      if (e.cfg.type === 'zombie') { e.y = GROUND_Y - e.displayHeight / 2; e.body.setVelocityY(0); }
      if (e.freezeUntil && time < e.freezeUntil) { e.setVelocity(0, 0); return; }
      if (e.cfg.type === 'zombie') {
        const dir = Math.sign(p.x - e.x) || 1;
        const dist = Math.abs(p.x - e.x);
        // 离出生点超过 520 像素就回头，避免一路追到 Boss 场
        const home = e.spawnX === undefined ? e.x : e.spawnX;
        const away = Math.abs(e.x - home);
        if (away > 520) {
          e.setVelocityX(-Math.sign(e.x - home) * e.cfg.speed * 0.6);
        } else if (dist > 30) {
          e.setVelocityX(dir * e.cfg.speed);
        } else {
          e.setVelocityX(0);
        }
      } else if (e.cfg.type === 'ghost') {
        const dx = p.x - e.x, dy = (p.y - 10) - e.y;
        const len = Math.hypot(dx, dy) || 1;
        e.setVelocity((dx / len) * e.cfg.speed, (dy / len) * e.cfg.speed);
        e.y += Math.sin(time / 260 + e.x) * 0.4;
      }
    });

    // 子弹
    this.bullets.getChildren().forEach(b => {
      if (!b.active) return;
      // 强制关重力，防止往前飞时往下掉
      if (b.body) { b.body.allowGravity = false; b.body.setGravityY(0); }
      b.life -= dt;
      if (b.life <= 0) { b.destroy(); return; }
      if (b.homing) {
        const target = this.enemies.getChildren().filter(e => e.active)
          .sort((a, c) => Phaser.Math.Distance.Between(b.x, b.y, a.x, a.y) - Phaser.Math.Distance.Between(b.x, b.y, c.x, c.y))[0];
        if (target) {
          const ang = Math.atan2(target.y - b.y, target.x - b.x);
          b.setVelocity(Math.cos(ang) * 560, Math.sin(ang) * 560);
        }
      }
      // 命中
      this.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        const hitR = (e.cfg && e.cfg.type === 'boss') ? 170 : 46;
        if (Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y) < hitR) {
          this.hitEnemy(e, b.dmg, 0);
          b.destroy();
        }
      });
    });

    // 关卡进度触发
    if (!this.flags.ghostWave && p.x > 1700) {
      this.flags.ghostWave = true;
      this.toast('第二波：中阴身');
      this.spawnGhost(2100, GROUND_Y - 260);
      this.spawnGhost(2400, GROUND_Y - 320);
    }
    if (!this.flags.mixedWave && p.x > 2600) {
      this.flags.mixedWave = true;
      this.toast('第三波：起尸与中阴身');
      this.spawnZombie(2900); this.spawnZombie(3100);
      this.spawnGhost(2800, GROUND_Y - 280); this.spawnGhost(3050, GROUND_Y - 340);
    }
    if (!this.bossActive && p.x > ARENA_L + 60) this.callBoss();

    // Boss 行为
    if (this.bossActive && this.boss) this.updateBoss(time, dt);
  }

  /* ---------------- Boss ---------------- */
  callBoss() {
    this.bossActive = true;
    this.phase = 'bossIntro';
    this.physics.world.pause();

    // 黑场
    const ov = this.add.container(0, 0).setScrollFactor(0).setDepth(1050);
    const bg = this.add.rectangle(0, 0, W, H, 0x03060c, 0.0).setOrigin(0);
    const name = this.add.text(W / 2, 300, this.cfg.boss.name, {
      fontFamily: 'Microsoft YaHei', fontSize: '58px', color: '#e8f3ff'
    }).setOrigin(0.5).setAlpha(0).setShadow(0, 0, '#3aa6d8', 30, true, true);
    const sub = this.add.text(W / 2, 372, this.cfg.boss.sub, {
      fontFamily: 'Microsoft YaHei', fontSize: '22px', color: '#8fb6d8'
    }).setOrigin(0.5).setAlpha(0);
    ov.add([bg, name, sub]);

    this.tweens.add({ targets: bg, alpha: 0.9, duration: 500 });
    this.tweens.add({ targets: name, alpha: 1, y: 290, duration: 700, delay: 400 });
    this.tweens.add({ targets: sub, alpha: 1, duration: 700, delay: 800 });
    this.cameras.main.shake(700, 0.006);

    this.time.delayedCall(2000, () => {
      this.tweens.add({ targets: ov, alpha: 0, duration: 400, onComplete: () => ov.destroy() });
      this.spawnBoss();
    });
  }

  spawnBoss() {
    const bx = (ARENA_L + ARENA_R) / 2;
    const b = this.physics.add.sprite(bx, 290, this.cfg.boss.tex).setDepth(26);
    b.setScale(0.62);
    b.body.setAllowGravity(false);
    b.body.setSize(300, 300).setOffset(70, 130);
    b.cfg = { type: 'boss' };
    b.hp = this.bossMaxHP;
    b.baseY = 300;
    b.nextAtk = this.time.now + 2200;
    b.attackIndex = 0;
    b.phase2 = false;

    // 幻影光晕（柔光圆，不再复制 Boss 图，避免重影）
    const glow = this.add.image(bx, 290, 'fx_aura').setScale(1.1).setDepth(25)
      .setAlpha(0.15).setTint(0x3f88b8).setBlendMode(Phaser.BlendModes.ADD);
    b.glow = glow;

    // 边缘符文圈
    const ring = this.add.circle(bx, 290, 200, 0x3aa6d8, 0.0)
      .setStrokeStyle(3, 0x6ec8ff, 0.45).setDepth(24);
    b.ring = ring;

    this.boss = b;
    this.enemies.add(b);

    this.tweens.add({ targets: b, y: 280, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: glow, y: 280, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: ring, angle: 360, duration: 9000, repeat: -1 });

    this.bossBarBg.setVisible(true); this.bossBar.setVisible(true); this.bossName.setVisible(true);
    this.goalText.setText(this.cfg.bossGoal);

    this.phase = 'boss';
    this.physics.world.resume();
    this.bossStart = this.time.now;
  }

  updateBoss(time, dt) {
    const b = this.boss;
    if (!b || !b.active) return;
    b.glow.setPosition(b.x, b.y);
    b.ring.setPosition(b.x, b.y);

    if (!b.phase2 && b.hp < this.bossMaxHP * 0.5) {
      b.phase2 = true;
      b.glow.setTint(0xff6b6b);
      this.toast('洪流之主 · 怒');
      this.cameras.main.shake(600, 0.01);
      b.nextAtk = time + 900;
    }

    const interval = b.phase2 ? 1700 : 2400;
    if (time > b.nextAtk) {
      b.nextAtk = time + interval;
      const n = b.attackIndex++ % 3;
      this.bossCast(n, () => {
        if (!this.boss || !this.boss.active) return;
        if (n === 0) this.bossWaterColumn();
        else if (n === 1) this.bossWave();
        else this.bossSummon();
        if (b.phase2 && n === 0) this.time.delayedCall(600, () => this.bossWaterColumn());
      });
    }
  }

  /* Boss 施法动作：蓄力放大 + 收束粒子 + 核心闪光 */
  bossCast(kind, cb) {
    const b = this.boss;
    if (!b || !b.active) return;
    const s0 = b.scaleX;
    const color = kind === 0 ? 0x3aa6d8 : (kind === 1 ? 0x2f8fbf : 0x9b6bff);

    // 起身 + 倾斜 + 回位
    this.tweens.add({
      targets: b, scaleX: s0 * 1.14, scaleY: s0 * 1.14,
      angle: kind === 1 ? 7 : -7, duration: 280, yoyo: true, hold: 80
    });

    // 核心光爆
    const core = this.add.circle(b.x, b.y, 40, color, 0.55).setDepth(27)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: core, radius: 230, alpha: 0, duration: 460, onComplete: () => core.destroy() });

    // 四周粒子向中心收束
    for (let i = 0; i < 14; i++) {
      const ang = (Math.PI * 2 * i) / 14 + Math.random() * 0.3;
      const r = 260;
      const px = b.x + Math.cos(ang) * r, py = b.y + Math.sin(ang) * r * 0.7;
      const pt = this.add.circle(px, py, 4, 0xbfeaff, 0.95).setDepth(28)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: pt, x: b.x, y: b.y, alpha: 0.2, duration: 360 + i * 8,
        onComplete: () => pt.destroy()
      });
    }

    // 符文环脉冲
    const ring = this.add.circle(b.x, b.y, 120, 0x000000, 0).setDepth(27)
      .setStrokeStyle(4, color, 0.85);
    this.tweens.add({ targets: ring, radius: 330, alpha: 0, duration: 520, onComplete: () => ring.destroy() });

    this.cameras.main.shake(140, 0.004);
    this.time.delayedCall(430, () => { if (this.boss && this.boss.active) cb(); });
  }

  bossWaterColumn() {
    const px = Phaser.Math.Clamp(this.player.x, ARENA_L, ARENA_R);
    const warn = this.add.image(px, GROUND_Y - 36, 'fx_warn').setDepth(22).setAlpha(0.9);
    this.tweens.add({ targets: warn, alpha: 0.2, duration: 180, yoyo: true, repeat: 3 });

    this.time.delayedCall(720, () => {
      warn.destroy();
      const col = this.physics.add.image(px, GROUND_Y - 150, 'fx_column').setDepth(23);
      col.body.setAllowGravity(false);
      col.dmg = 13;
      this.dangers.add(col);
      this.tweens.add({ targets: col, alpha: 0, duration: 500, delay: 350, onComplete: () => col.destroy() });
      this.cameras.main.shake(180, 0.006);
    });
  }

  bossWave() {
    const fromLeft = this.player.x > (ARENA_L + ARENA_R) / 2;
    const y = GROUND_Y - 70;
    const wv = this.physics.add.image(fromLeft ? ARENA_L + 40 : ARENA_R - 40, y, 'fx_wave').setDepth(23);
    wv.body.setAllowGravity(false);
    wv.setVelocityX(fromLeft ? 420 : -420);
    wv.dmg = 15;
    wv.setFlipX(!fromLeft);
    this.dangers.add(wv);
    this.time.delayedCall(3200, () => { if (wv.active) wv.destroy(); });
    this.cameras.main.shake(220, 0.005);
  }

  bossSummon() {
    this.toast('召唤 · 起尸');
    this.spawnZombie(Phaser.Math.Between(ARENA_L + 120, ARENA_R - 120));
    this.spawnZombie(Phaser.Math.Between(ARENA_L + 120, ARENA_R - 120));
  }

  onBossDead(b) {
    this.phase = 'win';
    this.physics.world.pause();
    this.bossBar.setVisible(false); this.bossBarBg.setVisible(false); this.bossName.setVisible(false);

    // 碎裂
    for (let i = 0; i < 40; i++) {
      const p = this.add.circle(b.x + Phaser.Math.Between(-150, 150), b.y + Phaser.Math.Between(-180, 180),
        Phaser.Math.Between(2, 6), 0x9be7ff, 0.9).setDepth(30).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: p, x: p.x + Phaser.Math.Between(-160, 160), y: p.y + Phaser.Math.Between(-200, 120),
        alpha: 0, duration: 1100, onComplete: () => p.destroy()
      });
    }
    b.destroy();
    this.cameras.main.flash(600, 200, 230, 255);

    this.time.delayedCall(1200, () => this.showWin());
  }

  showWin() {
    const ov = this.add.container(0, 0).setScrollFactor(0).setDepth(1100);
    ov.add(this.add.rectangle(0, 0, W, H, 0x05080f, 0.94).setOrigin(0));

    ov.add(this.add.text(W / 2, 52, `第${this.level === 1 ? '一' : '二'}关 · 通过`, {
      fontFamily: 'Microsoft YaHei', fontSize: '40px', color: '#ffd166'
    }).setOrigin(0.5).setShadow(0, 0, '#ffd166', 18, true, true));

    // 奖励卡片（等比缩放到高度 520）
    const cardH = 520;
    const cardW = cardH * (1200 / 1600);
    const pic = this.add.image(W / 2, 300, this.level === 1 ? 'reward_l1' : 'boss2')
      .setDisplaySize(cardW * 0.2, cardH * 0.2).setAlpha(0);
    ov.add(pic);
    this.tweens.add({
      targets: pic, alpha: 1, displayWidth: cardW, displayHeight: cardH,
      duration: 700, delay: 200
    });

    ov.add(this.add.text(W / 2, 596,
      `解锁图鉴：${this.cfg.boss.name}`, {
      fontFamily: 'Microsoft YaHei', fontSize: '24px', color: '#c9a227'
    }).setOrigin(0.5));

    // 保存按钮
    const saveBtn = this.add.text(W / 2 - 300, 656, '保存奖励图', {
      fontFamily: 'Microsoft YaHei', fontSize: '24px', color: '#0b1220',
      backgroundColor: '#ffd166', padding: { x: 22, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ov.add(saveBtn);

    saveBtn.on('pointerover', () => saveBtn.setStyle({ backgroundColor: '#fff2c4' }));
    saveBtn.on('pointerout', () => saveBtn.setStyle({ backgroundColor: '#ffd166' }));
    saveBtn.on('pointerdown', () => {
      const url = 'assets/reward_l1.png';
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = '尸语_第一关通关_洪流之主.png';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        saveBtn.setText('已保存 ✓');
      } catch (e) {
        window.open(url, '_blank');
        saveBtn.setText('已打开图片');
      }
      // 明确反馈：告诉玩家文件去哪了
      if (this.__saveTip) this.__saveTip.destroy();
      const tip = this.add.text(W / 2, 712,
        '已下载到「下载」文件夹：尸语_第一关通关_洪流之主.png', {
          fontFamily: 'Microsoft YaHei', fontSize: '17px', color: '#0b1220',
          backgroundColor: '#6fd3a8', padding: { x: 16, y: 7 }
        }).setOrigin(0.5);
      ov.add(tip);
      this.__saveTip = tip;
      saveBtn.setText('已下载 ✓');
    });

    // 查看大图（右键另存，最稳）
    const viewBtn = this.add.text(W / 2 - 120, 656, '查看大图', {
      fontFamily: 'Microsoft YaHei', fontSize: '18px', color: '#8fb6d8'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ov.add(viewBtn);
    viewBtn.on('pointerdown', () => window.open('assets/reward_l1.png', '_blank'));

    // 进入第二关 / 结束
    if (this.level === 1) {
      const next = this.add.text(W / 2 + 70, 656, '进入第二关 →', {
        fontFamily: 'Microsoft YaHei', fontSize: '24px', color: '#0b1220',
        backgroundColor: '#6fd3a8', padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      ov.add(next);
      next.on('pointerdown', () => this.scene.restart({ level: 2 }));
    }

    // 重来
    const again = this.add.text(this.level === 1 ? W / 2 + 260 : W / 2 + 120, 656, '再玩一次', {
      fontFamily: 'Microsoft YaHei', fontSize: '24px', color: '#8fb6d8',
      backgroundColor: '#12203180', padding: { x: 22, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ov.add(again);
    again.on('pointerdown', () => this.scene.restart());

    ov.add(this.add.text(W / 2, 736, '按 R 也可重来', {
      fontFamily: 'Microsoft YaHei', fontSize: '16px', color: '#6a7a90'
    }).setOrigin(0.5));

    this.input.keyboard.once('keydown-R', () => this.scene.restart());
  }

}

/* ========================================================================= */
new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game',
  backgroundColor: '#05080f',
  physics: { default: 'arcade', arcade: { gravity: { y: 1500 }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, GameScene],
});
