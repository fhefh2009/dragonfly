﻿window.templates = window.templates || {};

window.templates.error_log_table = function(entries, allExpanded, expandedList, viewId)
{
  var rowClosure = function(e)
  {
    return window.templates.error_log_row(e, allExpanded, expandedList, viewId);
  };

  return [
    "table", entries.map(rowClosure),
    "class", "sortable-table errors-table",
  ];
};

window.templates.error_log_row = function(entry, allExpanded, toggledList, viewId)
{
  var expanded;
  if (allExpanded)
  {
    expanded = true;
    if (toggledList.indexOf(entry.id)!=-1)
    {
      expanded = false;
    }
  }
  else
  {
    expanded = toggledList.indexOf(entry.id) != -1;
  }

  var severity = entry.severity || "information";
  var title = entry.context;
  if (entry.line && entry.uri)
  {
    title = "Line " + entry.line + " in " + entry.uri; // todo: strings
  }
  var location_string = helpers.basename(entry.uri);
  if (!location_string)
  {
    location_string = entry.context;
  }
  if (entry.line)
  {
    location_string += ":" + entry.line;
  }
  
  var expandable = true;
  if (entry.title === (entry.main || entry.description))
  {
    expandable = false;
  }

  var main_column_content = ["pre", entry.title, "class", "mono"];
  var expandable_main_column_content = [
    "table",
      ["tr",
        [
          ["td", ["button", "",
                 "type", "button",
                 "data-logid", entry.id,
                 "data-viewid", viewId,
                 "unselectable", "on"],
          "class", "expander"],
          ["td", main_column_content]
        ]
      ],
      ["tr",
        [
          ["td"],
          ["td",
            ["pre", entry.main]
          ]
        ],
        "class", "mono error-details"
      ]
  ];

  var source_map = {
    "svg": {
      icon: "markup", // or "image"?
      title: "SVG"
    },
    "html": {
      icon: "markup",
      title: "HTML"
    },
    "xml": {
      icon: "markup",
      title: "XML"
    },
    "css": {
      icon: "css",
      title: "CSS"
    },
    "ecmascript": {
      icon: "script",
      title: "Ecmascript"
    }
    // todo: "persistent_storage"
  };
  
  var source = source_map[entry.source]

  var rows = [
    [
      "tr", [
        ["td", ["span", "class", "resource-icon resource-type-" + (source && source.icon), "title", (source && source.title) || entry.source], "class", "icon"],
        ["td",
          (expandable ? expandable_main_column_content : main_column_content),
          "class", "main"
        ],
        ["td", entry.context, "class", "context"],
        ["td",
           location_string,
           "title", title,
           "class", "location " + (entry.uri ? "internal-link" : ""),
           "handler", "open-resource-tab",
           "data-resource-url", entry.uri
        ]
      ],
      "class", (expandable ? "expandable" : "") + (expanded ? " expanded" : " collapsed"),
      "handler", expandable ? "error-log-list-expand-collapse" : "",
      "data-logid", entry.id,
      "data-viewid", viewId
    ]
  ];
  return rows;
};

window.templates.error_log_settings_css_filter = function(setting)
{
  return (
  [
    ['setting-composite', 
      window.templates.settingCheckbox('console', 
                                       'use-css-filter', 
                                       setting.get('use-css-filter'), 
                                       ui_strings.S_ERROR_LOG_CSS_FILTER),
      ['label',
        ['_auto_height_textarea', 
          setting.get('css-filter'),
          'handler', 'error-console-css-filter',
          'id', 'error-console-css-filter',
        ],
      ],
      'class', 'error-console-setting',
    ]
  ]);
};
