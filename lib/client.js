"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LiveEditDocument = exports.LiveEditClient = void 0;

var _immer = require("immer");

var _v = _interopRequireDefault(require("uuid/v4"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LiveEditClient =
/*#__PURE__*/
function () {
  function LiveEditClient(send) {
    _classCallCheck(this, LiveEditClient);

    _defineProperty(this, "documents", {});

    _defineProperty(this, "send", void 0);

    _defineProperty(this, "pendingDocuments", []);

    this.send = send;
  }

  _createClass(LiveEditClient, [{
    key: "handleMessage",
    value: function handleMessage(msg) {
      var self = this;

      switch (msg[0]) {
        case "changed":
          {
            var _msg$ = msg[1],
                _id = _msg$.id,
                type = _msg$.type,
                change = _msg$.change;
            console.log("Got change", change);
            var typedItems = this.documents[type];

            if (typedItems) {
              if (_id in typedItems) {
                var liveEditDoc = typedItems[_id];
                console.log("Found doc", liveEditDoc);
                liveEditDoc.patch(change);
              }
            }
          }
          break;

        case "proposalResult":
          {
            var _msg$2 = msg[1],
                _id2 = _msg$2.id,
                _type = _msg$2.type,
                _changeID = _msg$2.changeID,
                _result = _msg$2.result;
            console.log("Got response", _type in this.documents, _type, this.documents);

            if (_type in this.documents) {
              console.log("> Type", this.documents, _type);
              var _typedItems = this.documents[_type];

              if (_typedItems && _id2 in _typedItems) {
                var _liveEditDoc = _typedItems[_id2];
                console.log("Doc?", _liveEditDoc.pendingResponses);

                if (_liveEditDoc.pendingResponses[_changeID]) {
                  _liveEditDoc.pendingResponses[_changeID](_result);
                }
              }
            }
          }
          break;

        case "initial":
          {
            var _msg$3 = msg[1],
                _id3 = _msg$3.id,
                _type2 = _msg$3.type,
                _value = _msg$3.value,
                baseID = _msg$3.baseID;

            var _liveEditDoc2 = new LiveEditDocument(_type2, _id3, this);

            _liveEditDoc2.setInitial(baseID, _value);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = this.pendingDocuments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var pending = _step.value;

                if (pending.type === _type2 && pending.id === _id3) {
                  pending.resolve(_liveEditDoc2);
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          }
          break;

        case "error":
          {
            var _msg$4 = msg[1],
                _id4 = _msg$4.id,
                _type3 = _msg$4.type,
                errorMessage = _msg$4.errorMessage;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = this.pendingDocuments[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _pending = _step2.value;

                if (_pending.type === _type3 && _pending.id === _id4) {
                  _pending.reject(new Error(errorMessage));
                }
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
          }
          break;
      }
    }
  }, {
    key: "loadDocument",
    value: function loadDocument(type, id) {
      var _this = this;

      return regeneratorRuntime.async(function loadDocument$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (_resolve, _reject) {
                // Subscribe
                _this.send(["subscribe", {
                  id: String(id),
                  type: String(type)
                }]); // Create the document


                _this.pendingDocuments.push({
                  type: String(type),
                  id: id,
                  resolve: function resolve(doc) {
                    // Save it
                    if (!_this.documents[type]) {
                      _this.documents[type] = {};
                    } // TODO: fix this? Types seem compatible to me! TS complains though...
                    // @ts-ignore


                    _this.documents[type][id] = doc;

                    _resolve(doc);
                  },
                  reject: function reject(err) {
                    _reject(err);
                  }
                });
              }));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  }]);

  return LiveEditClient;
}();

exports.LiveEditClient = LiveEditClient;

var LiveEditDocument =
/*#__PURE__*/
function () {
  // Listeners
  // False when the document hasn't yet loaded, true when it has
  // True when a proposal is in progress
  // The confirmed state and baseID
  // The optimistic value and baseID
  function LiveEditDocument(type, id, client) {
    _classCallCheck(this, LiveEditDocument);

    _defineProperty(this, "type", void 0);

    _defineProperty(this, "id", void 0);

    _defineProperty(this, "client", void 0);

    _defineProperty(this, "listeners", []);

    _defineProperty(this, "ready", false);

    _defineProperty(this, "proposing", false);

    _defineProperty(this, "pendingResponses", {});

    _defineProperty(this, "value", void 0);

    _defineProperty(this, "baseID", "");

    _defineProperty(this, "confirmedValue", void 0);

    _defineProperty(this, "confirmedBaseID", "");

    _defineProperty(this, "queue", []);

    this.type = type;
    this.id = id;
    this.client = client;
  }

  _createClass(LiveEditDocument, [{
    key: "propose",
    value: function propose(func) {
      console.log("Proposing");
      var changeID = (0, _v["default"])(); // let patches: Patch[]

      console.log("Old value", this.value);

      var _produceWithPatches = (0, _immer.produceWithPatches)(this.value, function (draft) {
        func(draft);
      }),
          _produceWithPatches2 = _slicedToArray(_produceWithPatches, 2),
          nextValue = _produceWithPatches2[0],
          patches = _produceWithPatches2[1];

      this.value = nextValue;
      this.queue.push({
        changeID: changeID,
        func: func,
        patches: patches
      });
      this.changed();

      if (this.queue.length === 1) {
        this.distributeFirstChange();
      }
    }
  }, {
    key: "sendProposal",
    value: function sendProposal(change) {
      var _this2 = this;

      return regeneratorRuntime.async(function sendProposal$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve) {
                _this2.pendingResponses[change.changeID] = resolve;

                _this2.client.send(["propose", {
                  id: _this2.id,
                  type: _this2.type,
                  change: change
                }]);
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    }
  }, {
    key: "distributeFirstChange",
    value: function distributeFirstChange() {
      var change, response, _doc, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _change;

      return regeneratorRuntime.async(function distributeFirstChange$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!this.proposing) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return");

            case 2:
              change = this.queue[0];
              this.proposing = true;
              console.log("Distributing");
              _context3.next = 7;
              return regeneratorRuntime.awrap(this.sendProposal({
                baseID: this.confirmedBaseID,
                changeID: change.changeID,
                patches: change.patches
              }));

            case 7:
              response = _context3.sent;
              console.log("Got result back");
              this.proposing = false;

              if (!(response === "NOPE")) {
                _context3.next = 14;
                break;
              }

              console.log("Got rejected"); // we keep the actions for now, and we will try to replay them after receiving the next change

              _context3.next = 43;
              break;

            case 14:
              if (!(response === "DROP")) {
                _context3.next = 42;
                break;
              }

              // we've been instructed to drop this change
              console.log("Dropping");
              _doc = this.confirmedValue;
              this.queue.shift();
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              _context3.prev = 21;

              for (_iterator3 = this.queue[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                _change = _step3.value;
                _doc = (0, _immer.applyPatches)(_doc, _change.patches);
              }

              _context3.next = 29;
              break;

            case 25:
              _context3.prev = 25;
              _context3.t0 = _context3["catch"](21);
              _didIteratorError3 = true;
              _iteratorError3 = _context3.t0;

            case 29:
              _context3.prev = 29;
              _context3.prev = 30;

              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                _iterator3["return"]();
              }

            case 32:
              _context3.prev = 32;

              if (!_didIteratorError3) {
                _context3.next = 35;
                break;
              }

              throw _iteratorError3;

            case 35:
              return _context3.finish(32);

            case 36:
              return _context3.finish(29);

            case 37:
              this.value = _doc;
              this.changed(); // Send the next change!

              if (this.queue.length) this.distributeFirstChange();
              _context3.next = 43;
              break;

            case 42:
              if (response === "ACK") {
                console.log("Applying");
                this.confirmedValue = (0, _immer.applyPatches)(this.confirmedValue, change.patches);
                this.confirmedBaseID = change.changeID;
                this.queue.shift(); // Send the next change!

                if (this.queue.length) this.distributeFirstChange();
              }

            case 43:
              this.changed();

            case 44:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this, [[21, 25, 29, 37], [30,, 32, 36]]);
    }
  }, {
    key: "subscribe",
    value: function subscribe(handler) {
      var _this3 = this;

      this.listeners.push(handler);
      return function () {
        var index = _this3.listeners.indexOf(handler);

        if (index !== -1) {
          _this3.listeners.splice(index, 1);
        }
      };
    }
  }, {
    key: "patch",
    value: function patch(change) {
      console.log("Changing", change);
      if (change.baseID !== this.confirmedBaseID) throw "Illegal state";
      this.confirmedBaseID = change.changeID;
      this.confirmedValue = (0, _immer.applyPatches)(this.confirmedValue, change.patches);
      var queue = this.queue;
      this.queue = [];
      this.value = this.confirmedValue; // Apply pending changes again

      while (queue.length) {
        var p = queue.shift();

        try {
          if (p) this.propose(p.func);
        } catch (e) {
          console.warn("Dropped change, it can no longer be applied");
        }
      }

      this.changed();
    }
  }, {
    key: "setInitial",
    value: function setInitial(baseID, doc) {
      this.value = doc;
      this.confirmedValue = doc;
      this.baseID = baseID;
      this.confirmedBaseID = baseID;
      this.ready = true;
      this.changed();
    }
  }, {
    key: "changed",
    value: function changed() {
      var _this4 = this;

      this.listeners.forEach(function (subscriber) {
        subscriber(_this4.value, _this4);
      });
    }
  }, {
    key: "close",
    value: function close() {
      this.listeners = [];
      this.client.send(["unsubscribe", {
        type: this.type,
        id: this.id
      }]);
    }
  }]);

  return LiveEditDocument;
}();

exports.LiveEditDocument = LiveEditDocument;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQudHMiXSwibmFtZXMiOlsiTGl2ZUVkaXRDbGllbnQiLCJzZW5kIiwibXNnIiwic2VsZiIsImlkIiwidHlwZSIsImNoYW5nZSIsImNvbnNvbGUiLCJsb2ciLCJ0eXBlZEl0ZW1zIiwiZG9jdW1lbnRzIiwibGl2ZUVkaXREb2MiLCJwYXRjaCIsImNoYW5nZUlEIiwicmVzdWx0IiwicGVuZGluZ1Jlc3BvbnNlcyIsInZhbHVlIiwiYmFzZUlEIiwiTGl2ZUVkaXREb2N1bWVudCIsInNldEluaXRpYWwiLCJwZW5kaW5nRG9jdW1lbnRzIiwicGVuZGluZyIsInJlc29sdmUiLCJlcnJvck1lc3NhZ2UiLCJyZWplY3QiLCJFcnJvciIsIlByb21pc2UiLCJTdHJpbmciLCJwdXNoIiwiZG9jIiwiZXJyIiwiY2xpZW50IiwiZnVuYyIsImRyYWZ0IiwibmV4dFZhbHVlIiwicGF0Y2hlcyIsInF1ZXVlIiwiY2hhbmdlZCIsImxlbmd0aCIsImRpc3RyaWJ1dGVGaXJzdENoYW5nZSIsInByb3Bvc2luZyIsInNlbmRQcm9wb3NhbCIsImNvbmZpcm1lZEJhc2VJRCIsInJlc3BvbnNlIiwiY29uZmlybWVkVmFsdWUiLCJzaGlmdCIsImhhbmRsZXIiLCJsaXN0ZW5lcnMiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJwIiwicHJvcG9zZSIsImUiLCJ3YXJuIiwicmVhZHkiLCJmb3JFYWNoIiwic3Vic2NyaWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQVNhQSxjOzs7QUFlWCwwQkFBWUMsSUFBWixFQUF3RDtBQUFBOztBQUFBLHVDQVZwRCxFQVVvRDs7QUFBQTs7QUFBQSw4Q0FGbEQsRUFFa0Q7O0FBQ3RELFNBQUtBLElBQUwsR0FBWUEsSUFBWjtBQUNEOzs7O2tDQUVhQyxHLEVBQTRCO0FBQ3hDLFVBQU1DLElBQUksR0FBRyxJQUFiOztBQUNBLGNBQVFELEdBQUcsQ0FBQyxDQUFELENBQVg7QUFD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O0FBQ0Y7O0FBRUQsV0FBS2pCLE9BQUw7QUFDRDs7OytCQUVVcEIsTSxFQUFnQlksRyxFQUFXO0FBQ3BDLFdBQUtiLEtBQUwsR0FBYWEsR0FBYjtBQUNBLFdBQUtlLGNBQUwsR0FBc0JmLEdBQXRCO0FBQ0EsV0FBS1osTUFBTCxHQUFjQSxNQUFkO0FBQ0EsV0FBS3lCLGVBQUwsR0FBdUJ6QixNQUF2QjtBQUNBLFdBQUtzQyxLQUFMLEdBQWEsSUFBYjtBQUNBLFdBQUtsQixPQUFMO0FBQ0Q7Ozs4QkFFUztBQUFBOztBQUNSLFdBQUtVLFNBQUwsQ0FBZVMsT0FBZixDQUF1QixVQUFBQyxVQUFVLEVBQUk7QUFDbkNBLFFBQUFBLFVBQVUsQ0FBQyxNQUFJLENBQUN6QyxLQUFOLEVBQWEsTUFBYixDQUFWO0FBQ0QsT0FGRDtBQUdEOzs7NEJBRU87QUFDTixXQUFLK0IsU0FBTCxHQUFpQixFQUFqQjtBQUNBLFdBQUtoQixNQUFMLENBQVk5QixJQUFaLENBQWlCLENBQUMsYUFBRCxFQUFnQjtBQUFFSSxRQUFBQSxJQUFJLEVBQUUsS0FBS0EsSUFBYjtBQUFtQkQsUUFBQUEsRUFBRSxFQUFFLEtBQUtBO0FBQTVCLE9BQWhCLENBQWpCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBTZXJ2ZXJUb0NsaWVudE1lc3NhZ2UsXG4gIENsaWVudFRvU2VydmVyTWVzc2FnZSxcbiAgQ2hhbmdlLFxuICBQcm9wb3NhbFJlc3VsdFxufSBmcm9tIFwiLi9wcm90b2NvbFwiXG5pbXBvcnQgcHJvZHVjZSwgeyBQYXRjaCwgYXBwbHlQYXRjaGVzLCBwcm9kdWNlV2l0aFBhdGNoZXMgfSBmcm9tIFwiaW1tZXJcIlxuaW1wb3J0IHV1aWQgZnJvbSBcInV1aWQvdjRcIlxuaW1wb3J0IHsgc3RyaW5nIH0gZnJvbSBcInByb3AtdHlwZXNcIlxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJkbnNcIlxuaW1wb3J0IHsgcmVqZWN0cyB9IGZyb20gXCJhc3NlcnRcIlxuXG5pbnRlcmZhY2UgRG9jVHlwZVNldCB7XG4gIFt0eXBlTmFtZTogc3RyaW5nXTogYW55XG59XG5cbmV4cG9ydCBjbGFzcyBMaXZlRWRpdENsaWVudDxURG9jVHlwZVNldCBleHRlbmRzIERvY1R5cGVTZXQ+IHtcbiAgZG9jdW1lbnRzOiB7XG4gICAgW2tleSBpbiBrZXlvZiBURG9jVHlwZVNldF0/OiB7XG4gICAgICBbaWQ6IHN0cmluZ106IExpdmVFZGl0RG9jdW1lbnQ8VERvY1R5cGVTZXRba2V5XT5cbiAgICB9XG4gIH0gPSB7fVxuICBzZW5kOiAobXNnOiBDbGllbnRUb1NlcnZlck1lc3NhZ2UpID0+IHZvaWRcblxuICBwZW5kaW5nRG9jdW1lbnRzOiB7XG4gICAgdHlwZTogc3RyaW5nXG4gICAgaWQ6IHN0cmluZ1xuICAgIHJlc29sdmU6ICh2YWw6IGFueSkgPT4gdm9pZFxuICAgIHJlamVjdDogKGVycjogRXJyb3IpID0+IHZvaWRcbiAgfVtdID0gW11cblxuICBjb25zdHJ1Y3RvcihzZW5kOiAobXNnOiBDbGllbnRUb1NlcnZlck1lc3NhZ2UpID0+IHZvaWQpIHtcbiAgICB0aGlzLnNlbmQgPSBzZW5kXG4gIH1cblxuICBoYW5kbGVNZXNzYWdlKG1zZzogU2VydmVyVG9DbGllbnRNZXNzYWdlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXNcbiAgICBzd2l0Y2ggKG1zZ1swXSkge1xuICAgICAgY2FzZSBcImNoYW5nZWRcIjpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IHsgaWQsIHR5cGUsIGNoYW5nZSB9ID0gbXNnWzFdXG4gICAgICAgICAgY29uc29sZS5sb2coXCJHb3QgY2hhbmdlXCIsIGNoYW5nZSlcbiAgICAgICAgICBjb25zdCB0eXBlZEl0ZW1zID0gdGhpcy5kb2N1bWVudHNbdHlwZV1cbiAgICAgICAgICBpZiAodHlwZWRJdGVtcykge1xuICAgICAgICAgICAgaWYgKGlkIGluIHR5cGVkSXRlbXMpIHtcbiAgICAgICAgICAgICAgY29uc3QgbGl2ZUVkaXREb2M6IExpdmVFZGl0RG9jdW1lbnQgPSB0eXBlZEl0ZW1zW2lkXVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZvdW5kIGRvY1wiLCBsaXZlRWRpdERvYylcbiAgICAgICAgICAgICAgbGl2ZUVkaXREb2MucGF0Y2goY2hhbmdlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcInByb3Bvc2FsUmVzdWx0XCI6XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlLCBjaGFuZ2VJRCwgcmVzdWx0IH0gPSBtc2dbMV1cbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwiR290IHJlc3BvbnNlXCIsXG4gICAgICAgICAgICB0eXBlIGluIHRoaXMuZG9jdW1lbnRzLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRzXG4gICAgICAgICAgKVxuICAgICAgICAgIGlmICh0eXBlIGluIHRoaXMuZG9jdW1lbnRzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4gVHlwZVwiLCB0aGlzLmRvY3VtZW50cywgdHlwZSlcbiAgICAgICAgICAgIGNvbnN0IHR5cGVkSXRlbXMgPSB0aGlzLmRvY3VtZW50c1t0eXBlXVxuICAgICAgICAgICAgaWYgKHR5cGVkSXRlbXMgJiYgaWQgaW4gdHlwZWRJdGVtcykge1xuICAgICAgICAgICAgICBjb25zdCBsaXZlRWRpdERvYzogTGl2ZUVkaXREb2N1bWVudCA9IHR5cGVkSXRlbXNbaWRdXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRG9jP1wiLCBsaXZlRWRpdERvYy5wZW5kaW5nUmVzcG9uc2VzKVxuICAgICAgICAgICAgICBpZiAobGl2ZUVkaXREb2MucGVuZGluZ1Jlc3BvbnNlc1tjaGFuZ2VJRF0pIHtcbiAgICAgICAgICAgICAgICBsaXZlRWRpdERvYy5wZW5kaW5nUmVzcG9uc2VzW2NoYW5nZUlEXShyZXN1bHQpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJpbml0aWFsXCI6XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlLCB2YWx1ZSwgYmFzZUlEIH0gPSBtc2dbMV1cbiAgICAgICAgICBjb25zdCBsaXZlRWRpdERvYzogTGl2ZUVkaXREb2N1bWVudCA9IG5ldyBMaXZlRWRpdERvY3VtZW50KFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgdGhpc1xuICAgICAgICAgIClcbiAgICAgICAgICBsaXZlRWRpdERvYy5zZXRJbml0aWFsKGJhc2VJRCwgdmFsdWUpXG4gICAgICAgICAgZm9yIChjb25zdCBwZW5kaW5nIG9mIHRoaXMucGVuZGluZ0RvY3VtZW50cykge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcudHlwZSA9PT0gdHlwZSAmJiBwZW5kaW5nLmlkID09PSBpZCkge1xuICAgICAgICAgICAgICBwZW5kaW5nLnJlc29sdmUobGl2ZUVkaXREb2MpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IHsgaWQsIHR5cGUsIGVycm9yTWVzc2FnZSB9ID0gbXNnWzFdXG4gICAgICAgICAgZm9yIChjb25zdCBwZW5kaW5nIG9mIHRoaXMucGVuZGluZ0RvY3VtZW50cykge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcudHlwZSA9PT0gdHlwZSAmJiBwZW5kaW5nLmlkID09PSBpZCkge1xuICAgICAgICAgICAgICBwZW5kaW5nLnJlamVjdChuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2FkRG9jdW1lbnQ8XG4gICAgVFR5cGVOYW1lIGV4dGVuZHMga2V5b2YgVERvY1R5cGVTZXQsXG4gICAgVERvY1R5cGUgPSBURG9jVHlwZVNldFtUVHlwZU5hbWVdXG4gID4odHlwZTogVFR5cGVOYW1lLCBpZDogc3RyaW5nKTogUHJvbWlzZTxMaXZlRWRpdERvY3VtZW50PFREb2NUeXBlPj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBTdWJzY3JpYmVcbiAgICAgIHRoaXMuc2VuZChbXCJzdWJzY3JpYmVcIiwgeyBpZDogU3RyaW5nKGlkKSwgdHlwZTogU3RyaW5nKHR5cGUpIH1dKVxuXG4gICAgICAvLyBDcmVhdGUgdGhlIGRvY3VtZW50XG4gICAgICB0aGlzLnBlbmRpbmdEb2N1bWVudHMucHVzaCh7XG4gICAgICAgIHR5cGU6IFN0cmluZyh0eXBlKSxcbiAgICAgICAgaWQ6IGlkLFxuICAgICAgICByZXNvbHZlOiBkb2MgPT4ge1xuICAgICAgICAgIC8vIFNhdmUgaXRcbiAgICAgICAgICBpZiAoIXRoaXMuZG9jdW1lbnRzW3R5cGVdKSB7XG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50c1t0eXBlXSA9IHt9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVE9ETzogZml4IHRoaXM/IFR5cGVzIHNlZW0gY29tcGF0aWJsZSB0byBtZSEgVFMgY29tcGxhaW5zIHRob3VnaC4uLlxuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICB0aGlzLmRvY3VtZW50c1t0eXBlXVtpZF0gPSBkb2NcblxuICAgICAgICAgIHJlc29sdmUoZG9jKVxuICAgICAgICB9LFxuICAgICAgICByZWplY3Q6IGVyciA9PiB7XG4gICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG59XG5cbnR5cGUgRG9jdW1lbnRMaXN0ZW5lcjxURG9jID0gYW55PiA9IChcbiAgdmFsdWU6IFREb2MsXG4gIGRvYzogTGl2ZUVkaXREb2N1bWVudDxURG9jPlxuKSA9PiB2b2lkXG5cbmV4cG9ydCBjbGFzcyBMaXZlRWRpdERvY3VtZW50PFREb2MgPSBhbnk+IHtcbiAgdHlwZTogc3RyaW5nXG4gIGlkOiBzdHJpbmdcbiAgY2xpZW50OiBMaXZlRWRpdENsaWVudDxhbnk+XG5cbiAgLy8gTGlzdGVuZXJzXG4gIGxpc3RlbmVyczogRG9jdW1lbnRMaXN0ZW5lcltdID0gW11cblxuICAvLyBGYWxzZSB3aGVuIHRoZSBkb2N1bWVudCBoYXNuJ3QgeWV0IGxvYWRlZCwgdHJ1ZSB3aGVuIGl0IGhhc1xuICByZWFkeTogYm9vbGVhbiA9IGZhbHNlXG4gIC8vIFRydWUgd2hlbiBhIHByb3Bvc2FsIGlzIGluIHByb2dyZXNzXG4gIHByb3Bvc2luZzogYm9vbGVhbiA9IGZhbHNlXG4gIHBlbmRpbmdSZXNwb25zZXM6IHtcbiAgICBbY2hhbmdlSUQ6IHN0cmluZ106IChyZXN1bHQ6IFByb3Bvc2FsUmVzdWx0KSA9PiB2b2lkXG4gIH0gPSB7fVxuXG4gIC8vIFRoZSBjb25maXJtZWQgc3RhdGUgYW5kIGJhc2VJRFxuICB2YWx1ZT86IFREb2NcbiAgYmFzZUlEOiBzdHJpbmcgPSBcIlwiXG5cbiAgLy8gVGhlIG9wdGltaXN0aWMgdmFsdWUgYW5kIGJhc2VJRFxuICBjb25maXJtZWRWYWx1ZT86IFREb2NcbiAgY29uZmlybWVkQmFzZUlEOiBzdHJpbmcgPSBcIlwiXG5cbiAgcXVldWU6IHtcbiAgICBjaGFuZ2VJRDogc3RyaW5nXG4gICAgZnVuYzogKGRyYWZ0OiBURG9jKSA9PiB2b2lkXG4gICAgcGF0Y2hlczogUGF0Y2hbXVxuICB9W10gPSBbXVxuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgaWQ6IHN0cmluZywgY2xpZW50OiBMaXZlRWRpdENsaWVudDxhbnk+KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuaWQgPSBpZFxuICAgIHRoaXMuY2xpZW50ID0gY2xpZW50XG4gIH1cblxuICBwcm9wb3NlKGZ1bmM6IChkcmFmdDogVERvYykgPT4gdm9pZCkge1xuICAgIGNvbnNvbGUubG9nKFwiUHJvcG9zaW5nXCIpXG4gICAgY29uc3QgY2hhbmdlSUQgPSB1dWlkKClcbiAgICAvLyBsZXQgcGF0Y2hlczogUGF0Y2hbXVxuICAgIGNvbnNvbGUubG9nKFwiT2xkIHZhbHVlXCIsIHRoaXMudmFsdWUpXG4gICAgY29uc3QgW25leHRWYWx1ZSwgcGF0Y2hlc10gPSBwcm9kdWNlV2l0aFBhdGNoZXModGhpcy52YWx1ZSwgZHJhZnQgPT4ge1xuICAgICAgZnVuYyhkcmFmdCBhcyBURG9jKVxuICAgIH0pXG4gICAgdGhpcy52YWx1ZSA9IG5leHRWYWx1ZVxuICAgIHRoaXMucXVldWUucHVzaCh7XG4gICAgICBjaGFuZ2VJRCxcbiAgICAgIGZ1bmMsXG4gICAgICBwYXRjaGVzXG4gICAgfSlcbiAgICB0aGlzLmNoYW5nZWQoKVxuICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5kaXN0cmlidXRlRmlyc3RDaGFuZ2UoKVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNlbmRQcm9wb3NhbChjaGFuZ2U6IENoYW5nZSk6IFByb21pc2U8UHJvcG9zYWxSZXN1bHQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnBlbmRpbmdSZXNwb25zZXNbY2hhbmdlLmNoYW5nZUlEXSA9IHJlc29sdmVcbiAgICAgIHRoaXMuY2xpZW50LnNlbmQoW1wicHJvcG9zZVwiLCB7IGlkOiB0aGlzLmlkLCB0eXBlOiB0aGlzLnR5cGUsIGNoYW5nZSB9XSlcbiAgICB9KVxuICB9XG5cbiAgYXN5bmMgZGlzdHJpYnV0ZUZpcnN0Q2hhbmdlKCkge1xuICAgIGlmICh0aGlzLnByb3Bvc2luZykgcmV0dXJuXG4gICAgY29uc3QgY2hhbmdlID0gdGhpcy5xdWV1ZVswXVxuICAgIHRoaXMucHJvcG9zaW5nID0gdHJ1ZVxuICAgIGNvbnNvbGUubG9nKFwiRGlzdHJpYnV0aW5nXCIpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnNlbmRQcm9wb3NhbCh7XG4gICAgICBiYXNlSUQ6IHRoaXMuY29uZmlybWVkQmFzZUlELFxuICAgICAgY2hhbmdlSUQ6IGNoYW5nZS5jaGFuZ2VJRCxcbiAgICAgIHBhdGNoZXM6IGNoYW5nZS5wYXRjaGVzXG4gICAgfSlcbiAgICBjb25zb2xlLmxvZyhcIkdvdCByZXN1bHQgYmFja1wiKVxuICAgIHRoaXMucHJvcG9zaW5nID0gZmFsc2VcbiAgICBpZiAocmVzcG9uc2UgPT09IFwiTk9QRVwiKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkdvdCByZWplY3RlZFwiKVxuICAgICAgLy8gd2Uga2VlcCB0aGUgYWN0aW9ucyBmb3Igbm93LCBhbmQgd2Ugd2lsbCB0cnkgdG8gcmVwbGF5IHRoZW0gYWZ0ZXIgcmVjZWl2aW5nIHRoZSBuZXh0IGNoYW5nZVxuICAgIH0gZWxzZSBpZiAocmVzcG9uc2UgPT09IFwiRFJPUFwiKSB7XG4gICAgICAvLyB3ZSd2ZSBiZWVuIGluc3RydWN0ZWQgdG8gZHJvcCB0aGlzIGNoYW5nZVxuICAgICAgY29uc29sZS5sb2coXCJEcm9wcGluZ1wiKVxuICAgICAgbGV0IGRvYyA9IHRoaXMuY29uZmlybWVkVmFsdWVcbiAgICAgIHRoaXMucXVldWUuc2hpZnQoKVxuICAgICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgdGhpcy5xdWV1ZSkge1xuICAgICAgICBkb2MgPSBhcHBseVBhdGNoZXMoZG9jLCBjaGFuZ2UucGF0Y2hlcylcbiAgICAgIH1cbiAgICAgIHRoaXMudmFsdWUgPSBkb2NcbiAgICAgIHRoaXMuY2hhbmdlZCgpXG4gICAgICAvLyBTZW5kIHRoZSBuZXh0IGNoYW5nZSFcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkgdGhpcy5kaXN0cmlidXRlRmlyc3RDaGFuZ2UoKVxuICAgIH0gZWxzZSBpZiAocmVzcG9uc2UgPT09IFwiQUNLXCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQXBwbHlpbmdcIilcbiAgICAgIHRoaXMuY29uZmlybWVkVmFsdWUgPSBhcHBseVBhdGNoZXModGhpcy5jb25maXJtZWRWYWx1ZSwgY2hhbmdlLnBhdGNoZXMpXG4gICAgICB0aGlzLmNvbmZpcm1lZEJhc2VJRCA9IGNoYW5nZS5jaGFuZ2VJRFxuICAgICAgdGhpcy5xdWV1ZS5zaGlmdCgpXG4gICAgICAvLyBTZW5kIHRoZSBuZXh0IGNoYW5nZSFcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkgdGhpcy5kaXN0cmlidXRlRmlyc3RDaGFuZ2UoKVxuICAgIH1cbiAgICB0aGlzLmNoYW5nZWQoKVxuICB9XG5cbiAgc3Vic2NyaWJlKGhhbmRsZXI6IChkb2M6IFREb2MpID0+IHZvaWQpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGhhbmRsZXIpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5saXN0ZW5lcnMuaW5kZXhPZihoYW5kbGVyKVxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcGF0Y2goY2hhbmdlOiBDaGFuZ2UpIHtcbiAgICBjb25zb2xlLmxvZyhcIkNoYW5naW5nXCIsIGNoYW5nZSlcbiAgICBpZiAoY2hhbmdlLmJhc2VJRCAhPT0gdGhpcy5jb25maXJtZWRCYXNlSUQpIHRocm93IFwiSWxsZWdhbCBzdGF0ZVwiXG4gICAgdGhpcy5jb25maXJtZWRCYXNlSUQgPSBjaGFuZ2UuY2hhbmdlSURcbiAgICB0aGlzLmNvbmZpcm1lZFZhbHVlID0gYXBwbHlQYXRjaGVzKHRoaXMuY29uZmlybWVkVmFsdWUsIGNoYW5nZS5wYXRjaGVzKVxuICAgIGNvbnN0IHF1ZXVlID0gdGhpcy5xdWV1ZVxuICAgIHRoaXMucXVldWUgPSBbXVxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmNvbmZpcm1lZFZhbHVlXG5cbiAgICAvLyBBcHBseSBwZW5kaW5nIGNoYW5nZXMgYWdhaW5cbiAgICB3aGlsZSAocXVldWUubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwID0gcXVldWUuc2hpZnQoKVxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHApIHRoaXMucHJvcG9zZShwLmZ1bmMpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkRyb3BwZWQgY2hhbmdlLCBpdCBjYW4gbm8gbG9uZ2VyIGJlIGFwcGxpZWRcIilcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNoYW5nZWQoKVxuICB9XG5cbiAgc2V0SW5pdGlhbChiYXNlSUQ6IHN0cmluZywgZG9jOiBURG9jKSB7XG4gICAgdGhpcy52YWx1ZSA9IGRvY1xuICAgIHRoaXMuY29uZmlybWVkVmFsdWUgPSBkb2NcbiAgICB0aGlzLmJhc2VJRCA9IGJhc2VJRFxuICAgIHRoaXMuY29uZmlybWVkQmFzZUlEID0gYmFzZUlEXG4gICAgdGhpcy5yZWFkeSA9IHRydWVcbiAgICB0aGlzLmNoYW5nZWQoKVxuICB9XG5cbiAgY2hhbmdlZCgpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKHN1YnNjcmliZXIgPT4ge1xuICAgICAgc3Vic2NyaWJlcih0aGlzLnZhbHVlLCB0aGlzKVxuICAgIH0pXG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdXG4gICAgdGhpcy5jbGllbnQuc2VuZChbXCJ1bnN1YnNjcmliZVwiLCB7IHR5cGU6IHRoaXMudHlwZSwgaWQ6IHRoaXMuaWQgfV0pXG4gIH1cbn1cbiJdfQ==