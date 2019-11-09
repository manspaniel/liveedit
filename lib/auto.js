"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.autoImmer = autoImmer;
exports.isAuto = isAuto;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var AutoImmer = Symbol("AutoImmer");

function autoImmer(target, propose) {
  return fork(target, propose, []);
}

function isAuto(o) {
  return o[AutoImmer];
}

function fork(target, propose, path) {
  var base = Array.isArray(target) ? [] : {};
  base[AutoImmer] = true;
  var proxy = new Proxy(base, createProxyHandler(target, path, propose));
  return proxy;
}

function createProxyHandler(obj, path, propose) {
  return {
    set: function set(t, prop, val) {
      propose(path, function (draft) {
        // @ts-ignore
        draft[prop] = val;
      });
      return true;
    },
    has: function has(t, prop) {
      return prop in obj;
    },
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(t, prop) {
      var desc = Object.getOwnPropertyDescriptor(obj, prop);
      return {
        configurable: true,
        enumerable: desc && desc.enumerable
      };
    },
    ownKeys: function ownKeys(t) {
      return [].concat(_toConsumableArray(Object.getOwnPropertyNames(obj)), _toConsumableArray(Object.getOwnPropertySymbols(obj)));
    },
    deleteProperty: function deleteProperty(t, prop) {
      console.log("TODO DELTE PROPERT");
      return true;
    },
    get: function get(t, prop) {
      // @ts-ignore
      var value = obj[prop];

      if (prop === "toSource") {
        return "asdfasdfasdf";
      }

      if (prop === Symbol.iterator) {
        // Ensure the target object is still iterable
        // @ts-ignore
        var iterator = obj[Symbol.iterator]();
        console.log("Iterator2", iterator);
        var i = 0;
        return function* () {
          while (true) {
            var n = iterator.next();
            i++;
            console.log("NN", _typeof(n.value));
            if (n.done) return;
            yield _typeof(n.value) === "object" ? fork(n.value, propose, [].concat(_toConsumableArray(path), [i])) : n.value;
          }
        };
      } else if (typeof value === "function") {
        // If the value is a function, return a proposed version
        return function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var result;
          propose(path, function (draft) {
            // @ts-ignore
            result = draft[prop].apply(draft, args);
          });
        };
      } else {
        // If the value is an object or array, fork it
        if (_typeof(value) === "object") {
          return fork(value, propose, [].concat(_toConsumableArray(path), [prop]));
        }
      }

      return value;
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdXRvLnRzIl0sIm5hbWVzIjpbIkF1dG9JbW1lciIsIlN5bWJvbCIsImF1dG9JbW1lciIsInRhcmdldCIsInByb3Bvc2UiLCJmb3JrIiwiaXNBdXRvIiwibyIsInBhdGgiLCJiYXNlIiwiQXJyYXkiLCJpc0FycmF5IiwicHJveHkiLCJQcm94eSIsImNyZWF0ZVByb3h5SGFuZGxlciIsIm9iaiIsInNldCIsInQiLCJwcm9wIiwidmFsIiwiZHJhZnQiLCJoYXMiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJkZXNjIiwiT2JqZWN0IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIm93bktleXMiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwiZGVsZXRlUHJvcGVydHkiLCJjb25zb2xlIiwibG9nIiwiZ2V0IiwidmFsdWUiLCJpdGVyYXRvciIsImkiLCJuIiwibmV4dCIsImRvbmUiLCJhcmdzIiwicmVzdWx0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSxJQUFNQSxTQUFTLEdBQUdDLE1BQU0sQ0FBQyxXQUFELENBQXhCOztBQVVPLFNBQVNDLFNBQVQsQ0FDTEMsTUFESyxFQUVMQyxPQUZLLEVBR0k7QUFDVCxTQUFPQyxJQUFJLENBQUNGLE1BQUQsRUFBU0MsT0FBVCxFQUFrQixFQUFsQixDQUFYO0FBQ0Q7O0FBRU0sU0FBU0UsTUFBVCxDQUFtQkMsQ0FBbkIsRUFBeUM7QUFDOUMsU0FBT0EsQ0FBQyxDQUFDUCxTQUFELENBQVI7QUFDRDs7QUFFRCxTQUFTSyxJQUFULENBQ0VGLE1BREYsRUFFRUMsT0FGRixFQUdFSSxJQUhGLEVBSVc7QUFDVCxNQUFNQyxJQUFTLEdBQUdDLEtBQUssQ0FBQ0MsT0FBTixDQUFjUixNQUFkLElBQXdCLEVBQXhCLEdBQTZCLEVBQS9DO0FBQ0FNLEVBQUFBLElBQUksQ0FBQ1QsU0FBRCxDQUFKLEdBQWtCLElBQWxCO0FBQ0EsTUFBTVksS0FBSyxH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TyxVQUFBWSxLQUFLLEVBQUk7QUFDckI7QUFDQXFCLFlBQUFBLE1BQU0sR0FBR3JCLEtBQUssQ0FBQ0YsSUFBRCxDQUFMLE9BQUFFLEtBQUssRUFBVW9CLElBQVYsQ0FBZDtBQUNELFdBSE0sQ0FBUDtBQUlELFNBTkQ7QUFPRCxPQVRNLE1BU0E7QUFDTDtBQUNBLFlBQUksUUFBT04sS0FBUCxNQUFpQixRQUFyQixFQUErQjtBQUM3QixpQkFBTzdCLElBQUksQ0FBQzZCLEtBQUQsRUFBUTlCLE9BQVIsK0JBQXFCSSxJQUFyQixJQUEyQlUsSUFBM0IsR0FBWDtBQUNEO0FBQ0Y7O0FBQ0QsYUFBT2dCLEtBQVA7QUFDRDtBQWhFSSxHQUFQO0FBa0VEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRHJhZnQgfSBmcm9tIFwiaW1tZXJcIlxuaW1wb3J0IHsgc3ltYm9sIH0gZnJvbSBcInByb3AtdHlwZXNcIlxuXG5jb25zdCBBdXRvSW1tZXIgPSBTeW1ib2woXCJBdXRvSW1tZXJcIilcblxudHlwZSBBdXRvPFQ+ID0gVCAmIHsgW0F1dG9JbW1lcl06IHRydWUgfVxuXG50eXBlIFBvaW50ZXIgPSAoc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sKVtdXG5cbnR5cGUgUHJvcG9zZXI8VD4gPSAocGF0aDogUG9pbnRlciwgbXV0YXRvcjogTXV0YXRvcjxUPikgPT4gdm9pZFxuXG50eXBlIE11dGF0b3I8VD4gPSAoZHJhZnQ6IERyYWZ0PFQ+KSA9PiBUIHwgdm9pZFxuXG5leHBvcnQgZnVuY3Rpb24gYXV0b0ltbWVyPFQgZXh0ZW5kcyBPYmplY3Q+KFxuICB0YXJnZXQ6IFQsXG4gIHByb3Bvc2U6IFByb3Bvc2VyPFQ+XG4pOiBBdXRvPFQ+IHtcbiAgcmV0dXJuIGZvcmsodGFyZ2V0LCBwcm9wb3NlLCBbXSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXV0bzxUPihvOiBhbnkpOiBvIGlzIEF1dG88VD4ge1xuICByZXR1cm4gb1tBdXRvSW1tZXJdXG59XG5cbmZ1bmN0aW9uIGZvcms8VCBleHRlbmRzIE9iamVjdD4oXG4gIHRhcmdldDogVCxcbiAgcHJvcG9zZTogUHJvcG9zZXI8VD4sXG4gIHBhdGg6IFBvaW50ZXJcbik6IEF1dG88VD4ge1xuICBjb25zdCBiYXNlOiBhbnkgPSBBcnJheS5pc0FycmF5KHRhcmdldCkgPyBbXSA6IHt9XG4gIGJhc2VbQXV0b0ltbWVyXSA9IHRydWVcbiAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkoXG4gICAgYmFzZSBhcyBBdXRvPFQ+LFxuICAgIGNyZWF0ZVByb3h5SGFuZGxlcih0YXJnZXQsIHBhdGgsIHByb3Bvc2UpXG4gIClcbiAgcmV0dXJuIHByb3h5IGFzIEF1dG88VD5cbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJveHlIYW5kbGVyPFQgZXh0ZW5kcyBPYmplY3Q+KFxuICBvYmo6IFQsXG4gIHBhdGg6IFBvaW50ZXIsXG4gIHByb3Bvc2U6IFByb3Bvc2VyPFQ+XG4pOiBQcm94eUhhbmRsZXI8VD4ge1xuICByZXR1cm4ge1xuICAgIHNldCh0LCBwcm9wLCB2YWw6IFQpIHtcbiAgICAgIHByb3Bvc2UocGF0aCwgZHJhZnQgPT4ge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGRyYWZ0W3Byb3BdID0gdmFsXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICAgIGhhcyh0LCBwcm9wKSB7XG4gICAgICByZXR1cm4gcHJvcCBpbiBvYmpcbiAgICB9LFxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LCBwcm9wKSB7XG4gICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIHByb3ApXG4gICAgICByZXR1cm4geyBjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IGRlc2MgJiYgZGVzYy5lbnVtZXJhYmxlIH1cbiAgICB9LFxuICAgIG93bktleXModCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKSxcbiAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmopXG4gICAgICBdXG4gICAgfSxcbiAgICBkZWxldGVQcm9wZXJ0eSh0LCBwcm9wKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlRPRE8gREVMVEUgUFJPUEVSVFwiKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICAgIGdldCh0LCBwcm9wKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjb25zdCB2YWx1ZSA9IG9ialtwcm9wXVxuICAgICAgaWYgKHByb3AgPT09IFwidG9Tb3VyY2VcIikge1xuICAgICAgICByZXR1cm4gXCJhc2RmYXNkZmFzZGZcIlxuICAgICAgfVxuICAgICAgaWYgKHByb3AgPT09IFN5bWJvbC5pdGVyYXRvcikge1xuICAgICAgICAvLyBFbnN1cmUgdGhlIHRhcmdldCBvYmplY3QgaXMgc3RpbGwgaXRlcmFibGVcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBjb25zdCBpdGVyYXRvciA9IG9ialtTeW1ib2wuaXRlcmF0b3JdKClcbiAgICAgICAgY29uc29sZS5sb2coXCJJdGVyYXRvcjJcIiwgaXRlcmF0b3IpXG4gICAgICAgIGxldCBpID0gMFxuICAgICAgICByZXR1cm4gZnVuY3Rpb24qKCkge1xuICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gaXRlcmF0b3IubmV4dCgpXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTk5cIiwgdHlwZW9mIG4udmFsdWUpXG4gICAgICAgICAgICBpZiAobi5kb25lKSByZXR1cm5cbiAgICAgICAgICAgIHlpZWxkIHR5cGVvZiBuLnZhbHVlID09PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgID8gZm9yayhuLnZhbHVlLCBwcm9wb3NlLCBbLi4ucGF0aCwgaV0pXG4gICAgICAgICAgICAgIDogbi52YWx1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaXMgYSBmdW5jdGlvbiwgcmV0dXJuIGEgcHJvcG9zZWQgdmVyc2lvblxuICAgICAgICByZXR1cm4gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICAgICAgICAgIGxldCByZXN1bHRcbiAgICAgICAgICBwcm9wb3NlKHBhdGgsIGRyYWZ0ID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJlc3VsdCA9IGRyYWZ0W3Byb3BdKC4uLmFyZ3MpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIGFuIG9iamVjdCBvciBhcnJheSwgZm9yayBpdFxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgcmV0dXJuIGZvcmsodmFsdWUsIHByb3Bvc2UsIFsuLi5wYXRoLCBwcm9wXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICB9XG59XG4iXX0=