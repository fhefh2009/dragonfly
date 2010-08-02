// Autogenerated by hob
window.cls || (window.cls = {});
cls.EcmascriptDebugger || (cls.EcmascriptDebugger = {});
cls.EcmascriptDebugger["6.0"] || (cls.EcmascriptDebugger["6.0"] = {});

cls.EcmascriptDebugger["6.0"].ThreadStopInfo = function(arr)
{
  this.runtimeID = arr[0];
  this.threadID = arr[1];
  this.scriptID = arr[2];
  this.lineNumber = arr[3];
  /** 
    * One of:
    * - `"broken"`
    * - `"function-return"`
    * - `"exception"`
    * - `"debugger statement"`
    * - `"breakpoint"`
    * - `"unknown"`
    * 
    * `"broken"` is sent in response to a `Break` command.
    * `"breakpoint"` is sent when the script hits a debugger-set breakpoint.
    */
  this.stoppedReason = arr[4];
  /** 
    * Present if and only if `stoppedReason` is `"breakpoint"`
    */
  this.breakpointID = arr[5];
};

