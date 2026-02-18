(function () {
  var grid = document.getElementById("grid");
  var modules = window.MODULES || [];

  modules.forEach(function (module, index) {
    var tile = document.createElement("div");
    tile.className = "tile";

    var frame = document.createElement("iframe");
    frame.loading = "lazy";
    frame.src = "./module-frame.html?i=" + index;
    frame.title = module.name || "module-" + (index + 1);
    tile.appendChild(frame);
    grid.appendChild(tile);
  });
})();
