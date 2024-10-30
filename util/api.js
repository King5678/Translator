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
