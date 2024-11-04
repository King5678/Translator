// 导入翻译工具
import { translate, ExtractWord, SyntacticAnalysis, CulturalBackground, Summary } from './api.js';

Page({
    data: {
        inputText: '',
        translatedText: '',
        keywords: {},
        syntacticAnalysis: {},
        culturalBackground: {},
        summary: '',
        asrInput: '',
        ocrInput: '',
        displayResult: ''
    },

    onShow() {
        const app = getApp();
        this.setData({
            asrInput: app.globalData.asrResult || '', // 确保有默认值
            ocrInput: app.globalData.ocrResult || ''  // 确保有默认值
        });
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

    chooseResult() {
        const { asrInput, ocrInput } = this.data;
        console.log('ASR Input:', asrInput);
        console.log('OCR Input:', ocrInput);
        
        wx.showActionSheet({
            itemList: ['显示 ASR 结果', '显示 OCR 结果'],
            success: (res) => {
                if (res.tapIndex === 0 && asrInput) {
                    this.setData({ displayResult: asrInput });
                } else if (res.tapIndex === 1 && ocrInput) {
                    this.setData({ displayResult: ocrInput });
                } else {
                    wx.showToast({
                        title: '没有可用的结果',
                        icon: 'none',
                        duration: 2000
                    });
                }
            },
            fail: (err) => {
                console.log(err.errMsg);
            }
        });
    },

    onExtractWord() {
        const { inputText } = this.data;
        if (!inputText) {
            wx.showToast({
                title: '请输入文本',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        ExtractWord(inputText)
            .then(extractedContent => {
                this.setData({
                    keywords: JSON.parse(extractedContent)
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
            .then(extractedContent => {
                this.setData({
                    syntacticAnalysis: JSON.parse(extractedContent)
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
            .then(extractedContent => {
                this.setData({
                    culturalBackground: JSON.parse(extractedContent)
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
            .then(extractedContent => {
                this.setData({
                    summary: extractedContent
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
