// 导入翻译工具
import { translate, ExtarctWord } from '../../util/api.js'

Page({
    data: {
        inputText: '',
        translatedText: '',
        keywords:{}
    },

    onInput(event) {
        this.setData({
            inputText: event.detail.value
        });
    },

    onTranslate() {
        const { inputText } = this.data;
        if (!inputText) {
            wx.showToast({
                title: '请输入文本',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        translate(inputText)
            .then(translatedContent => {
                this.setData({
                    translatedText: translatedContent
                });
            })
            .catch(err => {
                console.error(err);
                wx.showToast({
                    title: '翻译失败',
                    icon: 'none',
                    duration: 3000
                });
            });
    },

    onExtarctWord() {
        const { inputText } = this.data;
        if (!inputText) {
            wx.showToast({
                title: '请输入文本',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        ExtarctWord(inputText)
            .then(ExtarctedContent => {
                this.setData({
                    keywords: JSON.parse(ExtarctedContent)
                });
            })
            .catch(err => {
                console.error(err);
                wx.showToast({
                    title: '提取失败',
                    icon: 'none',
                    duration: 3000
                });
            });
    }
});

