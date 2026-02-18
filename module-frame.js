(function () {
  function toHttp(url) {
    if (!url) return "";
    if (url.indexOf("ipfs://") === 0) {
      return "https://ipfs.io/ipfs/" + url.slice("ipfs://".length);
    }
    return url;
  }

  var params = new URLSearchParams(window.location.search);
  var index = Number(params.get("i") || 0);
  var modules = window.MODULES || [];
  var mod = modules[index] || {};
  var rawDesc = mod.description || "";
  var hideMancelCredit = /^created\s+by\s+mancel$/i.test(rawDesc.trim());

  document.getElementById("name").textContent = mod.name || "Untitled module";
  document.getElementById("desc").textContent = hideMancelCredit ? "" : (rawDesc || "node signal");

  var mediaWrap = document.getElementById("mediaWrap");
  var videoUrl = toHttp(mod.animation || mod.animation_url);
  var imageUrl = toHttp(mod.image || mod.image_url);

  if (videoUrl) {
    var video = document.createElement("video");
    video.className = "media";
    video.src = videoUrl;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    mediaWrap.appendChild(video);
    return;
  }

  if (imageUrl) {
    var image = document.createElement("img");
    image.className = "media";
    image.src = imageUrl;
    image.alt = mod.name || "module image";
    mediaWrap.appendChild(image);
    return;
  }

  mediaWrap.textContent = "No media";
})();
