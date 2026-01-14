/**
 * 用于在主页显示随机问候语的短语库
 */

export interface Phrase {
  text: string;
  timeOfDay?: "morning" | "afternoon" | "evening" | "any";
}

/**
 * 获取当前时间段
 * @returns {'morning' | 'afternoon' | 'evening'} 当前时间段
 */
export function getCurrentTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "morning"; // 早上: 5:00 - 11:59
  } else if (hour >= 12 && hour < 18) {
    return "afternoon"; // 中午: 12:00 - 17:59
  } else {
    return "evening"; // 晚上: 18:00 - 4:59
  }
}

/** 按时间段分类 */
export const phrasesByTime: Record<"morning" | "afternoon" | "evening" | "any", Phrase[]> = {
  morning: [
    { text: "早上好！新的一天开始啦", timeOfDay: "morning" },
    { text: "早安，今天也要元气满满哦", timeOfDay: "morning" },
    { text: "早上好，我们赶快出发吧，这世上有太多的东西都是「过时不候」的呢", timeOfDay: "morning" },
  ],
  afternoon: [
    { text: "中午好！休息一下吧", timeOfDay: "afternoon" },
    { text: "午后时光，适合放松一下", timeOfDay: "afternoon" },
    { text: "午休时间到，我想喝树莓薄荷饮。用两个和太阳有关的故事和你换，好不好", timeOfDay: "afternoon" },
  ],
  evening: [
    { text: "晚上好！", timeOfDay: "evening" },
    { text: "夜幕降临，该休息了", timeOfDay: "evening" },
    { text: "星空下的问候", timeOfDay: "evening" },
    { text: "太阳落山啦，我们也该把舞台让给夜行的大家族了", timeOfDay: "evening" },
    { text: "快去睡吧，放心，我已经为你准备好甜甜的梦啦", timeOfDay: "evening" },
  ],
  any: [
    { text: "欢迎回来", timeOfDay: "any" },
    { text: "今天过得怎么样", timeOfDay: "any" },
    { text: "很高兴见到你", timeOfDay: "any" },
    { text: "愿你有个美好的一天", timeOfDay: "any" },
    { text: "放松一下", timeOfDay: "any" },
    { text: "今天也要加油哦", timeOfDay: "any" },
    { text: "不知道干什么的话，要不要我带你去转转呀", timeOfDay: "any" },
    { text: "又有心事吗？我来陪你一起想吧", timeOfDay: "any" },
    { text: "果然要亲眼去看，才能感受到世界的美", timeOfDay: "any" },
    { text: "变聪明啦~", timeOfDay: "any" },
    { text: "手牵手~", timeOfDay: "any" },
    { text: "知识，与你分享", timeOfDay: "any" },
    { text: "好奇心值得嘉奖哦", timeOfDay: "any" },
    { text: "我等你好久啦", timeOfDay: "any" },
  ],
};

/**
 * 获取当前时间段可用的所有短语
 * @returns {Phrase[]} 当前时间段可用的短语数组
 */
export function getPhrasesForCurrentTime(): Phrase[] {
  const timeOfDay = getCurrentTimeOfDay();
  const timeSpecificPhrases = phrasesByTime[timeOfDay];
  const anyTimePhrases = phrasesByTime.any;

  return [...timeSpecificPhrases, ...anyTimePhrases];
}

/**
 * 从当前时间段的短语库中随机获取一个短语
 * @returns {Phrase} 随机短语对象
 */
export function getRandomPhrase(): Phrase {
  const availablePhrases = getPhrasesForCurrentTime();
  const randomIndex = Math.floor(Math.random() * availablePhrases.length);
  return availablePhrases[randomIndex];
}

/**
 * 获取随机短语文本
 * @returns {string} 随机短语文本
 */
export function getFormattedRandomPhrase(): string {
  const phrase = getRandomPhrase();
  return phrase.text;
}

/**
 * 获取指定数量的随机短语（不重复）
 * @param count 需要获取的短语数量
 * @returns {Phrase[]} 随机短语数组
 */
export function getRandomPhrases(count: number): Phrase[] {
  const availablePhrases = getPhrasesForCurrentTime();

  if (count >= availablePhrases.length) {
    // 如果需要的数量大于等于总数量，直接返回打乱后的所有短语
    return [...availablePhrases].sort(() => Math.random() - 0.5);
  }

  const shuffled = [...availablePhrases].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
