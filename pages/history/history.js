Page({
  data: {
      historyList: [] // 用于存储历史记录
  },

  onShow() {
      const app = getApp(); // 获取全局对象
      this.setData({
          historyList: app.globalData.history || [] // 每次页面显示时更新历史记录
      });
  },

  clearHistory() {
      const app = getApp();
      wx.showModal({
          title: '清空历史',
          content: '确定清空所有历史记录吗？',
          success: (res) => {
              if (res.confirm) {
                  app.globalData.history = []; // 清空全局记录
                  wx.setStorage({
                      key: 'history',
                      data: [], // 同步清空本地存储
                      success: () => {
                          this.setData({ historyList: [] }); // 更新页面显示
                          wx.showToast({
                              title: '历史记录已清空',
                              icon: 'success',
                              duration: 2000
                          });
                      },
                      fail: (err) => {
                          console.error('Failed to clear history:', err);
                      }
                  });
              }
          }
      });
  }
});
