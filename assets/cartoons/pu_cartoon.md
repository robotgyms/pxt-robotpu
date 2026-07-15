# 《与小谱一起学编程》插图清单

本清单供 AI 绘图 Agent 使用。请根据书中章节内容和已有 `assets/PNG/` 风格，批量生成统一风格的小谱卡通插图。

---

## 风格指南

- **角色**：小谱（Robot PU），micro:bit 驱动的双足小型机器人，圆润可爱，有大眼睛和小天线。
- **画风**：儿童绘本风格，线条圆润，配色明亮（主色可沿用蓝、橙、白），表情生动。
- **背景**：优先透明 PNG 或纯白背景，方便嵌入 Markdown/PDF。
- **比例**：主体占画面 60%–80%，留出文字排版空间。
- **参考现有图**：`pu_happy.png`、`pu_sad.png`、`pu_dance.png`、`pu_walk.png`、`pu_sing.png`、`pu_jump.png`、`pu_stand.png`。

---

## 一、通用形象（跨章节复用）

| 文件名 | 场景 | 画面描述 | 用途 |
|---|---|---|---|
| `pu_hello.png` | 打招呼 | 小谱挥手微笑，旁边有 "Hello!" 气泡 | 全书通用欢迎图 |
| `pu_thinking.png` | 思考 | 小谱歪头，头顶有问号 | 思考题、小试牛刀 |
| `pu_idea.png` | 有想法 | 小谱头顶灯泡，眼睛发亮 | 引入新概念 |
| `pu_warning.png` | 提醒 | 小谱举手做停止姿势，旁边有黄色感叹号 | 安全提示、注意 |
| `pu_success.png` | 成功 | 小谱比耶，周围有小星星 | 完成任务、章节结尾 |
| `pu_error.png` | 出错 | 小谱挠头，屏幕上有红色小叉 | 调试、报错 |
| `pu_debug.png` | 找 bug | 小谱拿放大镜看代码/电路 | 调试章节 |
| `pu_team.png` | 团队 | 多只小谱手拉手或排成队 | 多机器人、合作 |

---

## 二、五步学习/工程法（核心案例循环）

每章案例都可复用这五张图，组成 "想法 → 计划 → 实施 → 评估 → 改进" 流程。

| 文件名 | 步骤 | 画面描述 | 关键词 |
|---|---|---|---|
| `pu_step_idea.png` | 想法 | 小谱头顶灯泡，面前有草图/涂鸦 | idea, light bulb, sketch |
| `pu_step_plan.png` | 计划 | 小谱拿铅笔在纸上画流程图/写步骤 | plan, flowchart, checklist |
| `pu_step_do.png` | 实施 | 小谱拼积木、接电线或敲键盘 | implement, build, code |
| `pu_step_check.png` | 评估 | 小谱拿放大镜看作品，旁边有勾选框 | test, evaluate, checklist |
| `pu_step_improve.png` | 改进 | 小谱修改图纸，给机器人升级配件 | improve, iterate, upgrade |

---

## 三、按章节插图清单

### 第 1 章：程序结构与函数调用

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch01_cover.png` | 章节封面 | 小谱耳朵里装着无线电接收器，面前飘着小纸条（代码行） |
| `ch01_two_microbits.png` | 两块 micro:bit | 左边 gamepad，右边小谱大脑，中间用无线电波连线 |
| `ch01_channel.png` | 调频道 | 小谱拿着对讲机，屏幕上显示 "166"，旁边说明“暗号要对上” |
| `ch01_function_button.png` | 函数调用 | 小谱按下一个写着函数名的按钮，机器人做一整套动作 |
| `ch01_case_idea.png` | 案例-想法 | （复用 `pu_step_idea.png`）想让小谱听指令 |
| `ch01_case_plan.png` | 案例-计划 | （复用 `pu_step_plan.png`）列出：调频道、写事件 |
| `ch01_case_do.png` | 案例-实施 | 小谱在编辑器里拖积木/写代码 |
| `ch01_case_check.png` | 案例-评估 | 按下手柄，观察小谱是否响应 |
| `ch01_case_improve.png` | 案例-改进 | 换频道、加注释 |

### 第 2 章：顺序执行

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch02_cover.png` | 章节封面 | 小谱排队买冰淇淋：先排队、再付钱、最后拿甜筒 |
| `ch02_init.png` | 初始化 | 小谱刷牙、洗脸、站好、调频道，按顺序完成 |
| `ch02_event_bell.png` | 事件等待 | 小谱坐在教室里，旁边有铃铛，铃铛响才动 |
| `ch02_case_*` | 五步案例 | 复用通用五步图：设计“小谱问好”流程 |

### 第 3 章：函数

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch03_cover.png` | 章节封面 | 小谱从盒子里拿出拼好的“手臂”积木，贴上 `ArmUp` 标签 |
| `ch03_function_box.png` | 函数像盒子 | 小谱把一段动作装进带标签的盒子，需要时拿出来 |
| `ch03_parameter.png` | 参数 | 盒子里附带说明书，写着“角度=90” |
| `ch03_case_*` | 五步案例 | 设计“举手-休息-放下”手臂动作 |

### 第 4 章：变量与常量

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch04_cover.png` | 章节封面 | 小谱面前有很多贴标签的小盒子，盒子里装着数字 |
| `ch04_variable_box.png` | 变量盒子 | 一个可打开的小盒子，里面数字会变 |
| `ch04_constant_lock.png` | 常量锁 | 一个带锁的盒子，上面写着"MAX_SPEED"，数字固定 |
| `ch04_serial.png` | 串口输出 | 小谱把盒子里的数字打印成纸条吐出来 |
| `ch04_case_*` | 五步案例 | 调整舵机 trim 值 |

### 第 5 章：数组

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch05_cover.png` | 章节封面 | 小谱举着一串糖葫芦，每个山楂上写着一个数字 |
| `ch05_array_sugar.png` | 数组糖葫芦 | 糖葫芦按编号 0、1、2、3 排列 |
| `ch05_index.png` | 下标 | 小谱手指指向第 3 个山楂 |
| `ch05_loop_array.png` | 循环遍历 | 小谱从左到右依次吃/检查每个山楂 |
| `ch05_case_*` | 五步案例 | 用数组控制电机动作 |

### 第 6 章：循环

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch06_cover.png` | 章节封面 | 小谱在跳长绳，`for` 和 `while` 变成两根绳子 |
| `ch06_for_rope.png` | for 循环 | 小谱数着 1、2、3…跳固定次数 |
| `ch06_while_cat.png` | while 循环 | 小谱端着盘子：“只要猫没吃饱，就一直喂” |
| `ch06_async.png` | 异步动作 | 小谱同时跳绳和听音乐，互不耽误 |
| `ch06_case_*` | 五步案例 | 设计重复动作序列 |

### 第 7 章：二维数组

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch07_cover.png` | 章节封面 | 小谱面前是带抽屉的中药柜，每个抽屉有编号 |
| `ch07_cabinet.png` | 二维数组 | 中药柜：行号+列号才能找到特定抽屉 |
| `ch07_flipbook.png` | 翻页动画 | 小谱快速翻动一叠画有姿势的小卡片 |
| `ch07_interpolation.png` | 插值 | 小谱从姿势 A 平滑过渡到姿势 B，中间有虚线轨迹 |
| `ch07_case_*` | 五步案例 | 编排一段舞蹈 |

### 第 8 章：音乐

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch08_cover.png` | 章节封面 | 小谱拿着指挥棒，面前有音符和波形 |
| `ch08_hz_wave.png` | 频率 Hz | 小谱吹口哨，空气像波浪一样传播 |
| `ch08_midi_piano.png` | MIDI | 小谱按钢琴键，每个键对应一个数字 |
| `ch08_bpm_train.png` | BPM | 小谱开小火车，速度是每分钟多少拍 |
| `ch08_modulo.png` | 取模 | 小谱把音符按圆圈编号，数到末尾回到 0 |
| `ch08_case_*` | 五步案例 | 创作一首小曲子 |

### 第 9 章：无线电

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch09_cover.png` | 章节封面 | 小谱和小蜜蜂用无线电对话，旁边有波形 |
| `ch09_walkietalkie.png` | 对讲机 | 小谱拿着对讲机发送 "walk" |
| `ch09_listener.png` | 事件监听 | 小谱竖起耳朵，旁边写 `onReceivedString` |
| `ch09_timeout.png` | 超时保护 | 小谱看手表：“好久没收到消息，我先停下来” |
| `ch09_case_*` | 五步案例 | 实现遥控小谱 |

### 第 10 章：游戏手柄

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch10_cover.png` | 章节封面 | 小谱面前有游戏手柄，摇杆、按钮都标了数字 |
| `ch10_gamepad.png` | 手柄状态 | 手柄变成一张表格，记录每个按键 |
| `ch10_normalize.png` | 归一化 | 小谱把不同大小的摇杆值统一缩放到 0–1 |
| `ch10_case_*` | 五步案例 | 用手柄遥控小谱走路转弯 |

### 第 11 章：条件判断

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch11_cover.png` | 章节封面 | 小谱站在路口，红绿灯分别写着 `if`、`else if`、`else` |
| `ch11_traffic_light.png` | 红绿灯 | 红灯停、绿灯行、黄灯等一等 |
| `ch11_sensors.png` | 传感器 | 小谱身上有眼睛（超声波）、内耳（加速度计） |
| `ch11_operators.png` | 比较/逻辑 | 小谱举着 >、<、==、&&、|| 符号牌 |
| `ch11_case_*` | 五步案例 | 根据距离决定走还是停 |

### 第 12 章：函数、映射与避障

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch12_cover.png` | 章节封面 | 小谱开车，面前是温度计和方向盘 |
| `ch12_thermometer.png` | Math.map | 小谱把体温计刻度映射到发动机速度 |
| `ch12_clamp.png` | clamp | 小谱用夹子把数字夹在最小/最大之间 |
| `ch12_ema.png` | EMA 平滑 | 小谱端着一杯水，走路时水不洒出来 |
| `ch12_autopilot.png` | 自动驾驶 | 小谱开车看路，避开前方障碍 |
| `ch12_case_*` | 五步案例 | 实现避障小车 |

### 第 13 章：事件循环与枚举

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch13_cover.png` | 章节封面 | 小谱一边写作业，一边注意窗外的蜜蜂 |
| `ch13_observe_think_act.png` | 看-想-做 | 小谱头上有三只眼睛：观察、思考、行动 |
| `ch13_enum_badge.png` | 枚举 | 小谱胸前挂着名牌：`MODE_API`、`MODE_TRIM` |
| `ch13_nonblocking.png` | 非阻塞 | 小谱同时转好几个盘子，不卡在一个上 |
| `ch13_case_*` | 五步案例 | 设计小蜜蜂采蜜循环 |

### 第 14 章：自定义事件

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch14_cover.png` | 章节封面 | 小谱当“传话小天使”，把消息传给另一只小谱 |
| `ch14_raise_event.png` | 发事件 | 小谱举起一封信，上面写事件编号 |
| `ch14_on_event.png` | 收事件 | 另一只小谱收到信，打开看 |
| `ch14_decouple.png` | 解耦 | 小谱之间用信箱交流，不直接拉电线 |
| `ch14_compass.png` | 指南针 | 小谱手里拿着指南针，找北方 |
| `ch14_case_*` | 五步案例 | 实现队长-跟随者 |

### 第 15 章：状态机与面向对象

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch15_cover.png` | 章节封面 | 小谱站在自动售货机前，按按钮切换状态 |
| `ch15_state_machine.png` | 状态机 | 圆圈表示状态，箭头表示转换条件 |
| `ch15_guard.png` | 守卫条件 | 小谱站在箭头旁举牌：“只有钱够才开门” |
| `ch15_class_mold.png` | 类像模具 | 小谱用蛋糕模具批量做蛋糕 |
| `ch15_object.png` | 对象实例 | 每个蛋糕都有不同口味（属性） |
| `ch15_method.png` | 方法 | 蛋糕会“被吃掉”这个行为 |
| `ch15_case_*` | 五步案例 | 设计小谱的情绪状态机 |

### 第 16 章：功夫小谱

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch16_cover.png` | 章节封面 | 小谱穿功夫服，摆招式，周围有残影 |
| `ch16_two_brains.png` | 两个大脑 | 小谱头上有两个并行的齿轮，同时工作 |
| `ch16_pose_array.png` | 姿势数组 | 小谱面前展开一排招式卡片 |
| `ch16_kungfu.png` | 功夫表演 | 小谱打一套连贯招式 |
| `ch16_case_*` | 五步案例 | 设计一套小谱功夫 |

### 第 17 章：有情绪的机器人

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch17_cover.png` | 章节封面 | 小谱脸旁边有太阳（开心）、乌云（难过）、闪电（惊讶） |
| `ch17_emotion_state.png` | 情绪状态 | 小谱心里挂着不同情绪牌子 |
| `ch17_sensor_flow.png` | 传感器→情绪→动作 | 小谱被摸头→变开心→摇尾巴/挥手 |
| `ch17_threshold.png` | 阈值 | 小谱手里有标尺：“超过这条线就算大声” |
| `ch17_case_*` | 五步案例 | 让小谱对摔倒/声音/触摸做出不同情绪 |

### 第 18 章：小谱会说话

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch18_cover.png` | 章节封面 | 小谱胸前有个小喇叭，冒出 Morse 点划线 |
| `ch18_morse.png` | 摩斯电码 | 小谱用短点和长划拼出 SOS |
| `ch18_string.png` | 字符串 | 一串字母像小火车挂在空中 |
| `ch18_robotvoice.png` | 机器人语音 | 小谱张大嘴，声音变成波形 |
| `ch18_case_*` | 五步案例 | 让小谱用摩斯码说一句话 |

### 第 19 章：迷宫小谱

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch19_cover.png` | 章节封面 | 小谱像小老鼠一样走迷宫，右手摸着墙 |
| `ch19_right_hand_rule.png` | 右手法则 | 小谱举起右手，始终贴墙 |
| `ch19_median.png` | 中值滤波 | 小谱从几个距离数字里挑中间的 |
| `ch19_hysteresis.png` | 迟滞 | 小谱跨越门槛时，进去和出来的触发点不一样 |
| `ch19_case_*` | 五步案例 | 让小谱走出迷宫 |

### 第 20 章：小谱聊天室

| 文件名 | 场景 | 画面描述 |
|---|---|---|
| `ch20_cover.png` | 章节封面 | 多只小围成圈，互相发消息气泡 |
| `ch20_protocol.png` | 通信协议 | 小谱们用统一格式写纸条：`名字:内容` |
| `ch20_split.png` | split | 小谱用剪刀把纸条按冒号剪开 |
| `ch20_random.png` | 随机选择 | 小谱抽签决定谁回答 |
| `ch20_background.png` | 后台任务 | 小谱有分身，一个聊天、一个巡逻 |
| `ch20_case_*` | 五步案例 | 实现多机器人点名/聊天游戏 |

---

## 四、已有图片直接使用清单

以下图片已在 `assets/PNG/` 中，可直接嵌入书中，无需重新生成：

| 文件名 | 建议用途 |
|---|---|
| `Pu_name.png` | 书名页、封面 |
| `robotgyms_logo.png` / `Pu_robotgyms logo.png` | 版权页、致谢页 |
| `pu_happy.png` | 第 17 章开心情绪、成功提示 |
| `pu_sad.png` | 第 17 章难过情绪 |
| `pu_supprise.png` | 第 17 章惊讶情绪 |
| `pu_dance.png` | 第 7、16 章舞蹈/功夫 |
| `pu_walk.png` | 第 5、6 章走路 |
| `pu_sing.png` | 第 8 章音乐 |
| `pu_jump.png` | 第 6 章动作、高兴场景 |
| `pu_stand.png` | 第 2、4 章初始化 |
| `pu_ideas.png` | 五步案例之“想法” |
| `pu_star.png` | 奖励、完成标志 |

---

## 五、提示词模板（可直接复制给 AI 绘图 Agent）

```text
A cute cartoon robot named Xiaopu (小谱), chibi style, rounded shapes, big expressive eyes, small antenna on head, friendly smile, bright blue and orange color scheme, transparent background, children's book illustration style, high quality PNG.

Scene: [填写具体场景，例如 "Xiaopu jumping rope while counting numbers"]
Mood: [happy / curious / thinking / surprised / determined]
Props: [列出需要的道具]
Text elements: [是否包含文字/符号，如 "for", "while", "if"]
```

示例：

```text
A cute cartoon robot named Xiaopu, chibi style, rounded shapes, big eyes, small antenna, transparent background. Xiaopu is holding a walkie-talkie with "166" on the screen, radio waves in the air, curious expression, children's book illustration style.
```

---

## 六、备注

- 所有新图建议统一命名为 `chXX_描述.png`，例如 `ch01_channel.png`。
- 案例五步图可优先复用通用 `pu_step_*.png`，如风格需要统一，也可为每章单独生成五步图，命名为 `ch01_case_idea.png` 等。
- 生成后请统一用 PNG 格式、透明背景、宽度约 800–1200 像素，便于印刷和屏幕阅读。
清单包含：

风格指南：参考现有 pu_happy.png、pu_dance.png 等图的风格说明。
通用形象：打招呼、思考、有想法、提醒、成功、出错、调试、团队等 8 张跨章复用图。
五步学习/工程法：想法、计划、实施、评估、改进各 1 张。
20 章逐章清单：每章封面图 + 知识点图 + 算法/概念图 + 5 张案例步骤图。
已有图片直接复用表：pu_happy.png、pu_sad.png、pu_dance.png 等 12 张无需重画。
AI 提示词模板：可直接复制给 Midjourney / DALL·E / 即梦等使用。