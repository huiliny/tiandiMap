(function($) {
  $.extend({
    // params{mapId: '',type: ''(类型：world/China),isMarker:Booleans(是否显示标记),islabel:Booleans(是否显示文字标注),url:String(请求数据url)}
    tiandiMap: function(params) {
      var map;
      var type = params.type || "China";
      var zoom; // 缩放比例
      var center = []; // 中心点设置
      var isPolygon; // 是否加载行政区划
      var isBounds; // 是否设置地图显示范围
      var isMarker = params.isMarker; // 是否显示标记信息窗
      var islabel = params.islabel; // 是否显示文字标注
      var url;               // 请求url
      var lnglats;           // 数据data
      if (type === "China") {
        zoom = 4;
        center = [104.15039, 32.24997];
        isPolygon = true;
        isBounds = true;
        url = params.url || "../../static/china1.json";
      } else if (type === "world") {
        zoom = 2;
        center = [20.51563, 30.16461];
        isPolygon = true;
        isBounds = false;
        url = params.url || "../../static/world.2.json";
      }
      var administrative;
      function onLoad() {
        //初始化地图对象
        map = new T.Map(params.mapId);
        //设置显示地图的中心点和级别
        map.centerAndZoom(new T.LngLat(center[0], center[1]), zoom);
        // 设置禁止放大缩小移动
        if(type === "China") {
          map.disableDrag();
          map.disableScrollWheelZoom();
          map.disableDoubleClickZoom();
        }
        //创建对象
        if(isPolygon) {
          administrative = new T.AdministrativeDivision();
          var config = {
            needSubInfo: true,
            needPolygon: true,
            needPre: true,
            searchType: 1,
            searchWord: "美国"
          };
          administrative.search(config, searchResult);
        }
        
        // 设置地图显示范围，超出这个范围的禁止拖动
        if (isBounds) {
          // var bounds = [65.03906, 14.51978, 165.05859, 44.52784];
          // map.setMaxBounds(
          //   new T.LngLatBounds(
          //     new T.LngLat(bounds[0], bounds[1]),
          //     new T.LngLat(bounds[2], bounds[3])
          //   )
          // );
        }
        $.ajax({
          url: url,
          type: "get",
          dataType: "json",
          data: {},
          success: function(data) {
            lnglats = data;
            if (isMarker) {
              marker(data);
            }
            if (islabel) {
              label(data);
            }
            // 监听放大缩小事件，隐藏label
            map.addEventListener("zoomend", function(e) {
              var currentZoom = e.target.getZoom();
              islabel = currentZoom < 3;
              map.clearOverLays();
              isMarker && marker(data);
              islabel && label(data);
            });
            // $(".tdt-label").each(function(i, item) {
            //   var W = $(item).width() + 10;
            //   $(item).css("height", W + "px");
            //   $(item).css("line-height", W + "px");
            // });
          }
        });
      };
      onLoad();
      // 标记点
      function marker(lnglats) {
        for (var i = 0; i < lnglats.length; i++) {
          //创建图片对象
          var icon = new T.Icon({
            iconUrl: "../../static/css/img/planceicon.png",
            iconSize: new T.Point(12, 18),
            iconAnchor: new T.Point(10, 25)
          });
          //创建标注对象
          var marker = new T.Marker(
            new T.LngLat(lnglats[i].longitude, lnglats[i].latitude-1),
            { icon: icon }
          );
          //向地图上添加标注
          map.addOverLay(marker);
          //设置标注透明度为0（与文字标注重叠）
          marker.setOpacity(1);
          // 区分参数
          var param;
          if (type === "China"){
            param = { "name": lnglats[i].name, "msg": lnglats[i].msg, "marker": marker, "icon": icon };
          } else {
            param = { "name": lnglats[i].name, "pName": lnglats[i].pName, "school": lnglats[i].school, "marker": marker, "icon": icon };
          }
          infoWin(param);
        }
      }
      // 文字标注
      function label(lnglats) {
        var label;
        for (var i = 0; i < lnglats.length; i++) {
          var latlng = new T.LngLat(lnglats[i].longitude, lnglats[i].latitude);
          label = new T.Label({
            text: lnglats[i].name,
            position: latlng,
            offset: new T.Point(-15, 0)
          });
          map.addOverLay(label);
          // 设置文字标注背景色、文字颜色、边框宽度
          label.setBackgroundColor("rgba(0,0,0,0)");
          label.setFontColor("#333");
          label.setBorderLine(0);
        }
      };
      // 信息框事件
      function infoWin(param) {
        var param2;
        if (type === "China") {
          var param2 = { "name": param.name, "msg": param.msg };
        } else {
          var param2 = { "name": param.name, "pName": param.pName, "school": param.school };
        }
        var markerInfoWin = infoWinBox(param2);
        // 给隐藏的标注添加事件
        param.marker.addEventListener("mouseover", function() {
          this.openInfoWindow(markerInfoWin);
          if (param.icon) {
            param.icon.setIconUrl("../../static/css/img/planceiconMouse.png");
          }
        });
        param.marker.addEventListener("mouseout", function() {
          this.closeInfoWindow(markerInfoWin);
          if (param.icon) {
            param.icon.setIconUrl("../../static/css/img/planceicon.png");
          }
        });
      };
      // 信息框
			function infoWinBox(param2) {
        // 创建信息框
        var markerInfoWin = new T.InfoWindow();
        if (type == "world") {
          var pName = param2.pName;
          var sContent = "<div class='common-panel' style='width: auto'><div class='panel-1 '> <div><div class='panel-list'> <span class='list-title'>人才</span><span class='list-intro' title='' style='color:#ff7800;'>" + pName + "</span><span>人</span></div></div></div></div>";
        } else {
          var msg = param2.msg;
          var name = param2.name;
          var mcontent = "";
          var sContent = "<div class='common-panel' style='width: auto'>" + name + "</div>";
          for (var i = 0; i < msg.length; i++) {
            var onlyHtml = "<h3 class='common-panel-title'><span style='color:#ff7800;'>" + msg[i].pName + " </span><br>" + msg[i].school + "</h3>";
            mcontent += onlyHtml;
          }
          var sContent = "<div class='common-panel' style='width: auto'>" + mcontent + "" + name + "</div>";
        }
        markerInfoWin.setContent(sContent);
        return markerInfoWin;
      }
      // 获取数据
      function searchResult(result) {
        if (result.getStatus() == 100) {
          var data = result.getData();
          showMsg(data, lnglats);
        } else {
          result.getMsg();
        }
      }
      // 展示数据
      function showMsg(data, lnglats) {
          console.log(data, lnglats)
        var pName;
        for (var i = 0; i < lnglats.length; i++) {
          pName = lnglats[i].PName;
        }
        for (var i = 0; i < data.length; i++) {
          if (data[i].points) {
            //绘制行政区划
            polygon(data[i].points, data[i].name);
          }
          //解释下级行政区划
          if (data[i].child) {
            showMsg(data[i].child, lnglats);
            if (data[i].child.points) {
              //绘制行政区划
              polygon(data[i].child.points, data[i].child.name);
            }
          }
        }
      }
      //生成随机正整数 1到n之间。
      function getRandom(n) {
        return Math.floor(Math.random() * n + 1);
      }
      // 绘制行政区划
      function polygon(points, name) {
        var pointsArr = [];
        var opacity = getRandom(50) / 100;
        //var color = ["#EEC591", "#EEAD0E", "#EE7600", "#F08080", "#EE6A50", "#DC143C"];
        for (var i = 0; i < points.length; i++) {
          var regionLngLats = [];
          var regionArr = points[i].region.split(",");
          for (var m = 0; m < regionArr.length; m++) {
            var lnglatArr = regionArr[m].split(" ");
            var lnglat = new T.LngLat(lnglatArr[0], lnglatArr[1]);
            regionLngLats.push(lnglat);
            pointsArr.push(lnglat);
          }
          //var colorRandom = Math.floor(Math.random() * 6);
          //创建面对象
          var polygon = new T.Polygon(regionLngLats, {
            color: "#0035da",
            weight: 1,
            opacity: 1,
            fillColor: "#008cfe",
            fillOpacity: opacity
          });
          //向地图上添加行政区划面
          if (isPolygon) {
            map.addOverLay(polygon);
          }
          var markerInfoWin = new T.InfoWindow();
          var sContent =
            "<div class='common-panel' style='width: auto'><h3 class='common-panel-title'>" +
            name +
            "</h3><div class='panel-list'> <span class='list-title'>中学：</span><span class='list-intro' title=''>2222</span></div></div>";
          markerInfoWin.setContent(sContent);
          polygon.addEventListener("mouseover", function(e) {
            //
            this.setStyle({
              dashArray: "0",
              weight: 2,
              color: "#0035da",
              opacity: 1
            });
            // 面悬浮信息框
            // if (!isMarker) {
            //   polygon.openInfoWindow(markerInfoWin);
            // }

          });
          polygon.addEventListener("click", function(e) {
            layer.open({
              type: 1,
              title: "用户登录",
              area: "450px",
              shadeClose: true,
              content: $("#userLogin-dialog")
            });
          });
          polygon.addEventListener("mouseout", function(e) {
            this.setStyle({
              dashArray: "0",
              weight: 1,
              color: "#0035da",
              opacity: 1
            });
          });
        }
        //显示最佳比例尺
        //map.setViewport(pointsArr);
      }
    }
  });
})(jQuery);
