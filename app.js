App({
  onLaunch: function () {
    // 展示本地存储能力
    wx.getStorage({
      key: 'history',
      success: (res) => {
        this.globalData.history = res.data
      },
      fail: (res) => {
        console.log("get storage failed");
        console.log(res);
        // 初始化 history 并存储到本地
        this.globalData.history = [];
        wx.setStorage({
          key: 'history',
          data: this.globalData.history,
          success: () => {
            console.log("Initialized history in local storage.");
          },
          fail: (err) => {
            console.log("Failed to initialize history.");
            console.log(err);
          }
        });
      }
    });
  },

  getRecordAuth: function () {
    wx.getSetting({
      success(res) {
        console.log("succ");
        console.log(res);
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              console.log("succ auth");
            },
            fail() {
              console.log("fail auth");
            }
          });
        } else {
          console.log("record has been authed");
        }
      },
      fail(res) {
        console.log("fail");
        console.log(res);
      }
    });
  },

  onHide: function () {
    wx.stopBackgroundAudio();
  },

  globalData: {
    history: [],
    picBase64: "",
    asrResult: '',
    ocrResult: ''
  }
});
