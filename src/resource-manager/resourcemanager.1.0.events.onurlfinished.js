// Autogenerated by hob
window.cls || (window.cls = {});
cls.ResourceManager || (cls.ResourceManager = {});
cls.ResourceManager["1.0"] || (cls.ResourceManager["1.0"] = {});

cls.ResourceManager["1.0"].UrlFinished = function(arr)
{
  this.resourceID = arr[0];
  // cls.ResourceManager["1.0"].UrlFinished.Result
  this.result = arr[1];
  this.time = arr[2];
  this.mimeType = arr[3];
  this.characterEncoding = arr[4];
};
cls.ResourceManager["1.0"].UrlFinished.Result =
{
  1: "FINISHED",
  2: "FAILED",
  3: "STOPPED",
};

