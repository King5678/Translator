// 获取全局应用程序实例对象
const app = getApp();

// 定义页面
Page({
    /**
     * 页面的初始数据
     */
    data: {
        src: "", // 图片源
        sourceText: [], // 文本
        picBase64: '', // 图片的base64编码
    },

    // 页面显示时的回调函数
    onShow: function() {
        // 如果全局变量中的图片base64编码不为空
        if (app.globalData.picBase64 != "") {
            // 更新数据
            this.setData({
                src: app.globalData.picBase64,
            });
            this.getOCR(); // 自动调用 OCR
        }
    },

    // 上传图片的函数
    uploadImg: function() {
        const that = this;
        wx.chooseImage({
            count: 1,
            success(res) {
                const tempFilePaths = res.tempFilePaths;
                wx.getFileSystemManager().readFile({
                    filePath: tempFilePaths[0],
                    encoding: 'base64',
                    success(readRes) {
                        app.globalData.picBase64 = readRes.data; // 保存到全局变量
                        that.setData({
                            src: readRes.data,
                        });
                        that.getOCR(); // 调用 OCR
                    },
                    fail(error) {
                        console.error('读取图片失败:', error);
                    }
                });
            },
            fail(error) {
                console.error('选择图片失败:', error);
            }
        });
    },

    // 获取OCR的函数
    getOCR: function() {
        var that = this;

        // 获取 Access Token
        this.getAccessToken().then(token => {
            wx.request({
                url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=' + token,
                data: {
                    image: this.data.src, // 假设 src 是 base64 格式的图片
                    detect_direction: 'false',
                    detect_language: 'false',
                    paragraph: 'false',
                    probability: 'false'
                },
                method: 'post',
                header: {
                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                success: function(res) {
                    console.log(res);
                    if (res.data && res.data.words_result) {
                        that.setData({
                            sourceText: res.data.words_result.map(item => item.words) // 提取文字
                        });
                        app.globalData.ocrResult = that.data.sourceText;
                    }
                },
                fail: function(res) {
                    console.log(res);
                }
            });
        }).catch(error => {
            console.error('获取 Access Token 失败:', error);
        });
    },

    // 获取 Access Token 的函数
    getAccessToken: function() {
        return new Promise((resolve, reject) => {
            var AK = "#";
            var SK = "#";

            wx.request({
                url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK,
                method: 'POST',
                success: function(res) {
                    if (res.data && res.data.access_token) {
                        resolve(res.data.access_token);
                    } else {
                        reject('获取 Access Token 失败');
                    }
                },
                fail: function(error) {
                    reject(error);
                }
            });
        });
    }
});
