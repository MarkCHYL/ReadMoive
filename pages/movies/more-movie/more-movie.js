// pages/movies/more-movie/more-movie.js
var app = getApp()
var util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movies: {},
    navigateTitle: "",
    requestUrl: "",
    totalCount: 0,
    isEmpty: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var category = options.category;
    this.data.navigateTitle = category;
    console.log(category);
    var dataUrl = "";
    switch (category) {
      case "正在热映":
        dataUrl = app.globalData.doubanBase +
          "/v2/movie/in_theaters?apikey=" + app.globalData.doubanapikey;
        break;
      case "即将上映":
        dataUrl = app.globalData.doubanBase +
          "/v2/movie/coming_soon?apikey=" + app.globalData.doubanapikey;
        break;
      case "豆瓣Top250":
        dataUrl = app.globalData.doubanBase + "/v2/movie/top250?apikey=" + app.globalData.doubanapikey;
        break;
    }

    wx.setNavigationBarTitle({
      title: this.data.navigateTitle,
    });
    this.data.requestUrl = dataUrl;
    util.http(dataUrl, this.processDoubanData);
  },

  processDoubanData: function(moviedouban) {
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
    var totalMovies = {}

    //如果要绑定新加载的数据，那么需要同旧有的数据合并在一起
    if (!this.data.isEmpty) {
      totalMovies = this.data.movies.concat(movies);
    } else {
      totalMovies = movies;
      this.data.isEmpty = false;
    }
    this.setData({
      movies: totalMovies
    });
    this.data.totalCount += 20;
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },

  onScrollLower: function(event) {
    // console.log("加载更多");
    var nextUrl = this.data.requestUrl + "&start=" + this.data.totalCount + "&count=20"
    util.http(nextUrl, this.processDoubanData);
    wx.showNavigationBarLoading();
  },
  
  onPullDownRefresh:function(event){
    var refreshUrl = this.data.requestUrl + "&start=0&count=20";
    this.data.movies = {};
    this.data.isEmpty = true;
    this.totalCount = 0;
    util.http(refreshUrl,this.processDoubanData);
    wx.showNavigationBarLoading();
  },

  onMovieTap: function (event) {
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: "../movie-detail/movie-detail?id=" + movieId,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
})