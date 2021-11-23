jQuery(document).ready(function () {
  var target = document.querySelector(".locations-map");
  if (!target) return;

  var mapKey = target.getAttribute("map-key");
  var vendor = target.getAttribute("vendor") || "kvass";
  var theme = target.getAttribute("theme") || "#013552";

  var scriptSrc =
    "//maps.googleapis.com/maps/api/js?key=" + mapKey + "&ver=3.13.2";
  var baseSrc =
    "https://cdn.jsdelivr.net/gh/Kvass-App/kvass-projects-map@master";
  var gitSrc =
    "https://raw.githubusercontent.com/Kvass-App/kvass-projects-map/master/";
  var assetSrc = gitSrc + "/assets/" + vendor;
  var markers = {
    dot: {
      url: assetSrc + "/map-marker-dot-main.png",
      center: [5, 5],
    },
    default: {
      url: assetSrc + "/map-marker.png",
      center: [12.5, 33],
    },
    featured: {
      url: assetSrc + "/map-marker-featured.png",
      center: [17.5, 47],
    },
  };

  function LoadScript(src, callback) {
    if (document.querySelector('[src="' + src + '"')) return callback();

    var t = document.createElement("script");
    t.src = src;
    t.type = "text/javascript";
    t.addEventListener("load", callback);

    document.body.appendChild(t);
  }

  function initialize() {
    if (!(typeof google === "object" && typeof google.maps === "object"))
      return;

    //google.maps.event.addDomListener(window, "resize", initialize);

    var styles = {
      flatsome: [
        {
          featureType: "road",
          stylers: [{ visibility: "on" }, { hue: theme }],
        },
        {
          featureType: "water",
          stylers: [{ visibility: "on" }, { color: theme }],
        },
        {
          stylers: [{ visibility: "on" }, { hue: theme }, { saturation: 50 }],
        },
        {
          elementType: "labels",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
      ],
    };

    var latlngbounds = new google.maps.LatLngBounds();
    var center = new google.maps.LatLng(59.913868, 10.752245);
    var myOptions = {
      zoom: 7,
      center,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      mapTypeId: "flatsome",
      draggable: true,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
      },
      mapTypeControl: false,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
      },
      streetViewControl: false,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
      },
      scrollwheel: false,
      disableDoubleClickZoom: true,
    };
    var map = new google.maps.Map(target, myOptions);
    var styledMapType = new google.maps.StyledMapType(styles["flatsome"], {
      name: "flatsome",
    });

    map.mapTypes.set("flatsome", styledMapType);

    var openInfoWindows = [];
    fetch(gitSrc + "/data/" + vendor + ".json")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        data.forEach((project) => {
          let markerType = "dot";
          if (project.url) markerType = "default";
          if (project.featured) markerType = "featured";

          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(
              project.coordinates[1],
              project.coordinates[0]
            ),
            icon: {
              labelOrigin: new google.maps.Point(
                markers[markerType].center[0],
                markers[markerType].center[1]
              ),
              url: markers[markerType].url,
            },
            map: map,
            title: project.name,
          });

          var info = new google.maps.InfoWindow({
            content: `</p>
<div class="locations-map-info" style="max-width:410px;">${
              project.cover
                ? `<img style="max-width:410px" src="${project.cover}" />`
                : ""
            }
<div style="color: #333333;">${
              project.description ? `${project.description}` : ""
            }</div>
<a href="${
              project.url
            }" target="_blank" class="button primary" style="border-radius:5px;"><span>Gå til ${
              project.name
            }</span>
</a></div>
<p>`,
          });

          if (markerType !== "dot")
            marker.addListener("click", function () {
              openInfoWindows.forEach(function (i) {
                i.close();
              });
              openInfoWindows = [];
              info.open(map, marker);
              openInfoWindows.push(info);
            });

          latlngbounds.extend(marker.position);
        });

        map.setCenter(latlngbounds.getCenter());
        map.fitBounds(latlngbounds);
      });
  }

  LoadScript(scriptSrc, initialize);
});
