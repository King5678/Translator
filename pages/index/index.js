// 导入翻译工具
import { translate, ExtarctWord, SyntacticAnalysis, CulturalBackground,Summary } from '../../util/api.js'

Page({
    data: {
        inputText: '',
        translatedText: '',
        keywords: {},
        syntacticAnalysis: {},
        culturalBackground: {},
        summary:''
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
    },
    onSyntacticAnalysis() {
        const { inputText } = this.data;
        if (!inputText) {
            wx.showToast({
                title: '请输入文本',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        SyntacticAnalysis(inputText)
            .then(ExtarctedContent => {
                this.setData({
                    syntacticAnalysis: JSON.parse(ExtarctedContent)
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
    },
    onCulturalBackground() {
        const { inputText } = this.data;
        if (!inputText) {
            wx.showToast({
                title: '请输入文本',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        CulturalBackground(inputText)
            .then(ExtarctedContent => {
                this.setData({
                    culturalBackground: JSON.parse(ExtarctedContent)
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
    },
    onSummary() {
        const { inputText } = this.data;
        if (!inputText) {
            wx.showToast({
                title: '请输入文本',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        Summary(inputText)
            .then(ExtarctedContent => {
                this.setData({
                    summary: ExtarctedContent
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

