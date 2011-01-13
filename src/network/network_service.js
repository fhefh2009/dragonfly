/**
 *
 */

cls.NetworkLoggerService = function(view, data)
{
  if (cls.NetworkLoggerService.instance)
  {
    return cls.NetworkLoggerService.instance;
  }
  cls.NetworkLoggerService.instance = this;

  this._current_context = null;

  this._enable_content_tracking = function()
  {
    this._res_service.requestSetResponseMode(null, [[3, 1]]);
  }

  this._on_abouttoloaddocument_bound = function(msg)
  {
    var data = new cls.DocumentManager["1.0"].AboutToLoadDocument(msg);
    // if not a top resource, just ignore. This usually means it's an iframe
    if (data.parentDocumentID) { return; }
    this._current_context = new cls.RequestContext();
  }.bind(this);

  this._on_urlload_bound = function(msg)
  {
    if (!this._current_context) { return; }
    var data = new cls.ResourceManager["1.0"].UrlLoad(msg);

    //bail if we get dupes. Why do we get dupes? fixme
    //if (data.resourceID in this._current_document.resourcemap) { return }
    this._current_context.update("urlload", data);
  }.bind(this);

  this._on_urlredirect_bound = function(msg)
  {
    if (!this._current_context) { return; }

    var data = new cls.ResourceManager["1.0"].UrlRedirect(msg);
    // a bit of cheating since further down we use .resouceID to determine
    // what resource the event applies to:
    data.resourceID = data.fromResourceID;
    this._current_context.update("urlredirect", data);
  }.bind(this);

  this._on_urlfinished_bound = function(msg)
  {
    if (!this._current_context) { return; }
    var data = new cls.ResourceManager["1.0"].UrlFinished(msg);
    this._current_context.update("urlfinished", data);
  }.bind(this);

  this._on_response_bound = function(msg)
  {
    if (!this._current_context) { return; }
    var data = new cls.ResourceManager["1.0"].Response(msg);
    this._current_context.update("response", data);
  }.bind(this);

  this._on_request_bound = function(msg)
  {
    if (!this._current_context) { return; }
    var data = new cls.ResourceManager["1.0"].Response(msg);
    this._current_context.update("request", data);
  }.bind(this);

  this.init = function()
  {
    this._res_service = window.services['resource-manager'];
    this._res_service.addListener("urlload", this._on_urlload_bound);
    this._res_service.addListener("request", this._on_request_bound);
    this._res_service.addListener("response", this._on_response_bound);
    this._res_service.addListener("urlredirect", this._on_urlredirect_bound);
    this._res_service.addListener("urlfinished", this._on_urlfinished_bound);
    this._doc_service = window.services['document-manager'];
    this._doc_service.addListener("abouttoloaddocument", this._on_abouttoloaddocument_bound);
  };

  this.get_request_context = function()
  {
    return this._current_context;
  };

  this.init();
};


cls.RequestContext = function()
{
  this.resources = [];

  this.update = function(eventname, event)
  {
    var res = this.get_resource(event.resourceID);

    if (!res && eventname == "urlload")
    {
      res = new cls.Resource(event.resourceID)
      if (this.resources.length == 0) { this.topresource = event.resourceID; }
      this.resources.push(res);
    }
    else if (!res)
    {
      // ignoring. Never saw an urlload, or it's allready invalidated
      return
    }

    res.update(eventname, event);
    if (res.invalid)
    {
      this.resources.splice(this.resources.indexOf(res), 1);
    }
  }

  this.get_resource = function(id)
  {
    return this.resources.filter(function(e) { return e.id == id; })[0];
  };

  this.get_resources_for_types = function()
  {
    var types = Array.prototype.slice.call(arguments, 0);
    var filterfun = function(e) { return types.indexOf(e.type) > -1;};
    return this.resources.filter(filterfun);
  };

  this.get_resources_for_mimes = function()
  {
    var mimes = Array.prototype.slice.call(arguments, 0);
    var filterfun = function(e) { return mimes.indexOf(e.mime) > -1; };
    return this.resources.filter(filterfun);
  };

  this.get_resource_groups = function()
  {
    var imgs = this.get_resources_for_type("image");
    var stylesheets = this.get_resources_for_mime("text/css");
    var markup = this.get_resources_for_mime("text/html",
                                             "application/xhtml+xml");
    var scripts = this.get_resources_for_mime("application/javascript",
                                              "text/javascript");

    var known = [].concat(imgs, stylesheets, markup, scripts);
    var other = this.resources.filter(function(e) {
      return known.indexOf(e) == -1;
    });
    return {
      images: imgs, stylesheets: stylesheets, markup: markup,
      scripts: scripts, other: other
    }
  }
}

cls.Request = function(id)
{
  this.id = id;
  this.finished = false;
  this.url = null;
  this.result = null;
  this.mime = null;
  this.encoding = null;
  this.size = null;
  this.type = null;
  this.urltype = null;
  this.invalid = false;
  this.starttime = null;
  this.endtime = null;
  this.cached = false;
  this.duration = null;
  this.request_headers = [];
  this.response_headers = [];

  this.update = function(eventname, eventdata)
  {
    if (eventname == "urlload")
    {
      this.url = eventdata.url;
      this.urltype = eventdata.urlType;
      // fixme: complete list
      this.urltypeName = {0: "unknown", 1: "http", 2: "https", 3: "file", 4: "data" }[eventdata.urlType];
    }
    else if (eventname == "request")
    {
      //opera.postError("le request");
    }
    else if (eventname == "urlfinished")
    {
      this.result = eventdata.result;
      this.mime = eventdata.mimeType;
      this.encoding = eventdata.characterEncoding;
      this.size = eventdata.contentLength;
      this.endtime = eventdata.time;
      this.duration = this.endtime - this.starttime;
      this.finished = true;
      this._guess_type();
    }
    else if (eventname == "response")
    {
      if (eventdata.responseCode <= 100 || eventdata.responseCode >= 300)
      {
        this.invalid = true;
      }
    }
    else if (eventname == "urlredirect")
    {
      this.invalid = true;
    }
    else
    {
      opera.postError("got unknown event: " + eventname);
    }
  }

  this.get_source = function()
  {
    // cache, file, http, https ..
  }

  this._guess_type = function()
  {
    if (!this.finished)
    {
      this.type = undefined;
    }
    else if (this.mime.toLowerCase() == "application/octet-stream")
    {
      this.type = cls.ResourceUtil.path_to_type(this.url);
    }
    else
    {
      this.type = cls.ResourceUtil.mime_to_type(this.mime);
    }
  }
}