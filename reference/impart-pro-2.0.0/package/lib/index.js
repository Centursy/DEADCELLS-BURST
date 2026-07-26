var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject,
  name: () => name,
  usage: () => usage
});
module.exports = __toCommonJS(src_exports);

// src/config.ts
var import_koishi = require("koishi");
var usage = `
<h2><a href="https://www.npmjs.com/package/koishi-plugin-impart-pro" target="_blank">点我查看完整README</a></h2>
<hr>
<table>
<thead>
<tr>
<th>指令</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td>开导 [@某人]</td>
<td>长牛牛</td>
</tr>
<tr>
<td>决斗 [@某人]</td>
<td>战斗！爽~</td>
</tr>
<tr>
<td>重开牛牛</td>
<td>牛牛很差怎么办？稳了！直接重开！</td>
</tr>
<tr>
<td>牛牛排行榜</td>
<td>查看牛牛排行榜</td>
</tr>
<tr>
<td>看看牛牛 [@某人]</td>
<td>查询自己或者别人牛牛数据</td>
</tr>
<tr>
<td>锁牛牛 [@某人]</td>
<td>开启/关闭 某人/某频道 的牛牛大作战</td>
</tr>
</tbody>
</table>
<hr>
<h3>配置项里有 形如 10 ± 45% 的数值</h3>
<p>举例说明：<br>
每次锻炼成功后，牛牛长度的增长范围。<br>
以默认值 <code>[10, 45]</code> 为例，表示成功锻炼后牛牛长度增长的基数为 10 厘米，同时允许有 ±45% 的浮动：</p>
<ul>
<li><strong>最大值</strong>: 10 + 10 × 0.45 = 14.5 厘米</li>
<li><strong>最小值</strong>: 10 - 10 × 0.45 = 5.5 厘米</li>
</ul>
<p>因此，锻炼成功时，牛牛的长度会在 5.5 厘米到 14.5 厘米之间随机增长。</p>
<hr>
本插件的排行榜用户昵称可以通过 [callme](/market?keyword=callme) 插件自定义
在未指定 callme 插件的名称的时候，默认使用 适配器的 username，或者userid
---
必需服务：i18n 
必需服务：database 
必需服务：monetary 
可选服务：puppeteer 
---
`;
var Config = import_koishi.Schema.intersect([
  import_koishi.Schema.object({
    commandList: import_koishi.Schema.object({
      command: import_koishi.Schema.string().default("impartpro").description("父级 指令名称"),
      command1: import_koishi.Schema.string().default("注入").description("注入 指令名称"),
      command2: import_koishi.Schema.string().default("保养").description("保养 指令名称"),
      command3: import_koishi.Schema.string().default("开导").description("开导 令名称"),
      command4: import_koishi.Schema.string().default("牛牛决斗").description("牛牛决斗 指令名称"),
      command5: import_koishi.Schema.string().default("重开牛牛").description("重开牛牛 指令名称"),
      command6: import_koishi.Schema.string().default("注入排行榜").description("注入排行榜 指令名称"),
      command7: import_koishi.Schema.string().default("牛牛排行榜").description("牛牛排行榜 指令名称"),
      command8: import_koishi.Schema.string().default("看看牛牛").description("看看牛牛 指令名称"),
      command9: import_koishi.Schema.string().default("锁牛牛").description("锁牛牛 指令名称")
    }).collapse().description("指令名称列表<br>自定义指令名称")
  }).description("指令名称设置"),
  import_koishi.Schema.object({
    defaultLength: import_koishi.Schema.tuple([Number, Number]).description("【初始生成】的牛牛长度（cm）<br>右侧代表最大的偏差百分比（%）（默认在 18 ± 45%）").default([18, 45]),
    exerciseRate: import_koishi.Schema.array(import_koishi.Schema.object({
      minlength: import_koishi.Schema.number().description("区间最小值"),
      maxlength: import_koishi.Schema.number().description("区间最大值"),
      rate: import_koishi.Schema.number().description("成功概率")
    })).role("table").description("【锻炼成功】每个长度段位对应的概率。<br>找不到对应区间的时候，默认成功率为 50%").default([
      { "rate": 100, "maxlength": 0, "minlength": -999999999999 },
      { "minlength": 0, "maxlength": 100, "rate": 80 },
      { "minlength": 100, "maxlength": 300, "rate": 70 },
      { "minlength": 300, "maxlength": 500, "rate": 60 },
      { "minlength": 500, "maxlength": 1e3, "rate": 50 },
      { "minlength": 1e3, "maxlength": 2e3, "rate": 40 },
      { "minlength": 2e3, "maxlength": 1e4, "rate": 30 },
      { "minlength": 1e4, "maxlength": 5e4, "rate": 20 },
      { "minlength": 5e4, "maxlength": 1e5, "rate": 10 },
      { "minlength": 1e5, "maxlength": 999999999999, "rate": 0 }
    ]),
    exerciseWinGrowthRange: import_koishi.Schema.tuple([Number, Number]).description("【锻炼成功】增长的牛牛长度（cm）<br>右侧代表最大的偏差百分比（%）（默认在 10 ± 45%）").default([10, 45]),
    exerciseLossReductionRange: import_koishi.Schema.tuple([Number, Number]).description("【锻炼失败】减少的牛牛长度（cm）<br>右侧代表最大的偏差百分比（%）（默认在 12 ± 45%）").default([12, 45]),
    exerciseCooldownTime: import_koishi.Schema.number().min(0).max(86400).step(1).default(5).description("【锻炼牛牛】间隔休息时间（秒）")
  }).description("牛牛设置"),
  import_koishi.Schema.object({
    duelWinRateFactor: import_koishi.Schema.array(import_koishi.Schema.object({
      minlength: import_koishi.Schema.number().description("区间最小值"),
      maxlength: import_koishi.Schema.number().description("区间最大值"),
      rate: import_koishi.Schema.number().description("成功概率")
    })).role("table").description("【获胜概率 和 牛子长度】之间的关联性。<br>双方牛子长度【差值的绝对值】越大，获胜概率越小").default([
      { "rate": 100, "maxlength": 10, "minlength": 0 },
      { "minlength": 10, "maxlength": 50, "rate": 80 },
      { "minlength": 50, "maxlength": 100, "rate": 60 },
      { "minlength": 100, "maxlength": 300, "rate": 40 },
      { "minlength": 300, "maxlength": 1e3, "rate": 20 },
      { "minlength": 1e3, "maxlength": 999999999999, "rate": 0 }
    ]),
    duelWinRateFactor2: import_koishi.Schema.number().role("slider").min(-100).max(100).step(1).default(-10).description("【获胜概率 和 牛子长度】之间的额外概率。<br>其实就是为某一方单独加一点概率<br>为0时，双方概率按上表。<br>为100时，较长的一方必胜。<br>为-100时，较短的一方必胜。"),
    duelWinGrowthRange: import_koishi.Schema.tuple([Number, Number]).description("【决斗胜利】增长长度（cm）<br>右侧代表最大的偏差百分比（%）（默认在 10 ± 50%）").default([10, 50]),
    duelLossReductionRange: import_koishi.Schema.tuple([Number, Number]).description("【决斗失败】减少长度（cm）<br>右侧代表最大的偏差百分比（%）（默认在 15 ± 50%）").default([15, 50]),
    duelCooldownTime: import_koishi.Schema.number().min(0).step(1).default(15).description("【决斗】间隔休息时间（秒）"),
    duelLossCurrency: import_koishi.Schema.number().role("slider").min(0).max(100).step(1).default(80).description("【决斗】战败方，缩短长度转化为【货币】的比率（百分比）")
  }).description("对决设置"),
  import_koishi.Schema.object({
    randomdrawing: import_koishi.Schema.union([
      import_koishi.Schema.const("1").description("仅在本群（可能会抽到已经退群的人）"),
      import_koishi.Schema.const("2").description("所有用户（可能遇到不认识的哦）"),
      import_koishi.Schema.const("3").description("必须输入用户（@用户）")
    ]).role("radio").description("`注入`指令 的 随机抽取时的范围").default("1"),
    milliliter_range: import_koishi.Schema.tuple([Number, Number]).description("注入毫升数的范围<br>默认`10 ± 100%`，即 0 ~ 20 mL").default([10, 100])
  }).description("注入功能设置"),
  import_koishi.Schema.object({
    imagemode: import_koishi.Schema.boolean().description("开启后，排行榜将使用 puppeteer 渲染图片发送").default(true),
    leaderboardPeopleNumber: import_koishi.Schema.number().description("排行榜显示人数").default(15).min(3),
    enableAllChannel: import_koishi.Schema.boolean().description("开启后，排行榜将展示全部用户排名<br>关闭后 则仅展示当前频道的用户排名").default(false)
  }).description("渲染 - 排行榜"),
  import_koishi.Schema.object({
    useCustomFont: import_koishi.Schema.boolean().description("是否为排行榜图片启用自定义字体<br>需要安装并且配置 `glyph` 插件。").default(false)
  }).description("渲染 - 字体"),
  import_koishi.Schema.union([
    import_koishi.Schema.object({
      useCustomFont: import_koishi.Schema.const(true).required(),
      font: import_koishi.Schema.dynamic("glyph.fonts").description("选择用于渲染排行榜图片的字体。<br>需要开启 `glyph` 插件才能显示可用字体。  ")
    }),
    import_koishi.Schema.object({
      useCustomFont: import_koishi.Schema.const(false)
    })
  ]),
  import_koishi.Schema.object({
    permissionScope: import_koishi.Schema.union([
      import_koishi.Schema.const("all").description("所有用户"),
      import_koishi.Schema.const("admin").description("仅管理员"),
      import_koishi.Schema.const("owner").description("仅群主"),
      import_koishi.Schema.const("owner_admin").description("仅管理员 + 群主"),
      import_koishi.Schema.const("onlybotowner").description("仅下面的名单可用（onlybotowner_list）"),
      import_koishi.Schema.const("onlybotowner_admin_owner").description("onlybotowner_list + 管理员 + 群主")
    ]).role("radio").description("允许使用【开始银趴/结束银趴】的人（需要适配器支持获取群员角色）").default("owner_admin"),
    onlybotowner_list: import_koishi.Schema.array(String).role("table").description("允许使用【开始银趴/结束银趴】的用户ID").default(["114514"]),
    notallowtip: import_koishi.Schema.boolean().description("当禁止的对象尝试触发<br>开启后。对禁止的玩家/频道发送提示语<br>关闭，则不做反应").default(false)
  }).description("管理设置"),
  import_koishi.Schema.object({
    currency: import_koishi.Schema.string().default("default").description("monetary 数据库的 currency 字段名称"),
    maintenanceCostPerUnit: import_koishi.Schema.number().role("slider").min(0).max(1).step(0.01).default(0.1).description("【保养】钱币与长度的转化比率。0.1则为`10:1`，十个货币换 1 cm")
  }).description("monetary·通用货币设置"),
  import_koishi.Schema.object({
    loggerinfo: import_koishi.Schema.boolean().description("debug日志输出模式").default(false)
  }).description("调试设置")
]);

// src/commands/inject.ts
var import_koishi2 = require("koishi");

// src/utils.ts
async function updateUserCurrency(ctx, uid, amount, currency) {
  try {
    const numericUserId = Number(uid);
    if (amount > 0) {
      await ctx.monetary.gain(numericUserId, amount, currency);
    } else if (amount < 0) {
      await ctx.monetary.cost(numericUserId, -amount, currency);
    }
  } catch (error) {
    ctx.logger.error(`更新用户 ${uid} 的货币时出错: ${error}`);
  }
}
__name(updateUserCurrency, "updateUserCurrency");
async function getUserCurrency(ctx, uid, currency) {
  try {
    const numericUserId = Number(uid);
    const [data] = await ctx.database.get("monetary", {
      uid: numericUserId,
      currency
    }, ["value"]);
    return data ? data.value : 0;
  } catch (error) {
    ctx.logger.error(`获取用户 ${uid} 的货币时出错: ${error}`);
    return 0;
  }
}
__name(getUserCurrency, "getUserCurrency");
async function updateChannelId(ctx, userId, newChannelId) {
  const [userRecord] = await ctx.database.get("impartpro", { userid: userId });
  if (!userRecord) {
    return [newChannelId];
  }
  const currentChannels = userRecord.channelId || [];
  if (!currentChannels.includes(newChannelId)) {
    currentChannels.push(newChannelId);
  }
  return currentChannels;
}
__name(updateChannelId, "updateChannelId");
async function isUserAllowed(ctx, userId, channelId) {
  const specialUserId = `channel_${channelId}`;
  const [channelRecord] = await ctx.database.get("impartpro", { userid: specialUserId, channelId: { $el: channelId } });
  if (channelRecord && channelRecord.locked) {
    return false;
  }
  const [userRecord] = await ctx.database.get("impartpro", { userid: userId, channelId: { $el: channelId } });
  if (userRecord) {
    return !userRecord.locked;
  }
  return true;
}
__name(isUserAllowed, "isUserAllowed");
function checkPermission(session, scope, allowedList) {
  const { userId, author } = session;
  const role = author?.roles?.[0];
  if (scope === "all") return true;
  if (scope === "admin" && (role === "admin" || role === "owner")) return true;
  if (scope === "owner" && role === "owner") return true;
  if (scope === "owner_admin" && (role === "owner" || role === "admin")) return true;
  if (scope === "onlybotowner" && allowedList.includes(userId)) return true;
  if (scope === "onlybotowner_admin_owner" && (allowedList.includes(userId) || role === "owner" || role === "admin")) return true;
  return false;
}
__name(checkPermission, "checkPermission");
function loggerinfo(ctx, config, message) {
  if (config.loggerinfo) {
    ctx.logger.info(message);
  }
}
__name(loggerinfo, "loggerinfo");
async function getFontStyles(ctx, config) {
  let fontFaceStyle = "";
  let customFontFamily = "";
  if (config.useCustomFont) {
    const selectedFont = config.font || (ctx.glyph.getFontNames ? ctx.glyph.getFontNames()[0] : null);
    const fontDataUrl = selectedFont ? ctx.glyph.getFontDataUrl(selectedFont) : null;
    if (fontDataUrl) {
      fontFaceStyle = `
        @font-face {
          font-family: 'CustomFont';
          src: url('${fontDataUrl}');
        }
      `;
      customFontFamily = `'CustomFont', `;
    }
  }
  return { fontFaceStyle, customFontFamily };
}
__name(getFontStyles, "getFontStyles");

// src/commands/inject.ts
function randomLength([base, variance]) {
  const min = base * (1 - variance / 100);
  const max = base * (1 + variance / 100);
  return min + Math.random() * (max - min);
}
__name(randomLength, "randomLength");
function applyInjectCommand(ctx, config) {
  ctx.command(`impartpro/${config.commandList.command1} [user]`).userFields(["id", "name", "permissions"]).example(config.commandList.command1).example(`${config.commandList.command1} @用户`).action(async ({ session }, user) => {
    if (!await isUserAllowed(ctx, session.userId, session.channelId)) {
      if (config.notallowtip) {
        return session.text(".not-allowed");
      }
      return;
    }
    const currentDate = /* @__PURE__ */ new Date();
    const day = currentDate.getDate();
    const formattedDate = `${day}`;
    const randomML = randomLength(config.milliliter_range).toFixed(2);
    let targetUserId = null;
    let targetUsername = null;
    if (user) {
      const parsedUser = import_koishi2.h.parse(user)[0];
      if (parsedUser?.type === "at") {
        targetUserId = parsedUser.attrs.id;
        targetUsername = parsedUser.attrs.name || (typeof session.bot.getUser === "function" ? (await session.bot.getUser(targetUserId))?.name || targetUserId : targetUserId);
        if (targetUserId === session.userId) {
          return session.text(".self-inject-disallowed");
        }
      } else {
        return session.text(".invalid-user-format");
      }
    } else {
      const records = await ctx.database.get("impartpro", {});
      let filteredRecords;
      const drawingScope = config.randomdrawing || "1";
      if (drawingScope === "1") {
        filteredRecords = records.filter(
          (record) => record.channelId?.includes(session.channelId) && !record.userid.startsWith("channel_") && record.userid !== session.userId
        );
      } else if (drawingScope === "2") {
        filteredRecords = records.filter(
          (record) => !record.userid.startsWith("channel_") && record.userid !== session.userId
        );
      }
      if (!filteredRecords || filteredRecords.length === 0) {
        return session.text(".no-valid-users");
      }
      const randomIndex = Math.floor(Math.random() * filteredRecords.length);
      const targetRecord2 = filteredRecords[randomIndex];
      targetUserId = targetRecord2.userid;
      targetUsername = targetRecord2.username || (typeof session.bot.getUser === "function" ? (await session.bot.getUser(targetUserId))?.name || targetUserId : targetUserId);
    }
    if (!targetUserId) {
      return session.text(".no-target-user");
    }
    const [targetRecord] = await ctx.database.get("impartpro", { userid: targetUserId });
    if (!targetRecord) {
      return session.text(".target-user-not-initialized", [import_koishi2.h.at(targetUserId)]);
    }
    let injectData = {};
    if (targetRecord.injectml) {
      const [date, ml] = targetRecord.injectml.split("-");
      if (date === formattedDate && !isNaN(parseFloat(ml))) {
        injectData[formattedDate] = parseFloat(ml);
      } else {
        injectData[formattedDate] = 0;
      }
    } else {
      injectData[formattedDate] = 0;
    }
    injectData[formattedDate] += parseFloat(randomML);
    const updatedInjectML = `${formattedDate}-${injectData[formattedDate].toFixed(2)}`;
    await ctx.database.set("impartpro", { userid: targetUserId }, { injectml: updatedInjectML });
    const totalML = injectData[formattedDate].toFixed(2);
    const getUserData = await session.bot.getUser(targetUserId);
    const imageLink = getUserData.avatar;
    return import_koishi2.h.text(session.text(".inject-success", [session.username, targetUsername, randomML, totalML])) + `<p>` + import_koishi2.h.image(imageLink);
  });
}
__name(applyInjectCommand, "applyInjectCommand");

// src/commands/maintenance.ts
function applyMaintenanceCommand(ctx, config) {
  ctx.command(`impartpro/${config.commandList.command2}`).userFields(["id", "name", "permissions"]).action(async ({ session }) => {
    const userId = session.userId;
    if (!await isUserAllowed(ctx, userId, session.channelId)) {
      if (config.notallowtip) {
        return session.text(".not-allowed");
      }
      return;
    }
    let [userRecord] = await ctx.database.get("impartpro", { userid: userId });
    if (!userRecord) {
      return session.text(".not-initialized");
    }
    const userCurrency = await getUserCurrency(ctx, userId, config.currency);
    const costPerUnit = config.maintenanceCostPerUnit;
    const maxPurchasableLength = Math.floor(userCurrency / (1 / costPerUnit));
    if (maxPurchasableLength <= 0) {
      return session.text(".insufficient-currency");
    }
    await session.send(session.text(".purchase-prompt", [maxPurchasableLength]));
    const response = await session.prompt();
    const desiredLength = parseInt(response);
    if (isNaN(desiredLength) || desiredLength <= 0) {
      return session.text(".invalid-input");
    }
    if (desiredLength > maxPurchasableLength) {
      return session.text(".currency-not-enough-for-purchase");
    }
    userRecord.length += desiredLength;
    await updateUserCurrency(ctx, userId, -desiredLength / costPerUnit, config.currency);
    await ctx.database.set("impartpro", { userid: userId }, {
      length: userRecord.length,
      channelId: await updateChannelId(ctx, userId, session.channelId)
    });
    return session.text(".purchase-success", [desiredLength / costPerUnit, desiredLength]);
  });
}
__name(applyMaintenanceCommand, "applyMaintenanceCommand");

// src/commands/exercise.ts
var import_koishi3 = require("koishi");
function randomLength2([base, variance]) {
  const min = base * (1 - variance / 100);
  const max = base * (1 + variance / 100);
  return min + Math.random() * (max - min);
}
__name(randomLength2, "randomLength");
function applyExerciseCommand(ctx, config) {
  ctx.command(`impartpro/${config.commandList.command3} [user]`).example(`${config.commandList.command3} @用户`).userFields(["id", "name", "permissions"]).action(async ({ session }, user) => {
    let userId = session.userId;
    let username = session.user.name || session.username;
    const currentTime = Date.now();
    if (!await isUserAllowed(ctx, session.userId, session.channelId)) {
      if (config.notallowtip) {
        return session.text(".not-allowed");
      }
      return;
    }
    if (user) {
      const parsedUser = import_koishi3.h.parse(user)[0];
      if (parsedUser?.type === "at") {
        const { id, name: name2 } = parsedUser.attrs;
        if (!id || session.userId === id) {
          return session.text(".invalid-user");
        }
        userId = id;
        username = name2 || (typeof session.bot.getUser === "function" ? (await session.bot.getUser(userId))?.name || userId : userId);
      } else {
        return session.text(".invalid-user-format");
      }
    } else {
      await ctx.database.set("impartpro", { userid: userId }, {
        username
      });
    }
    let [userRecord] = await ctx.database.get("impartpro", { userid: userId });
    if (!userRecord) {
      const initialLength = randomLength2(config.defaultLength);
      const growthFactor = Math.random();
      userRecord = {
        userid: userId,
        username,
        channelId: await updateChannelId(ctx, userId, session.channelId),
        length: initialLength,
        injectml: "0-0",
        growthFactor,
        lastGrowthTime: (/* @__PURE__ */ new Date()).toISOString(),
        lastDuelTime: (/* @__PURE__ */ new Date()).toISOString(),
        locked: false
      };
      await ctx.database.create("impartpro", userRecord);
      return session.text(".auto-initialize-success", [import_koishi3.h.at(userId), initialLength.toFixed(2), growthFactor.toFixed(2)]);
    }
    let [initiatorRecord] = await ctx.database.get("impartpro", { userid: session.userId });
    if (!initiatorRecord) {
      const initialLength = randomLength2(config.defaultLength);
      const growthFactor = Math.random();
      initiatorRecord = {
        userid: session.userId,
        username: session.user.name || session.username,
        channelId: await updateChannelId(ctx, session.userId, session.channelId),
        length: initialLength,
        injectml: "0-0",
        growthFactor,
        lastGrowthTime: (/* @__PURE__ */ new Date()).toISOString(),
        lastDuelTime: (/* @__PURE__ */ new Date()).toISOString(),
        locked: false
      };
      await ctx.database.create("impartpro", initiatorRecord);
      return session.text(".auto-initialize-success", [import_koishi3.h.at(session.userId), initialLength.toFixed(2), growthFactor.toFixed(2)]);
    }
    const lastInitiatorGrowthTime = new Date(initiatorRecord.lastGrowthTime).getTime();
    const cooldownTime = config.exerciseCooldownTime * 1e3;
    if (isNaN(lastInitiatorGrowthTime)) {
      return session.text(".data-error-last-growth-time");
    }
    if (currentTime - lastInitiatorGrowthTime < cooldownTime) {
      const remainingTime = Math.ceil((cooldownTime - (currentTime - lastInitiatorGrowthTime)) / 1e3);
      return session.text(".cooldown", [import_koishi3.h.at(session.userId), remainingTime]);
    }
    if (user) {
      const lastTargetGrowthTime = new Date(userRecord.lastGrowthTime).getTime();
      if (isNaN(lastTargetGrowthTime)) {
        return session.text(".target-data-error-last-growth-time");
      }
      if (currentTime - lastTargetGrowthTime < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (currentTime - lastTargetGrowthTime)) / 1e3);
        return session.text(".target-cooldown", [import_koishi3.h.at(userId), remainingTime]);
      }
    }
    const originalLength = userRecord.length;
    const rateConfig = config.exerciseRate.find(
      (item) => originalLength >= item.minlength && originalLength < item.maxlength
    );
    const successRate = rateConfig ? rateConfig.rate : 50;
    const isSuccess = Math.random() * 100 < successRate;
    let growthChange = 0;
    let expectedGrowth = 0;
    let expectedReduction = 0;
    if (isSuccess) {
      const [baseGrowth, growthVariance] = config.exerciseWinGrowthRange;
      expectedGrowth = randomLength2([baseGrowth, growthVariance]);
      const growthCoefficient = 1 + userRecord.growthFactor;
      growthChange = expectedGrowth * growthCoefficient;
    } else {
      const [baseReduction, reductionVariance] = config.exerciseLossReductionRange;
      expectedReduction = randomLength2([baseReduction, reductionVariance]);
      growthChange = -expectedReduction;
    }
    const enhancedLength = originalLength + growthChange;
    userRecord.length = enhancedLength;
    userRecord.lastGrowthTime = (/* @__PURE__ */ new Date()).toISOString();
    initiatorRecord.lastGrowthTime = (/* @__PURE__ */ new Date()).toISOString();
    loggerinfo(ctx, config, `用户ID: ${userId}`);
    loggerinfo(ctx, config, `原有长度: ${originalLength.toFixed(2)} cm`);
    loggerinfo(ctx, config, `本应该的成长值: ${isSuccess ? expectedGrowth.toFixed(2) : expectedReduction.toFixed(2)} cm`);
    loggerinfo(ctx, config, `实际应用的成长值: ${growthChange.toFixed(2)} cm`);
    loggerinfo(ctx, config, `牛牛增长因数: ${userRecord.growthFactor.toFixed(2)}`);
    loggerinfo(ctx, config, `计算公式: 原有长度 + 本应该的成长值 * (1 + 牛牛增长因数) `);
    loggerinfo(ctx, config, `计算结果: ${originalLength.toFixed(2)} + ${growthChange.toFixed(2)} = ${enhancedLength.toFixed(2)} cm`);
    loggerinfo(ctx, config, `锻炼结果: ${isSuccess ? "成功" : "失败"}`);
    await ctx.database.set("impartpro", { userid: userId }, {
      length: userRecord.length,
      lastGrowthTime: userRecord.lastGrowthTime,
      channelId: await updateChannelId(ctx, userId, session.channelId)
    });
    if (user) {
      await ctx.database.set("impartpro", { userid: session.userId }, {
        lastGrowthTime: initiatorRecord.lastGrowthTime,
        channelId: await updateChannelId(ctx, session.userId, session.channelId)
      });
    }
    return session.text(isSuccess ? ".exercise-success" : ".exercise-failure", [import_koishi3.h.at(userId), enhancedLength.toFixed(2)]);
  });
}
__name(applyExerciseCommand, "applyExerciseCommand");

// src/commands/duel.ts
var import_koishi4 = require("koishi");
function randomLength3([base, variance]) {
  const min = base * (1 - variance / 100);
  const max = base * (1 + variance / 100);
  return min + Math.random() * (max - min);
}
__name(randomLength3, "randomLength");
function applyDuelCommand(ctx, config) {
  ctx.command(`impartpro/${config.commandList.command4} [user]`).example(`${config.commandList.command4} @用户`).userFields(["id", "name", "permissions"]).action(async ({ session }, user) => {
    let userId = null;
    let username = null;
    const currentTime = Date.now();
    if (!await isUserAllowed(ctx, session.userId, session.channelId)) {
      if (config.notallowtip) {
        return session.text(".not-allowed");
      }
      return;
    }
    if (user) {
      const parsedUser = import_koishi4.h.parse(user)[0];
      if (parsedUser?.type === "at") {
        const { id, name: name2 } = parsedUser.attrs;
        if (!id || session.userId === id) {
          return session.text(".invalid-user");
        }
        userId = id;
        username = name2 || (typeof session.bot.getUser === "function" ? (await session.bot.getUser(userId))?.name || userId : userId);
      } else {
        return session.text(".invalid-user-format");
      }
    } else {
      return session.text(".no-duel-target");
    }
    let [attackerRecord] = await ctx.database.get("impartpro", { userid: session.userId });
    if (!attackerRecord) {
      return session.text(".not-initialized");
    }
    let [defenderRecord] = await ctx.database.get("impartpro", { userid: userId });
    if (!defenderRecord) {
      return session.text(".target-not-initialized");
    }
    const lastAttackerTime = new Date(attackerRecord.lastDuelTime).getTime();
    const lastDefenderTime = new Date(defenderRecord.lastDuelTime).getTime();
    const cooldownTime = config.duelCooldownTime * 1e3;
    if (currentTime - lastAttackerTime < cooldownTime || currentTime - lastDefenderTime < cooldownTime) {
      const remainingAttackerTime = Math.max(0, cooldownTime - (currentTime - lastAttackerTime));
      const remainingDefenderTime = Math.max(0, cooldownTime - (currentTime - lastDefenderTime));
      const remainingTime = Math.max(remainingAttackerTime, remainingDefenderTime);
      return session.text(".duel-cooldown", [Math.ceil(remainingTime / 1e3)]);
    }
    const lengthDifference = attackerRecord.length - defenderRecord.length;
    const rateConfig = config.duelWinRateFactor.find(
      (item) => Math.abs(lengthDifference) >= item.minlength && Math.abs(lengthDifference) < item.maxlength
    );
    let baseWinRate = rateConfig ? rateConfig.rate : 50;
    const attackerIsLonger = attackerRecord.length > defenderRecord.length;
    const attackerWinProbability = attackerIsLonger ? baseWinRate - config.duelWinRateFactor2 : baseWinRate + config.duelWinRateFactor2;
    const finalWinProbability = Math.min(100, Math.max(0, attackerWinProbability));
    const isAttackerWin = Math.random() * 100 < finalWinProbability;
    let growthChange = 0;
    let reductionChange = 0;
    let currencyGain = 0;
    if (isAttackerWin) {
      const [baseGrowth, growthVariance] = config.duelWinGrowthRange;
      growthChange = randomLength3([baseGrowth, growthVariance]);
      const [baseReduction, reductionVariance] = config.duelLossReductionRange;
      reductionChange = randomLength3([baseReduction, reductionVariance]);
      attackerRecord.length += growthChange;
      defenderRecord.length -= reductionChange;
      currencyGain = reductionChange * (config.duelLossCurrency / 100);
      await updateUserCurrency(ctx, userId, currencyGain, config.currency);
    } else {
      const [baseGrowth, growthVariance] = config.duelWinGrowthRange;
      growthChange = randomLength3([baseGrowth, growthVariance]);
      const [baseReduction, reductionVariance] = config.duelLossReductionRange;
      reductionChange = randomLength3([baseReduction, reductionVariance]);
      defenderRecord.length += growthChange;
      attackerRecord.length -= reductionChange;
      currencyGain = reductionChange * (config.duelLossCurrency / 100);
      await updateUserCurrency(ctx, session.userId, currencyGain, config.currency);
    }
    attackerRecord.lastDuelTime = new Date(currentTime).toISOString();
    defenderRecord.lastDuelTime = new Date(currentTime).toISOString();
    await ctx.database.set("impartpro", { userid: session.userId }, {
      length: attackerRecord.length,
      lastDuelTime: attackerRecord.lastDuelTime,
      channelId: await updateChannelId(ctx, session.userId, session.channelId)
    });
    await ctx.database.set("impartpro", { userid: userId }, {
      length: defenderRecord.length,
      lastDuelTime: defenderRecord.lastDuelTime,
      channelId: await updateChannelId(ctx, userId, session.channelId)
    });
    loggerinfo(ctx, config, `攻击者ID: ${session.userId}, 胜率: ${finalWinProbability.toFixed(2)}%`);
    loggerinfo(ctx, config, `防御者ID: ${userId}, 胜率: ${(100 - finalWinProbability).toFixed(2)}%`);
    return session.text(".duel-result", [
      import_koishi4.h.at(session.userId),
      isAttackerWin ? "胜利" : "失败",
      import_koishi4.h.at(session.userId),
      isAttackerWin ? "增加" : "减少",
      growthChange.toFixed(2),
      import_koishi4.h.at(userId),
      isAttackerWin ? "减少" : "增加",
      reductionChange.toFixed(2),
      currencyGain.toFixed(2)
    ]);
  });
}
__name(applyDuelCommand, "applyDuelCommand");

// src/commands/reset.ts
function randomLength4([base, variance]) {
  const min = base * (1 - variance / 100);
  const max = base * (1 + variance / 100);
  return min + Math.random() * (max - min);
}
__name(randomLength4, "randomLength");
function applyResetCommand(ctx, config) {
  ctx.command(`impartpro/${config.commandList.command5}`).userFields(["id", "name", "permissions"]).action(async ({ session }) => {
    const userId = session.userId;
    const username = session.user.name || session.username;
    const initialLength = randomLength4(config.defaultLength);
    const growthFactor = Math.random();
    const currentTime = (/* @__PURE__ */ new Date()).toISOString();
    if (!await isUserAllowed(ctx, session.userId, session.channelId)) {
      if (config.notallowtip) {
        return session.text(".not-allowed");
      }
      return;
    }
    let [userRecord] = await ctx.database.get("impartpro", { userid: userId });
    if (userRecord) {
      await ctx.database.set("impartpro", { userid: userId }, {
        length: initialLength,
        growthFactor,
        lastDuelTime: currentTime,
        channelId: await updateChannelId(ctx, userId, session.channelId)
      });
      return session.text(".reset-success", [initialLength.toFixed(2), growthFactor.toFixed(2)]);
    } else {
      userRecord = {
        userid: userId,
        username,
        channelId: await updateChannelId(ctx, userId, session.channelId),
        length: initialLength,
        injectml: "0-0",
        growthFactor,
        lastGrowthTime: currentTime,
        lastDuelTime: currentTime,
        locked: false
      };
      await ctx.database.create("impartpro", userRecord);
      return session.text(".initialize-success", [initialLength.toFixed(2), growthFactor.toFixed(2)]);
    }
  });
}
__name(applyResetCommand, "applyResetCommand");

// src/commands/leaderboard.ts
var import_koishi5 = require("koishi");
function applyLeaderboardCommands(ctx, config) {
  ctx.command(`impartpro/${config.commandList.command6}`).userFields(["id", "name", "permissions"]).action(async ({ session }) => {
    if (!await isUserAllowed(ctx, session.userId, session.channelId)) {
      if (config.notallowtip) {
        return session.text(".not-allowed");
      }
      return;
    }
    const leaderboardPeopleNumber = config.leaderboardPeopleNumber || 10;
    const enableAllChannel = config.enableAllChannel;
    const currentDate = /* @__PURE__ */ new Date();
    const day = currentDate.getDate().toString();
    const records = await ctx.database.get("impartpro", {});
    const filteredRecords = enableAllChannel ? records.filter((record) => record.username !== "频道") : records.filter((record) => record.channelId?.includes(session.channelId) && record.username !== "频道");
    const validRecords = filteredRecords.map((record) => {
      if (!record.injectml) return null;
      const [date, ml] = record.injectml.split("-");
      if (date === day && !isNaN(parseFloat(ml))) {
        return {
          username: record.username || `用户 ${record.userid}`,
          milliliter: parseFloat(ml)
        };
      }
      return null;
    }).filter(Boolean);
    if (validRecords.length === 0) {
      return session.text(".no-leaderboard-data");
    }
    validRecords.sort((a, b) => b.milliliter - a.milliliter);
    const topRecords = validRecords.slice(0, leaderboardPeopleNumber);
    const rankData = topRecords.map((record, index) => ({
      order: index + 1,
      username: record.username,
      milliliter: record.milliliter.toFixed(2)
    }));
    if (config.imagemode) {
      if (!ctx.puppeteer) {
        return session.text(".puppeteer-not-enabled");
      }
      const { fontFaceStyle, customFontFamily } = await getFontStyles(ctx, config);
      const leaderboardHTML = `
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>今日注入排行榜</title>
          <style>
          ${fontFaceStyle}
          body {
          font-family: ${customFontFamily}'Microsoft YaHei', Arial, sans-serif;
          background-color: #f0f4f8;
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          }
          .container {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 30px;
          width: 100%;
          max-width: 500px;
          }
          h1 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 28px;
          }
          .ranking-list {
          list-style-type: none;
          padding: 0;
          margin: 0;
          }
          .ranking-item {
          display: flex;
          align-items: center;
          padding: 15px 10px;
          border-bottom: 1px solid #ecf0f1;
          transition: background-color 0.3s;
          }
          .ranking-item:hover {
          background-color: #f8f9fa;
          }
          .ranking-number {
          font-size: 18px;
          font-weight: bold;
          margin-right: 15px;
          min-width: 30px;
          color: #7f8c8d;
          }
          .medal {
          font-size: 24px;
          margin-right: 15px;
          }
          .name {
          flex-grow: 1;
          font-size: 18px;
          }
          .milliliter {
          font-weight: bold;
          color: #3498db;
          font-size: 18px;
          }
          .milliliter::after {
          content: ' mL';
          font-size: 14px;
          color: #95a5a6;
          }
          </style>
          </head>
          <body>
          <div class="container">
          <h1>今日注入排行榜</h1>
          <ol class="ranking-list">
          ${rankData.map((record) => `
          <li class="ranking-item">
          <span class="ranking-number">${record.order}</span>
          ${record.order === 1 ? '<span class="medal">🥇</span>' : ""}
          ${record.order === 2 ? '<span class="medal">🥈</span>' : ""}
          ${record.order === 3 ? '<span class="medal">🥉</span>' : ""}
          <span class="name">${record.username}</span>
          <span class="milliliter">${record.milliliter}</span>
          </li>
          `).join("")}
          </ol>
          </div>
          </body>
          </html>
          `;
      const page = await ctx.puppeteer.page();
      await page.setContent(leaderboardHTML, { waitUntil: "domcontentloaded" });
      const leaderboardElement = await page.$(".container");
      const boundingBox = await leaderboardElement.boundingBox();
      await page.setViewport({
        width: Math.ceil(boundingBox.width),
        height: Math.ceil(boundingBox.height)
      });
      const imgBuf = await leaderboardElement.screenshot({ captureBeyondViewport: false });
      const leaderboardImage = import_koishi5.h.image(imgBuf, "image/png");
      await page.close();
      return leaderboardImage;
    } else {
      const leaderboard = rankData.map((record) => `${record.order}. ${record.username}: ${record.milliliter} mL`).join("\n");
      return session.text(".inject-leaderboard-text", [leaderboard]);
    }
  });
  ctx.command(`impartpro/${config.commandList.command7}`).userFields(["id", "name", "permissions"]).action(async ({ session }) => {
    if (!await isUserAllowed(ctx, session.userId, session.channelId)) {
      if (config.notallowtip) {
        return session.text(".not-allowed");
      }
      return;
    }
    const leaderboardPeopleNumber = config.leaderboardPeopleNumber;
    const enableAllChannel = config.enableAllChannel;
    const records = await ctx.database.get("impartpro", {});
    const filteredRecords = enableAllChannel ? records : records.filter((record) => record.channelId?.includes(session.channelId));
    const validRecords = filteredRecords.filter((record) => record.username !== "频道");
    loggerinfo(ctx, config, validRecords.toString());
    if (validRecords.length === 0) {
      return session.text(".no-leaderboard-data");
    }
    validRecords.sort((a, b) => b.length - a.length);
    const topRecords = validRecords.slice(0, leaderboardPeopleNumber);
    const rankData = topRecords.map((record, index) => ({
      order: index + 1,
      username: record.username,
      length: record.length.toFixed(2)
    }));
    if (config.imagemode) {
      if (!ctx.puppeteer) {
        return session.text(".puppeteer-not-enabled");
      }
      const { fontFaceStyle, customFontFamily } = await getFontStyles(ctx, config);
      const leaderboardHTML = `
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>牛牛排行榜</title>
          <style>
          ${fontFaceStyle}
          body {
          font-family: ${customFontFamily}'Microsoft YaHei', Arial, sans-serif;
          background-color: #f0f4f8;
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          }
          .container {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 30px;
          width: 100%;
          max-width: 500px;
          }
          h1 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 28px;
          }
          .ranking-list {
          list-style-type: none;
          padding: 0;
          margin: 0;
          }
          .ranking-item {
          display: flex;
          align-items: center;
          padding: 15px 10px;
          border-bottom: 1px solid #ecf0f1;
          transition: background-color 0.3s;
          }
          .ranking-item:hover {
          background-color: #f8f9fa;
          }
          .ranking-number {
          font-size: 18px;
          font-weight: bold;
          margin-right: 15px;
          min-width: 30px;
          color: #7f8c8d;
          }
          .medal {
          font-size: 24px;
          margin-right: 15px;
          }
          .name {
          flex-grow: 1;
          font-size: 18px;
          }
          .length {
          font-weight: bold;
          color: #e74c3c;
          font-size: 18px;
          }
          .length::after {
          content: ' cm';
          font-size: 14px;
          color: #95a5a6;
          }
          </style>
          </head>
          <body>
          <div class="container">
          <h1>牛牛排行榜</h1>
          <ol class="ranking-list">
          ${rankData.map((record) => `
          <li class="ranking-item">
          <span class="ranking-number">${record.order}</span>
          ${record.order === 1 ? '<span class="medal">🥇</span>' : ""}
          ${record.order === 2 ? '<span class="medal">🥈</span>' : ""}
          ${record.order === 3 ? '<span class="medal">🥉</span>' : ""}
          <span class="name">${record.username}</span>
          <span class="length">${record.length}</span>
          </li>
          `).join("")}
          </ol>
          </div>
          </body>
          </html>
          `;
      const page = await ctx.puppeteer.page();
      await page.setContent(leaderboardHTML, { waitUntil: "domcontentloaded" });
      const leaderboardElement = await page.$(".container");
      const boundingBox = await leaderboardElement.boundingBox();
      await page.setViewport({
        width: Math.ceil(boundingBox.width),
        height: Math.ceil(boundingBox.height)
      });
      const imgBuf = await leaderboardElement.screenshot({ captureBeyondViewport: false });
      const leaderboardImage = import_koishi5.h.image(imgBuf, "image/png");
      await page.close();
      return leaderboardImage;
    } else {
      const leaderboard = topRecords.map((record, index) => `${index + 1}. ${record.username}: ${record.length} cm`).join("\n");
      return session.text(".leaderboard-text", [leaderboard]);
    }
  });
}
__name(applyLeaderboardCommands, "applyLeaderboardCommands");

// src/commands/query.ts
var import_koishi6 = require("koishi");
function applyQueryCommand(ctx, config) {
  ctx.command(`impartpro/${config.commandList.command8} [user]`).example(`${config.commandList.command8} @用户`).userFields(["id", "name", "permissions"]).action(async ({ session }, user) => {
    let userId = session.userId;
    let username = session.user.name || session.username;
    if (!await isUserAllowed(ctx, userId, session.channelId)) {
      if (config.notallowtip) {
        return session.text(".not-allowed");
      }
      return;
    }
    if (user) {
      const parsedUser = import_koishi6.h.parse(user)[0];
      if (parsedUser?.type === "at") {
        userId = parsedUser.attrs.id;
        username = parsedUser.attrs.name || (typeof session.bot.getUser === "function" ? (await session.bot.getUser(userId))?.name || userId : userId);
      } else {
        return session.text(".invalid-user-format");
      }
    }
    const [userRecord] = await ctx.database.get("impartpro", { userid: userId });
    const balance = await getUserCurrency(ctx, userId, config.currency);
    if (!userRecord) {
      return session.text(".user-not-initialized", [import_koishi6.h.at(userId)]);
    }
    return session.text(".user-info", [import_koishi6.h.at(userId), userRecord.length.toFixed(2), userRecord.growthFactor.toFixed(2), balance.toFixed(2)]);
  });
}
__name(applyQueryCommand, "applyQueryCommand");

// src/commands/lock.ts
var import_koishi7 = require("koishi");
function applyLockCommand(ctx, config) {
  ctx.command(`impartpro/${config.commandList.command9} [user]`).alias("开启牛牛大作战").alias("关闭牛牛大作战").example(`${config.commandList.command9} @用户`).userFields(["id", "name", "permissions"]).action(async ({ session }, user) => {
    const permissionScope = config.permissionScope;
    const onlybotownerList = config.onlybotowner_list;
    const isAllowed = checkPermission(session, permissionScope, onlybotownerList);
    if (!isAllowed) {
      return session.text(".permission-denied");
    }
    const channelId = session.channelId;
    let userId;
    let username;
    if (user) {
      const parsedUser = import_koishi7.h.parse(user)[0];
      if (parsedUser?.type === "at") {
        userId = parsedUser.attrs.id;
        username = parsedUser.attrs.name || (typeof session.bot.getUser === "function" ? (await session.bot.getUser(userId))?.name || userId : userId);
      } else {
        return session.text(".invalid-user-format");
      }
      const [record] = await ctx.database.get("impartpro", { userid: userId, channelId: { $el: channelId } });
      if (!record) {
        await ctx.database.create("impartpro", {
          userid: userId,
          username,
          channelId: [session.channelId],
          locked: true,
          length: 0,
          injectml: "0-0",
          growthFactor: 0,
          lastGrowthTime: (/* @__PURE__ */ new Date()).toISOString(),
          lastDuelTime: (/* @__PURE__ */ new Date()).toISOString()
        });
        return session.text(".user-locked", [username]);
      } else {
        const newStatus = !record.locked;
        await ctx.database.set("impartpro", { userid: userId }, { locked: newStatus });
        return session.text(newStatus ? ".user-locked" : ".user-unlocked", [username]);
      }
    } else {
      const specialUserId = `channel_${channelId}`;
      const [channelRecord] = await ctx.database.get("impartpro", { userid: specialUserId, channelId: { $el: channelId } });
      if (!channelRecord) {
        await ctx.database.create("impartpro", {
          userid: specialUserId,
          username: "频道",
          channelId: [session.channelId],
          locked: true,
          length: 0,
          injectml: "0-0",
          growthFactor: 0,
          lastGrowthTime: (/* @__PURE__ */ new Date()).toISOString(),
          lastDuelTime: (/* @__PURE__ */ new Date()).toISOString()
        });
        return session.text(".channel-locked");
      } else {
        const newStatus = !channelRecord.locked;
        await ctx.database.set("impartpro", { userid: specialUserId }, { locked: newStatus });
        return session.text(newStatus ? ".channel-locked" : ".channel-unlocked");
      }
    }
  });
}
__name(applyLockCommand, "applyLockCommand");

// src/commands/index.ts
function applyCommands(ctx, config) {
  ctx.i18n.define("zh-CN", {
    commands: {
      [config.commandList.command]: {
        description: "在群里玩牛牛相关游戏"
      },
      [config.commandList.command1]: {
        description: "注入群友",
        messages: {
          "not-allowed": "你没有权限触发这个指令。",
          "self-inject-disallowed": "不允许自己注入自己哦~ 换一个用户吧",
          "invalid-user-format": "输入的用户格式不正确，请使用 @用户 格式。",
          "no-valid-users": "未找到符合条件的用户。",
          "no-target-user": "未找到目标用户，请检查输入。",
          "target-user-not-initialized": "未找到用户 {0} 的记录。请先 开导 {0}",
          "inject-success": "现在咱将随机抽取一位幸运群友送给 {0}！\n好诶！{0} 给 {1} 注入了{2}毫升的脱氧核糖核酸，\n{1}当日的总注入量为{3}毫升"
        }
      },
      [config.commandList.command2]: {
        description: "通过花费货币来增加牛牛的长度",
        messages: {
          "not-initialized": "你还没有数据，请先进行初始化。",
          "insufficient-currency": "你的货币不足以进行保养。",
          "purchase-prompt": "你可以购买的最大长度为 {0} cm。请输入你想购买的长度：",
          "invalid-input": "输入无效，请输入一个有效的长度值。",
          "currency-not-enough-for-purchase": "你的货币不足以购买这么多长度，请输入一个较小的值。",
          "purchase-success": "你花费了 {0} 货币，增加了 {1} cm。"
        }
      },
      [config.commandList.command3]: {
        description: "让牛牛成长！",
        messages: {
          "invalid-user": "不可用的用户！请换一个用户吧~",
          "auto-initialize-success": "{0} 自动初始化成功！你的牛牛初始长度为 {1} cm。初始生长系数为：{2}",
          "data-error-last-growth-time": "用户数据有误，无法解析最后锻炼时间。",
          "cooldown": "{0} 处于冷却中，无法进行锻炼。冷却还剩 {1} 秒。",
          "target-data-error-last-growth-time": "目标用户数据有误，无法解析最后锻炼时间。",
          "target-cooldown": "{0} 处于冷却中，无法被开导。冷却还剩 {1} 秒。",
          "exercise-success": "{0} 锻炼成功！牛牛强化后长度为 {1} cm。",
          "exercise-failure": "{0} 锻炼失败！牛牛强化后长度为 {1} cm。"
        }
      },
      [config.commandList.command4]: {
        description: "决斗牛牛！",
        messages: {
          "no-duel-target": "请指定一个决斗用户！\n示例：决斗  @猫猫",
          "target-not-initialized": "目标用户还没有数据，无法进行决斗。",
          "duel-cooldown": "你或目标用户处于冷却中，无法进行决斗。\n冷却还剩 {0} 秒。",
          "duel-result": "{0} 决斗{1}！ <p>{2} {3}了 {4} cm， <p>{5} {6}了 {7} cm。<p> 战败方获得了 {8} 点经验（货币）。"
        }
      },
      [config.commandList.command5]: {
        description: "重开一个牛牛~",
        messages: {
          "reset-success": "牛牛重置成功，当前长度为 {0} cm，成长系数为 {1}。",
          "initialize-success": "牛牛初始化成功，当前长度为 {0} cm，成长系数为 {1}。"
        }
      },
      [config.commandList.command6]: {
        description: "查看注入排行榜",
        messages: {
          "no-leaderboard-data": "当前没有可用的排行榜数据。",
          "puppeteer-not-enabled": "没有开启 puppeteer 服务",
          "inject-leaderboard-text": "今日注入排行榜：\n{0}"
        }
      },
      [config.commandList.command7]: {
        description: "查看牛牛排行榜",
        messages: {
          "leaderboard-text": "牛牛排行榜：\n{0}"
        }
      },
      [config.commandList.command8]: {
        description: "查看牛牛",
        messages: {
          "user-not-initialized": "暂时没有{0} 的记录。快输入【生成牛牛】进行初始化吧",
          "user-info": "{0} 的牛牛长度为 {1} cm，成长系数为 {2} 。<p>剩余点数为：{3}"
        }
      },
      [config.commandList.command9]: {
        description: "开启/禁止牛牛大作战",
        messages: {
          "permission-denied": "你没有权限执行此操作。",
          "user-locked": "用户 {0} 已被禁止触发牛牛大作战。",
          "user-unlocked": "用户 {0} 已可以触发牛牛大作战。",
          "channel-locked": "牛牛大作战已在本频道被禁止。",
          "channel-unlocked": "牛牛大作战已在本频道开启。"
        }
      }
    }
  });
  applyInjectCommand(ctx, config);
  applyMaintenanceCommand(ctx, config);
  applyExerciseCommand(ctx, config);
  applyDuelCommand(ctx, config);
  applyResetCommand(ctx, config);
  applyLeaderboardCommands(ctx, config);
  applyQueryCommand(ctx, config);
  applyLockCommand(ctx, config);
}
__name(applyCommands, "applyCommands");

// src/index.ts
var name = "impart-pro";
var inject = {
  required: ["i18n", "database", "monetary"],
  optional: ["puppeteer", "glyph"]
};
function apply(ctx, config) {
  ctx.model.extend("impartpro", {
    userid: "string",
    username: "string",
    channelId: "list",
    length: "float",
    injectml: "string",
    growthFactor: "float",
    lastGrowthTime: "string",
    lastDuelTime: "string",
    locked: "boolean"
  }, {
    primary: ["userid"]
  });
  applyCommands(ctx, config);
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject,
  name,
  usage
});
