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
        displayResult: '',
        history:[]
    },
    navigateToLanguageSelection() {
        wx.navigateTo({
          url: '../../pages/choose_language/choose_language', // 根据语言选择页面的路径修改
        });
    },

    onShow() {
        const app = getApp();
        this.setData({
            asrInput: app.globalData.asrResult || '', // 确保有默认值
            ocrInput: app.globalData.ocrResult || '',  // 确保有默认值
            history: app.globalData.history || []
        });
    },
    

    onInput(event) {
        this.setData({
            inputText: event.detail.value
        });
    },

    onTranslate() {
        const app = getApp(); // 获取全局对象
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
    
                // 将输入内容保存到全局变量 history[]
                app.globalData.history.unshift(inputText);
    
                // 同步保存到本地存储
                wx.setStorage({
                    key: 'history',
                    data: app.globalData.history,
                    success: () => {
                        console.log('Input saved successfully!');
                    },
                    fail: (err) => {
                        console.error('Failed to save input:', err);
                    }
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
        const { asrInput, ocrInput,history } = this.data;
        console.log('ASR Input:', asrInput);
        console.log('OCR Input:', ocrInput);
        
        wx.showActionSheet({
            itemList: ['导入 ASR 结果', '导入 OCR 结果', '导入 历史记录'],
            success: (res) => {
                if (res.tapIndex === 0 && asrInput) {
                    this.setData({ 
                        displayResult: asrInput,
                        inputText: asrInput // 确保 inputText 跟随 displayResult
                     });
                } else if (res.tapIndex === 1 && ocrInput) {
                    this.setData({ 
                        displayResult: ocrInput,
                        inputText: ocrInput // 确保 inputText 跟随 displayResult
                     });
                }  else if (res.tapIndex === 2 && history.length > 0) {
                    this.setData({ 
                        displayResult: history[0],
                        inputText: history[0] // 确保 inputText 跟随 displayResult
                     });
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
