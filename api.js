const apiKey = 'sk-4fdba1b308d34ebeb4a389e6265136c4';

export function translate(q, { from = 'auto', to = 'auto' } = { from: 'auto', to: 'auto' }) {
    return new Promise((resolve, reject) => {
        // 设置请求的 payload 数据
        const payload = {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: `请将以下文本从${from}翻译成${to}：${q}` }
            ],
            stream: false
        };

        // 发起 wx.request 请求
        wx.request({
            url: 'https://api.deepseek.com/chat/completions',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            data: payload, // 直接传递对象数据
            timeout: 10000, // 设置超时时间，单位为毫秒
            success(res) {
                if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0].message.content) {

                    // 提取并返回 DeepSeek 的翻译结果
                    const translatedContent = res.data.choices[0].message.content;
                    resolve(translatedContent);
                } else {
                    // 处理 DeepSeek API 返回数据不完整的情况
                    reject({ status: 'error', msg: '翻译失败，状态码：' + res.statusCode });
                    wx.showToast({
                        title: '翻译失败',
                        icon: 'none',
                        duration: 3000
                    });
                }
            },
            fail(err) {
                // 请求失败处理，包含具体错误消息
                reject({ status: 'error', msg: `请求失败：${err.errMsg}` });
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    });
}

export function ExtarctWord(q, { from = 'auto', to = 'auto' } = { from: 'auto', to: 'auto' }) {
    return new Promise((resolve, reject) => {
        // 设置请求的 payload 数据
        const payload = {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user", content: `你的任务是从以下输入文本中提取高阶水平的难词，例如英文的托福词汇，并提供简要解释。请确保提取的词汇符合能够使高水平的学生学到新词汇。

关键词数量：5-8个关键词，视文本长度和复杂程度而定,至少返回5个词汇。
结果格式：
关键词1：关键词的解释（使用简洁的${from}解释和${to}翻译/示例）
关键词2：关键词的解释（使用简洁的${from}解释和${to}翻译/示例）
……
解释要求：
全面地说明关键词的含义，并结合对应语言高阶水平的词汇和表达，例如英文的托福表达
如涉及专业术语，可用通俗语言解释
如有必要，可提供简短的示例句
用json格式返回
示例：
{
  "关键词1": {
    "Word": "Exacerbate",
    "Explain": "加剧，使恶化 —— 指某种情况或问题变得更严重。例如：Air pollution can exacerbate respiratory diseases.（空气污染可能会加重呼吸道疾病。）"
  },
  "关键词2": {
    "Word": "Ambiguous",
    "Explain": "模棱两可的，含糊不清的 —— 指有多重理解或解释的情况。例如：The contract contains ambiguous terms that could lead to disputes.（合同中含有模棱两可的条款，可能会引起争议。）"
  }
}
输入文本：${q}
` }
            ],
            stream: false
        };

        // 发起 wx.request 请求
        wx.request({
            url: 'https://api.deepseek.com/chat/completions',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            data: payload, // 直接传递对象数据
            timeout: 60000, // 设置超时时间，单位为毫秒
            success(res) {
                if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0].message.content) {

                    // 提取并返回 DeepSeek 的翻译结果
                    const ExtarctedContent = res.data.choices[0].message.content.replace(/^```json|```$/g, "");
                    console.log(ExtarctedContent)
                    resolve(ExtarctedContent);
                } else {
                    // 处理 DeepSeek API 返回数据不完整的情况
                    reject({ status: 'error', msg: '提取失败，状态码：' + res.statusCode });
                    wx.showToast({
                        title: '提取失败',
                        icon: 'none',
                        duration: 3000
                    });
                }
            },
            fail(err) {
                // 请求失败处理，包含具体错误消息
                reject({ status: 'error', msg: `请求失败：${err.errMsg}` });
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    });
}
export function SyntacticAnalysis(q, { from = 'auto', to = 'auto' } = { from: 'auto', to: 'auto' }) {
    return new Promise((resolve, reject) => {
        // 设置请求的 payload 数据
        const payload = {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user", content: `
目标： 分析以下句子，指出其语法结构，并简要解释关键语法点。结果应适合学生阅读。
输入句子语言：${from}，预期输出的解释语言：${to}
输入句子： ${q}
输出格式：
句子结构： 将句子分解为主语、谓语、宾语等主要成分，并用括号标注。
关键语法点： 解释句子中使用的 1-4 个关键语法点，例如时态、语态、从句类型等。
例句 (可选)： 提供一个使用相同语法点的简单例句，帮助理解。
示例：
输入句子： The cat chased the mouse.
输出, 以json格式：
{
    "sentence_structure":"(The cat) (chased) (the mouse)",
    "key_grammar_points": [
        "这是一个简单句，主语是 [The cat]，谓语是 [chased]，宾语是 [the mouse]"
    ],
    "example_sentence":"The dog barked loudly. (主语：The dog，谓语：barked，副词：loudly)"
}
` }
            ],
            stream: false
        };

        // 发起 wx.request 请求
        wx.request({
            url: 'https://api.deepseek.com/chat/completions',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            data: payload, // 直接传递对象数据
            timeout: 60000, // 设置超时时间，单位为毫秒
            success(res) {
                if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0].message.content) {

                    // 提取并返回 DeepSeek 的翻译结果
                    const ExtarctedContent = res.data.choices[0].message.content.replace(/^```json|```$/g, "");
                    console.log(ExtarctedContent)
                    resolve(ExtarctedContent);
                } else {
                    // 处理 DeepSeek API 返回数据不完整的情况
                    reject({ status: 'error', msg: '分析失败，状态码：' + res.statusCode });
                    wx.showToast({
                        title: '分析失败',
                        icon: 'none',
                        duration: 3000
                    });
                }
            },
            fail(err) {
                // 请求失败处理，包含具体错误消息
                reject({ status: 'error', msg: `请求失败：${err.errMsg}` });
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    });
}
export function CulturalBackground(q, { from = 'auto', to = 'auto' } = { from: 'auto', to: 'auto' }) {
    return new Promise((resolve, reject) => {
        // 设置请求的 payload 数据
        const payload = {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user", content: `
目标： 请分析以下句子背后的文化背景，并以JSON格式返回3-4个要点，结果应适合学生阅读。
输入句子语言：${from}，预期输出的解释语言：${to}
输入句子： ${q}
输出格式：
示例：
输入句子： In the United States, people celebrate Thanksgiving by gathering with family and friends, and eating a large meal that typically includes turkey.
输出, 以json格式：
{
      "关键词1":{
        "name": "感恩节",
        "description": "感恩节是美国的一个全国性节日，在11月的第四个星期四庆祝。它起源于丰收节，具有宗教和文化传统的历史根源。",
        "related_customs": ["家庭聚会", "盛宴", "游行", "橄榄球比赛"]
      },
      "关键词2":{
        "name": "传统感恩节大餐",
        "description": "美国传统的感恩节大餐通常包括火鸡、 stuffing（填料）、土豆泥、蔓越莓酱和南瓜派。这顿饭象征着感恩和丰盛。",
        "related_customs": ["烹饪火鸡", "准备配菜", "烘焙甜点"]
      }
}
` }
            ],
            stream: false
        };

        // 发起 wx.request 请求
        wx.request({
            url: 'https://api.deepseek.com/chat/completions',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            data: payload, // 直接传递对象数据
            timeout: 60000, // 设置超时时间，单位为毫秒
            success(res) {
                if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0].message.content) {

                    // 提取并返回 DeepSeek 的翻译结果
                    const ExtarctedContent = res.data.choices[0].message.content.replace(/^```json|```$/g, "");
                    console.log(ExtarctedContent)
                    resolve(ExtarctedContent);
                } else {
                    // 处理 DeepSeek API 返回数据不完整的情况
                    reject({ status: 'error', msg: '分析失败，状态码：' + res.statusCode });
                    wx.showToast({
                        title: '分析失败',
                        icon: 'none',
                        duration: 3000
                    });
                }
            },
            fail(err) {
                // 请求失败处理，包含具体错误消息
                reject({ status: 'error', msg: `请求失败：${err.errMsg}` });
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    });
}
export function Summary(q, { from = 'auto', to = 'auto' } = { from: 'auto', to: 'auto' }) {
    return new Promise((resolve, reject) => {
        // 设置请求的 payload 数据
        const payload = {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user", content: `
目标： 请简要总结提炼输入外语语料，结果应适合学生阅读。
输入句子语言：${from}，预期输出的解释语言：${to}
输入句子： ${q}
` }
            ],
            stream: false
        };

        // 发起 wx.request 请求
        wx.request({
            url: 'https://api.deepseek.com/chat/completions',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            data: payload, // 直接传递对象数据
            timeout: 60000, // 设置超时时间，单位为毫秒
            success(res) {
                if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0].message.content) {

                    // 提取并返回 DeepSeek 的翻译结果
                    const ExtarctedContent = res.data.choices[0].message.content.replace(/^```json|```$/g, "");
                    console.log(ExtarctedContent)
                    resolve(ExtarctedContent);
                } else {
                    // 处理 DeepSeek API 返回数据不完整的情况
                    reject({ status: 'error', msg: '分析失败，状态码：' + res.statusCode });
                    wx.showToast({
                        title: '分析失败',
                        icon: 'none',
                        duration: 3000
                    });
                }
            },
            fail(err) {
                // 请求失败处理，包含具体错误消息
                reject({ status: 'error', msg: `请求失败：${err.errMsg}` });
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    });
}