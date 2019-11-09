"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useClient = useClient;

var _react = require("react");

var _client = require("./client");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function useClient(wsURL) {
  var _useState = (0, _react.useState)(false),
      _useState2 = _slicedToArray(_useState, 2),
      connected = _useState2[0],
      setConnected = _useState2[1]; // Create a websocket


  var _useMemo = (0, _react.useMemo)(function () {
    var ws = new WebSocket(wsURL);
    var client = new _client.LiveEditClient(function (msg) {
      return ws.send(JSON.stringify(msg));
    });

    ws.onopen = function (e) {
      client.connected = true;
      setConnected(true);
    };

    ws.onclose = function (e) {
      client.connected = true;
      setConnected(true);
    };

    ws.onmessage = function (e) {
      client.handleMessage(JSON.parse(e.data));
    };

    return {
      client: client,
      ws: ws
    };
  }, [wsURL]),
      client = _useMemo.client,
      ws = _useMemo.ws;

  return client;
} // type Props<T, F extends keyof T> = {
//   client: LiveEditClient<T>
//   type: F
//   id: string,
//   children: (value: T) => React.ReactNode
// }
// export function LiveEditor(props: Props) {
// }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWFjdC50cyJdLCJuYW1lcyI6WyJ1c2VDbGllbnQiLCJ3c1VSTCIsImNvbm5lY3RlZCIsInNldENvbm5lY3RlZCIsIndzIiwiV2ViU29ja2V0IiwiY2xpZW50IiwiTGl2ZUVkaXRDbGllbnQiLCJtc2ciLCJzZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIm9ub3BlbiIsImUiLCJvbmNsb3NlIiwib25tZXNzYWdlIiwiaGFuZGxlTWVzc2FnZSIsInBhcnNlIiwiZGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7Ozs7O0FBRU8sU0FBU0EsU0FBVCxDQUFzQkMsS0FBdEIsRUFBcUM7QUFBQSxrQkFDUixxQkFBUyxLQUFULENBRFE7QUFBQTtBQUFBLE1BQ25DQyxTQURtQztBQUFBLE1BQ3hCQyxZQUR3QixrQkFHMUM7OztBQUgwQyxpQkFJbkIsb0JBQVEsWUFBTTtBQUNuQyxRQUFNQyxFQUFFLEdBQUcsSUFBSUMsU0FBSixDQUFjSixLQUFkLENBQVg7QUFFQSxRQUFNSyxNQUFNLEdBQUcsSUFBSUMsc0JBQUosQ0FBc0IsVUFBQUMsR0FBRztBQUFBLGFBQUlKLEVBQUUsQ0FBQ0ssSUFBSCxDQUFRQyxJQUFJLENBQUNDLFNBQUwsQ0FBZUgsR0FBZixDQUFSLENBQUo7QUFBQSxLQUF6QixDQUFmOztBQUVBSixJQUFBQSxFQUFFLENBQUNRLE1BQUgsR0FBWSxVQUFBQyxDQUFDLEVBQUk7QUFDZlAsTUFBQUEsTUFBTSxDQUFDSixTQUFQLEdBQW1CLElBQW5CO0FBQ0FDLE1BQUFBLFlBQVksQ0FBQyxJQUFELENBQVo7QUFDRCxLQUhEOztBQUtBQyxJQUFBQSxFQUFFLENBQUNVLE9BQUgsR0FBYSxVQUFBRCxDQUFDLEVBQUk7QUFDaEJQLE1BQUFBLE1BQU0sQ0FBQ0osU0FBUCxHQUFtQixJQUFuQjtBQUNBQyxNQUFBQSxZQUFZLENBQUMsSUFBRCxDQUFaO0FBQ0QsS0FIRDs7QUFLQUMsSUFBQUEsRUFBRSxDQUFDVyxTQUFILEdBQWUsVUFBQUYsQ0FBQyxFQUFJO0FBQ2xCUCxNQUFBQSxNQUFNLENBQUNVLGFBQVAsQ0FBcUJOLElBQUksQ0FBQ08sS0FBTCxDQUFXSixDQUFDLENBQUNLLElBQWIsQ0FBckI7QUFDRCxLQUZEOztBQUlBLFdBQU87QUFBRVosTUFBQUEsTUFBTSxFQUFOQSxNQUFGO0FBQVVGLE1BQUFBLEVBQUUsRUFBRkE7QUFBVixLQUFQO0FBQ0QsR0FwQnNCLEVBb0JwQixDQUFDSCxLQUFELENBcEJvQixDQUptQjtBQUFBLE1BSWxDSyxNQUprQyxZQUlsQ0EsTUFKa0M7QUFBQSxNQUkxQkYsRUFKMEIsWUFJMUJBLEVBSjBCOztBQTBCMUMsU0FBT0UsTUFBUDtBQUNELEMsQ0FFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHsgTGl2ZUVkaXRDbGllbnQgfSBmcm9tIFwiLi9jbGllbnRcIlxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQ2xpZW50PFQ+KHdzVVJMOiBzdHJpbmcpIHtcbiAgY29uc3QgW2Nvbm5lY3RlZCwgc2V0Q29ubmVjdGVkXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIC8vIENyZWF0ZSBhIHdlYnNvY2tldFxuICBjb25zdCB7IGNsaWVudCwgd3MgfSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IHdzID0gbmV3IFdlYlNvY2tldCh3c1VSTClcblxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBMaXZlRWRpdENsaWVudDxUPihtc2cgPT4gd3Muc2VuZChKU09OLnN0cmluZ2lmeShtc2cpKSlcblxuICAgIHdzLm9ub3BlbiA9IGUgPT4ge1xuICAgICAgY2xpZW50LmNvbm5lY3RlZCA9IHRydWVcbiAgICAgIHNldENvbm5lY3RlZCh0cnVlKVxuICAgIH1cblxuICAgIHdzLm9uY2xvc2UgPSBlID0+IHtcbiAgICAgIGNsaWVudC5jb25uZWN0ZWQgPSB0cnVlXG4gICAgICBzZXRDb25uZWN0ZWQodHJ1ZSlcbiAgICB9XG5cbiAgICB3cy5vbm1lc3NhZ2UgPSBlID0+IHtcbiAgICAgIGNsaWVudC5oYW5kbGVNZXNzYWdlKEpTT04ucGFyc2UoZS5kYXRhKSlcbiAgICB9XG5cbiAgICByZXR1cm4geyBjbGllbnQsIHdzIH1cbiAgfSwgW3dzVVJMXSlcblxuICByZXR1cm4gY2xpZW50XG59XG5cbi8vIHR5cGUgUHJvcHM8VCwgRiBleHRlbmRzIGtleW9mIFQ+ID0ge1xuLy8gICBjbGllbnQ6IExpdmVFZGl0Q2xpZW50PFQ+XG4vLyAgIHR5cGU6IEZcbi8vICAgaWQ6IHN0cmluZyxcbi8vICAgY2hpbGRyZW46ICh2YWx1ZTogVCkgPT4gUmVhY3QuUmVhY3ROb2RlXG4vLyB9XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiBMaXZlRWRpdG9yKHByb3BzOiBQcm9wcykge1xuXG4vLyB9XG4iXX0=