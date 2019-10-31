// pages/movies/movies.js
var util = require('../../utils/util.js')
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inTheaters: {},
    comingSoon: {},
    top250: {},
    searchResult: {},
    containerShow: true,
    searchPanelShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var inTheatersUrl = app.globalData.doubanBase +
      "/v2/movie/in_theaters?apikey=" + app.globalData.doubanapikey + "&start=0&count=3";
    var comingSoonUrl = app.globalData.doubanBase +
      "/v2/movie/coming_soon?apikey=" + app.globalData.doubanapikey + "&start=0&count=3";
    var top250Url = app.globalData.doubanBase +
      "/v2/movie/top250?apikey=" + app.globalData.doubanapikey + "&start=0&count=3";

    this.getMovieListData(inTheatersUrl, "inTheaters", "正在热映");
    this.getMovieListData(comingSoonUrl, "comingSoon", "即将上映");
    this.getMovieListData(top250Url, "top250", "豆瓣Top250");
  },

  getMovieListData: function(url, moviekey, categoryTitle) {
    var that = this;
    wx.request({
      url: url,
      method: 'GET',
      header: {
        "Content-Type": "application/xml"
      },
      success: function(res) {
        console.log(res.data);
        that.processDoubanData(res.data, moviekey, categoryTitle);
      },
      fail: function(error) {
        console.log(error);
      },
      complete: function() {

      }
    });
  },

  processDoubanData: function(moviedouban, moviekey, categoryTitle) {
    var movies = [];
    for (var idx in moviedouban.subjects) {
      var subject = moviedouban.subjects[idx];
      var title = subject.title;
      if (title.length > 6) {
        title = title.substring(0, 6) + "..."
      };
      var temp = {
        stars: util.convertToStarsArray(subject.rating.stars),
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id
      }
      movies.push(temp);
    };
    var readyData = {};
    readyData[moviekey] = {
      categoryTitle: categoryTitle,
      movies: movies
    };
    this.setData(readyData);
  },

  moreTap: function(event) {
    var category = event.currentTarget.dataset.category;
    wx.navigateTo({
      url: 'more-movie/more-movie?category=' + category,
    });
  },

  onMovieTap: function(event) {
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: "movie-detail/movie-detail?id=" + movieId,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  onCancelImgTap: function() {
    this.setData({
      searchResult: {},
      containerShow: true,
      searchPanelShow: false,
    });
  },

  onBindFocus: function(event) {
    this.setData({
      containerShow: false,
      searchPanelShow: true,
    })
  },

  onBindBlur: function(event) {
    //搜索接口坏掉了,看看效果
    var text = event.detail.value;
    // var searchUrl = app.globalData.doubanBase + "/v2/movie/search?q=" + text + "&apikey=" + app.globalData.doubanapikey;
    var searchUrl = app.globalData.doubanBase +
      "/v2/movie/coming_soon?apikey=" + app.globalData.doubanapikey + "&start=0&count=20";
    this.getMovieListData(searchUrl, "searchResult", "");
    console.log(text);
  }
})