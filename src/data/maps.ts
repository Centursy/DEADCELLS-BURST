export interface MapDefinition {
  name: string
  arrivalRate: number
  reward: number
  comment: string
  next: string[]
  boss?: string
  bossReward?: number
}

const regionalBossReward = 100

export const maps: MapDefinition[] = [
  {
    name: '被囚者的牢房', arrivalRate: 1, reward: 10,
    comment: '至少也要出去第一张图吧~', next: ['有罪者的大道', '猛毒下水道'],
  },
  {
    name: '有罪者的大道', arrivalRate: 0.8, reward: 15,
    comment: '第二张地图....应该没这么难吧？',
    // 文档未列出荒废植物园的入口，这里从第二张图补入一条可达分支。
    next: ['壁垒', '藏骨堂', '被弃者沼泽', '监狱深处', '荒废植物园'],
  },
  {
    name: '猛毒下水道', arrivalRate: 0.8, reward: 20,
    comment: '哦这下水道好臭。。。。', next: ['壁垒', '旧下水道', '腐化牢房'],
  },
  {
    name: '荒废植物园', arrivalRate: 0.8, reward: 25,
    comment: '这是，什么新地方？', next: ['藏骨堂', '被弃者沼泽', '监狱深处'],
  },
  {
    name: '监狱深处', arrivalRate: 0.8, reward: 30,
    comment: '草！早知道不开这个诅咒箱了！', next: ['藏骨堂', '被弃者沼泽', '旧下水道'],
  },
  {
    name: '腐化牢房', arrivalRate: 0.8, reward: 35,
    comment: '这游戏就没有阳光一点的地图吗......', next: ['旧下水道', '壁垒'],
  },
  {
    name: '壁垒', arrivalRate: 0.8, reward: 40,
    comment: '好高，被摔死了，，', next: ['黑色大桥'],
  },
  {
    name: '藏骨堂', arrivalRate: 0.8, reward: 45,
    comment: '藏骨堂的大剑和刺猬确实很棘手呢！', next: ['黑色大桥'],
  },
  {
    name: '旧下水道', arrivalRate: 0.8, reward: 50,
    comment: '这下水道到底有完没完了，，', next: ['作呕地窖'],
  },
  {
    name: '被弃者沼泽', arrivalRate: 0.8, reward: 55,
    comment: '还是没逃过毒啊！', next: ['巢穴'],
  },
  {
    name: '黑色大桥', arrivalRate: 0.8, reward: 60,
    comment: '还是没能战胜大桥守卫吗....', next: ['雾萦港湾', '沉睡的庇护所'],
    boss: '大桥守卫', bossReward: regionalBossReward,
  },
  {
    name: '作呕地窖', arrivalRate: 0.8, reward: 65,
    comment: '好大的虫子啊！！！', next: ['沉睡的庇护所', '墓地'],
    boss: '大眼', bossReward: regionalBossReward,
  },
  {
    name: '巢穴', arrivalRate: 0.8, reward: 70,
    comment: '这大眼怎么比大桥守卫强这么多？？', next: ['雾萦港湾', '崩坏神庙'],
    boss: '多眼怪', bossReward: regionalBossReward,
  },
  {
    name: '雾萦港湾', arrivalRate: 0.8, reward: 75,
    comment: '船长你再扔手雷我给你另一只手也扬了！！！', next: ['钟楼', '被遗忘的陵墓'],
  },
  {
    name: '沉睡的庇护所', arrivalRate: 0.8, reward: 80,
    comment: '再接再厉，继续精进！', next: ['钟楼', '被遗忘的陵墓', '山洞'],
  },
  {
    name: '墓地', arrivalRate: 0.8, reward: 85,
    comment: '我大概是这里唯一的活物了....', next: ['被遗忘的陵墓', '山洞', '不死海滩'],
    boss: '稻草人', bossReward: regionalBossReward,
  },
  {
    name: '崩坏神庙', arrivalRate: 0.8, reward: 90,
    comment: '我穿越于天空之中~', next: ['不死海滩', '钟楼'],
  },
  {
    name: '钟楼', arrivalRate: 0.8, reward: 95,
    comment: '再努力一下就能见到刺客姐姐了？？', next: ['时钟室'],
  },
  {
    name: '被遗忘的陵墓', arrivalRate: 0.8, reward: 100,
    comment: '好黑....灯在哪里......', next: ['时钟室', '守护者的居所'],
  },
  {
    name: '山洞', arrivalRate: 0.8, reward: 105,
    comment: '什么时候更新的这张图？！', next: ['守护者的居所'],
  },
  {
    name: '不死海滩', arrivalRate: 0.8, reward: 110,
    comment: '终于块爬出这座监狱了吗......', next: ['阴森墓园'],
  },
  {
    name: '时钟室', arrivalRate: 0.8, reward: 115,
    comment: '刺客小姐，，还是你比较强，，', next: ['山巅城堡', '废弃酿酒厂', '感染船骸'],
    boss: '时间守护者', bossReward: regionalBossReward,
  },
  {
    name: '山巅城堡', arrivalRate: 0.8, reward: 120,
    comment: '前面就是王座之间了！', next: ['王座之间'],
  },
  {
    name: '守护者的居所', arrivalRate: 0.8, reward: 120,
    comment: '我还能走出这作监狱吗......', next: ['山巅城堡', '王座之间', '感染船骸'],
    boss: '巨人', bossReward: regionalBossReward,
  },
  {
    name: '阴森墓园', arrivalRate: 0.8, reward: 125,
    comment: '还是没能走出去吗.....', next: ['山巅城堡', '废弃酿酒厂', '感染船骸'],
  },
  {
    name: '废弃酿酒厂', arrivalRate: 0.8, reward: 130,
    comment: '哪来的炮弹？？？？', next: ['王座之间', '灯塔'],
  },
  {
    name: '感染船骸', arrivalRate: 0.8, reward: 135,
    comment: '决战快到了吗.....下次一定要.....', next: ['灯塔'],
  },
  {
    name: '王座之间', arrivalRate: 0.8, reward: 140,
    comment: '王手我tm来啦！！下次。。', next: ['观星实验所'],
    boss: '国王之手', bossReward: regionalBossReward,
  },
  {
    name: '灯塔', arrivalRate: 0.8, reward: 145,
    comment: '下次一定要....见到女王.....', next: ['塔顶'],
    boss: '仆人', bossReward: regionalBossReward,
  },
  {
    name: '塔顶', arrivalRate: 0.8, reward: 150,
    comment: '女王！！你给我等着！！！！', next: [],
    boss: '女王', bossReward: 500,
  },
  {
    name: '观星实验所', arrivalRate: 0.8, reward: 155,
    comment: '还是这里的东西，好眼熟？', next: ['观星台'],
  },
  {
    name: '观星台', arrivalRate: 0.8, reward: 160,
    comment: '原来是你这家伙，，，', next: [],
    boss: '收藏家', bossReward: 500,
  },
]

export const bossComment = '恭喜逃出监狱！！你到达了真正的结局！'
