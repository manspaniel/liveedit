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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

    _defineProperty(this, "connected", false);

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
            var typedItems = this.documents[type];

            if (typedItems) {
              if (_id in typedItems) {
                var liveEditDoc = typedItems[_id];
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

            if (_type in this.documents) {
              var _typedItems = this.documents[_type];

              if (_typedItems && _id2 in _typedItems) {
                var _liveEditDoc = _typedItems[_id2];

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
    value: function () {
      var _loadDocument = _asyncToGenerator(function* (type, id) {
        var _this = this;

        return new Promise(function (_resolve, _reject) {
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
        });
      });

      function loadDocument(_x, _x2) {
        return _loadDocument.apply(this, arguments);
      }

      return loadDocument;
    }()
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
      var changeID = (0, _v["default"])(); // let patches: Patch[]

      var _produceWithPatches = (0, _immer.produceWithPatches)(this.value, function (draft) {
        func(draft);
      }),
          _produceWithPatches2 = _slicedToArray(_produceWithPatches, 2),
          nextValue = _produceWithPatches2[0],
          patches = _produceWithPatches2[1];

      if (!patches || patches.length === 0) return;
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
    value: function () {
      var _sendProposal = _asyncToGenerator(function* (change) {
        var _this2 = this;

        return new Promise(function (resolve) {
          _this2.pendingResponses[change.changeID] = resolve;

          _this2.client.send(["propose", {
            id: _this2.id,
            type: _this2.type,
            change: change
          }]);
        });
      });

      function sendProposal(_x3) {
        return _sendProposal.apply(this, arguments);
      }

      return sendProposal;
    }()
  }, {
    key: "distributeFirstChange",
    value: function () {
      var _distributeFirstChange = _asyncToGenerator(function* () {
        if (this.proposing) return;
        var change = this.queue[0];
        this.proposing = true;
        var response = yield this.sendProposal({
          baseID: this.confirmedBaseID,
          changeID: change.changeID,
          patches: change.patches
        });
        this.proposing = false;

        if (response === "NOPE") {// we keep the actions for now, and we will try to replay them after receiving the next change
        } else if (response === "DROP") {
          // we've been instructed to drop this change
          var _doc = this.confirmedValue;
          this.queue.shift();
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = this.queue[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var _change = _step3.value;
              _doc = (0, _immer.applyPatches)(_doc, _change.patches);
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                _iterator3["return"]();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          this.value = _doc;
          this.changed(); // Send the next change!

          if (this.queue.length) this.distributeFirstChange();
        } else if (response === "ACK") {
          this.confirmedValue = (0, _immer.applyPatches)(this.confirmedValue, change.patches);
          this.confirmedBaseID = change.changeID;
          this.queue.shift(); // Send the next change!

          if (this.queue.length) this.distributeFirstChange();
        }

        this.changed();
      });

      function distributeFirstChange() {
        return _distributeFirstChange.apply(this, arguments);
      }

      return distributeFirstChange;
    }()
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQudHMiXSwibmFtZXMiOlsiTGl2ZUVkaXRDbGllbnQiLCJzZW5kIiwibXNnIiwic2VsZiIsImlkIiwidHlwZSIsImNoYW5nZSIsInR5cGVkSXRlbXMiLCJkb2N1bWVudHMiLCJsaXZlRWRpdERvYyIsInBhdGNoIiwiY2hhbmdlSUQiLCJyZXN1bHQiLCJwZW5kaW5nUmVzcG9uc2VzIiwidmFsdWUiLCJiYXNlSUQiLCJMaXZlRWRpdERvY3VtZW50Iiwic2V0SW5pdGlhbCIsInBlbmRpbmdEb2N1bWVudHMiLCJwZW5kaW5nIiwicmVzb2x2ZSIsImVycm9yTWVzc2FnZSIsInJlamVjdCIsIkVycm9yIiwiUHJvbWlzZSIsIlN0cmluZyIsInB1c2giLCJkb2MiLCJlcnIiLCJjbGllbnQiLCJmdW5jIiwiZHJhZnQiLCJuZXh0VmFsdWUiLCJwYXRjaGVzIiwibGVuZ3RoIiwicXVldWUiLCJjaGFuZ2VkIiwiZGlzdHJpYnV0ZUZpcnN0Q2hhbmdlIiwicHJvcG9zaW5nIiwicmVzcG9uc2UiLCJzZW5kUHJvcG9zYWwiLCJjb25maXJtZWRCYXNlSUQiLCJjb25maXJtZWRWYWx1ZSIsInNoaWZ0IiwiaGFuZGxlciIsImxpc3RlbmVycyIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInAiLCJwcm9wb3NlIiwiZSIsImNvbnNvbGUiLCJ3YXJuIiwicmVhZHkiLCJmb3JFYWNoIiwic3Vic2NyaWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFTYUEsYzs7O0FBaUJYLDBCQUFZQyxJQUFaLEVBQXdEO0FBQUE7O0FBQUEsdUNBWnBELEVBWW9EOztBQUFBOztBQUFBLDhDQUpsRCxFQUlrRDs7QUFBQSx1Q0FGbkMsS0FFbUM7O0FBQ3RELFNBQUtBLElBQUwsR0FBWUEsSUFBWjtBQUNEOzs7O2tDQUVhQyxHLEVBQTRCO0FBQ3hDLFVBQU1DLElBQUksR0FBRyxJQUFiOztBQUNBLGNBQVFELEdBQUcs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QUFFLEVBQUUsS0FBS0E7QUFBNUIsT0FBaEIsQ0FBakI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFNlcnZlclRvQ2xpZW50TWVzc2FnZSxcbiAgQ2xpZW50VG9TZXJ2ZXJNZXNzYWdlLFxuICBDaGFuZ2UsXG4gIFByb3Bvc2FsUmVzdWx0XG59IGZyb20gXCIuL3Byb3RvY29sXCJcbmltcG9ydCBwcm9kdWNlLCB7IFBhdGNoLCBhcHBseVBhdGNoZXMsIHByb2R1Y2VXaXRoUGF0Y2hlcyB9IGZyb20gXCJpbW1lclwiXG5pbXBvcnQgdXVpZCBmcm9tIFwidXVpZC92NFwiXG5pbXBvcnQgeyBzdHJpbmcgfSBmcm9tIFwicHJvcC10eXBlc1wiXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcImRuc1wiXG5pbXBvcnQgeyByZWplY3RzIH0gZnJvbSBcImFzc2VydFwiXG5cbmludGVyZmFjZSBEb2NUeXBlU2V0IHtcbiAgW3R5cGVOYW1lOiBzdHJpbmddOiBhbnlcbn1cblxuZXhwb3J0IGNsYXNzIExpdmVFZGl0Q2xpZW50PFREb2NUeXBlU2V0IGV4dGVuZHMgRG9jVHlwZVNldD4ge1xuICBkb2N1bWVudHM6IHtcbiAgICBba2V5IGluIGtleW9mIFREb2NUeXBlU2V0XT86IHtcbiAgICAgIFtpZDogc3RyaW5nXTogTGl2ZUVkaXREb2N1bWVudDxURG9jVHlwZVNldFtrZXldPlxuICAgIH1cbiAgfSA9IHt9XG4gIHNlbmQ6IChtc2c6IENsaWVudFRvU2VydmVyTWVzc2FnZSkgPT4gdm9pZFxuXG4gIHBlbmRpbmdEb2N1bWVudHM6IHtcbiAgICB0eXBlOiBzdHJpbmdcbiAgICBpZDogc3RyaW5nXG4gICAgcmVzb2x2ZTogKHZhbDogYW55KSA9PiB2b2lkXG4gICAgcmVqZWN0OiAoZXJyOiBFcnJvcikgPT4gdm9pZFxuICB9W10gPSBbXVxuXG4gIGNvbm5lY3RlZDogYm9vbGVhbiA9IGZhbHNlXG5cbiAgY29uc3RydWN0b3Ioc2VuZDogKG1zZzogQ2xpZW50VG9TZXJ2ZXJNZXNzYWdlKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5zZW5kID0gc2VuZFxuICB9XG5cbiAgaGFuZGxlTWVzc2FnZShtc2c6IFNlcnZlclRvQ2xpZW50TWVzc2FnZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgc3dpdGNoIChtc2dbMF0pIHtcbiAgICAgIGNhc2UgXCJjaGFuZ2VkXCI6XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlLCBjaGFuZ2UgfSA9IG1zZ1sxXVxuICAgICAgICAgIGNvbnN0IHR5cGVkSXRlbXMgPSB0aGlzLmRvY3VtZW50c1t0eXBlXVxuICAgICAgICAgIGlmICh0eXBlZEl0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaWQgaW4gdHlwZWRJdGVtcykge1xuICAgICAgICAgICAgICBjb25zdCBsaXZlRWRpdERvYzogTGl2ZUVkaXREb2N1bWVudCA9IHR5cGVkSXRlbXNbaWRdXG4gICAgICAgICAgICAgIGxpdmVFZGl0RG9jLnBhdGNoKGNoYW5nZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJwcm9wb3NhbFJlc3VsdFwiOlxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgeyBpZCwgdHlwZSwgY2hhbmdlSUQsIHJlc3VsdCB9ID0gbXNnWzFdXG4gICAgICAgICAgaWYgKHR5cGUgaW4gdGhpcy5kb2N1bWVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVkSXRlbXMgPSB0aGlzLmRvY3VtZW50c1t0eXBlXVxuICAgICAgICAgICAgaWYgKHR5cGVkSXRlbXMgJiYgaWQgaW4gdHlwZWRJdGVtcykge1xuICAgICAgICAgICAgICBjb25zdCBsaXZlRWRpdERvYzogTGl2ZUVkaXREb2N1bWVudCA9IHR5cGVkSXRlbXNbaWRdXG4gICAgICAgICAgICAgIGlmIChsaXZlRWRpdERvYy5wZW5kaW5nUmVzcG9uc2VzW2NoYW5nZUlEXSkge1xuICAgICAgICAgICAgICAgIGxpdmVFZGl0RG9jLnBlbmRpbmdSZXNwb25zZXNbY2hhbmdlSURdKHJlc3VsdClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImluaXRpYWxcIjpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IHsgaWQsIHR5cGUsIHZhbHVlLCBiYXNlSUQgfSA9IG1zZ1sxXVxuICAgICAgICAgIGNvbnN0IGxpdmVFZGl0RG9jOiBMaXZlRWRpdERvY3VtZW50ID0gbmV3IExpdmVFZGl0RG9jdW1lbnQoXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICB0aGlzXG4gICAgICAgICAgKVxuICAgICAgICAgIGxpdmVFZGl0RG9jLnNldEluaXRpYWwoYmFzZUlELCB2YWx1ZSlcbiAgICAgICAgICBmb3IgKGNvbnN0IHBlbmRpbmcgb2YgdGhpcy5wZW5kaW5nRG9jdW1lbnRzKSB7XG4gICAgICAgICAgICBpZiAocGVuZGluZy50eXBlID09PSB0eXBlICYmIHBlbmRpbmcuaWQgPT09IGlkKSB7XG4gICAgICAgICAgICAgIHBlbmRpbmcucmVzb2x2ZShsaXZlRWRpdERvYylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgeyBpZCwgdHlwZSwgZXJyb3JNZXNzYWdlIH0gPSBtc2dbMV1cbiAgICAgICAgICBmb3IgKGNvbnN0IHBlbmRpbmcgb2YgdGhpcy5wZW5kaW5nRG9jdW1lbnRzKSB7XG4gICAgICAgICAgICBpZiAocGVuZGluZy50eXBlID09PSB0eXBlICYmIHBlbmRpbmcuaWQgPT09IGlkKSB7XG4gICAgICAgICAgICAgIHBlbmRpbmcucmVqZWN0KG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxvYWREb2N1bWVudDxcbiAgICBUVHlwZU5hbWUgZXh0ZW5kcyBrZXlvZiBURG9jVHlwZVNldCxcbiAgICBURG9jVHlwZSA9IFREb2NUeXBlU2V0W1RUeXBlTmFtZV1cbiAgPih0eXBlOiBUVHlwZU5hbWUsIGlkOiBzdHJpbmcpOiBQcm9taXNlPExpdmVFZGl0RG9jdW1lbnQ8VERvY1R5cGU+PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIFN1YnNjcmliZVxuICAgICAgdGhpcy5zZW5kKFtcInN1YnNjcmliZVwiLCB7IGlkOiBTdHJpbmcoaWQpLCB0eXBlOiBTdHJpbmcodHlwZSkgfV0pXG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgZG9jdW1lbnRcbiAgICAgIHRoaXMucGVuZGluZ0RvY3VtZW50cy5wdXNoKHtcbiAgICAgICAgdHlwZTogU3RyaW5nKHR5cGUpLFxuICAgICAgICBpZDogaWQsXG4gICAgICAgIHJlc29sdmU6IGRvYyA9PiB7XG4gICAgICAgICAgLy8gU2F2ZSBpdFxuICAgICAgICAgIGlmICghdGhpcy5kb2N1bWVudHNbdHlwZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRzW3R5cGVdID0ge31cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUT0RPOiBmaXggdGhpcz8gVHlwZXMgc2VlbSBjb21wYXRpYmxlIHRvIG1lISBUUyBjb21wbGFpbnMgdGhvdWdoLi4uXG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIHRoaXMuZG9jdW1lbnRzW3R5cGVdW2lkXSA9IGRvY1xuXG4gICAgICAgICAgcmVzb2x2ZShkb2MpXG4gICAgICAgIH0sXG4gICAgICAgIHJlamVjdDogZXJyID0+IHtcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cbn1cblxudHlwZSBEb2N1bWVudExpc3RlbmVyPFREb2MgPSBhbnk+ID0gKFxuICB2YWx1ZTogVERvYyxcbiAgZG9jOiBMaXZlRWRpdERvY3VtZW50PFREb2M+XG4pID0+IHZvaWRcblxuZXhwb3J0IGNsYXNzIExpdmVFZGl0RG9jdW1lbnQ8VERvYyA9IGFueT4ge1xuICB0eXBlOiBzdHJpbmdcbiAgaWQ6IHN0cmluZ1xuICBjbGllbnQ6IExpdmVFZGl0Q2xpZW50PGFueT5cblxuICAvLyBMaXN0ZW5lcnNcbiAgbGlzdGVuZXJzOiBEb2N1bWVudExpc3RlbmVyW10gPSBbXVxuXG4gIC8vIEZhbHNlIHdoZW4gdGhlIGRvY3VtZW50IGhhc24ndCB5ZXQgbG9hZGVkLCB0cnVlIHdoZW4gaXQgaGFzXG4gIHJlYWR5OiBib29sZWFuID0gZmFsc2VcbiAgLy8gVHJ1ZSB3aGVuIGEgcHJvcG9zYWwgaXMgaW4gcHJvZ3Jlc3NcbiAgcHJvcG9zaW5nOiBib29sZWFuID0gZmFsc2VcbiAgcGVuZGluZ1Jlc3BvbnNlczoge1xuICAgIFtjaGFuZ2VJRDogc3RyaW5nXTogKHJlc3VsdDogUHJvcG9zYWxSZXN1bHQpID0+IHZvaWRcbiAgfSA9IHt9XG5cbiAgLy8gVGhlIGNvbmZpcm1lZCBzdGF0ZSBhbmQgYmFzZUlEXG4gIHZhbHVlPzogVERvY1xuICBiYXNlSUQ6IHN0cmluZyA9IFwiXCJcblxuICAvLyBUaGUgb3B0aW1pc3RpYyB2YWx1ZSBhbmQgYmFzZUlEXG4gIGNvbmZpcm1lZFZhbHVlPzogVERvY1xuICBjb25maXJtZWRCYXNlSUQ6IHN0cmluZyA9IFwiXCJcblxuICBxdWV1ZToge1xuICAgIGNoYW5nZUlEOiBzdHJpbmdcbiAgICBmdW5jOiAoZHJhZnQ6IFREb2MpID0+IHZvaWRcbiAgICBwYXRjaGVzOiBQYXRjaFtdXG4gIH1bXSA9IFtdXG5cbiAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBpZDogc3RyaW5nLCBjbGllbnQ6IExpdmVFZGl0Q2xpZW50PGFueT4pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5pZCA9IGlkXG4gICAgdGhpcy5jbGllbnQgPSBjbGllbnRcbiAgfVxuXG4gIHByb3Bvc2UoZnVuYzogKGRyYWZ0OiBURG9jKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgY2hhbmdlSUQgPSB1dWlkKClcbiAgICAvLyBsZXQgcGF0Y2hlczogUGF0Y2hbXVxuICAgIGNvbnN0IFtuZXh0VmFsdWUsIHBhdGNoZXNdID0gcHJvZHVjZVdpdGhQYXRjaGVzKHRoaXMudmFsdWUsIGRyYWZ0ID0+IHtcbiAgICAgIGZ1bmMoZHJhZnQgYXMgVERvYylcbiAgICB9KVxuICAgIGlmICghcGF0Y2hlcyB8fCBwYXRjaGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG4gICAgdGhpcy52YWx1ZSA9IG5leHRWYWx1ZVxuICAgIHRoaXMucXVldWUucHVzaCh7XG4gICAgICBjaGFuZ2VJRCxcbiAgICAgIGZ1bmMsXG4gICAgICBwYXRjaGVzXG4gICAgfSlcbiAgICB0aGlzLmNoYW5nZWQoKVxuICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5kaXN0cmlidXRlRmlyc3RDaGFuZ2UoKVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNlbmRQcm9wb3NhbChjaGFuZ2U6IENoYW5nZSk6IFByb21pc2U8UHJvcG9zYWxSZXN1bHQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnBlbmRpbmdSZXNwb25zZXNbY2hhbmdlLmNoYW5nZUlEXSA9IHJlc29sdmVcbiAgICAgIHRoaXMuY2xpZW50LnNlbmQoW1wicHJvcG9zZVwiLCB7IGlkOiB0aGlzLmlkLCB0eXBlOiB0aGlzLnR5cGUsIGNoYW5nZSB9XSlcbiAgICB9KVxuICB9XG5cbiAgYXN5bmMgZGlzdHJpYnV0ZUZpcnN0Q2hhbmdlKCkge1xuICAgIGlmICh0aGlzLnByb3Bvc2luZykgcmV0dXJuXG4gICAgY29uc3QgY2hhbmdlID0gdGhpcy5xdWV1ZVswXVxuICAgIHRoaXMucHJvcG9zaW5nID0gdHJ1ZVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5zZW5kUHJvcG9zYWwoe1xuICAgICAgYmFzZUlEOiB0aGlzLmNvbmZpcm1lZEJhc2VJRCxcbiAgICAgIGNoYW5nZUlEOiBjaGFuZ2UuY2hhbmdlSUQsXG4gICAgICBwYXRjaGVzOiBjaGFuZ2UucGF0Y2hlc1xuICAgIH0pXG4gICAgdGhpcy5wcm9wb3NpbmcgPSBmYWxzZVxuICAgIGlmIChyZXNwb25zZSA9PT0gXCJOT1BFXCIpIHtcbiAgICAgIC8vIHdlIGtlZXAgdGhlIGFjdGlvbnMgZm9yIG5vdywgYW5kIHdlIHdpbGwgdHJ5IHRvIHJlcGxheSB0aGVtIGFmdGVyIHJlY2VpdmluZyB0aGUgbmV4dCBjaGFuZ2VcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlID09PSBcIkRST1BcIikge1xuICAgICAgLy8gd2UndmUgYmVlbiBpbnN0cnVjdGVkIHRvIGRyb3AgdGhpcyBjaGFuZ2VcbiAgICAgIGxldCBkb2MgPSB0aGlzLmNvbmZpcm1lZFZhbHVlXG4gICAgICB0aGlzLnF1ZXVlLnNoaWZ0KClcbiAgICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIHRoaXMucXVldWUpIHtcbiAgICAgICAgZG9jID0gYXBwbHlQYXRjaGVzKGRvYywgY2hhbmdlLnBhdGNoZXMpXG4gICAgICB9XG4gICAgICB0aGlzLnZhbHVlID0gZG9jXG4gICAgICB0aGlzLmNoYW5nZWQoKVxuICAgICAgLy8gU2VuZCB0aGUgbmV4dCBjaGFuZ2UhXG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGgpIHRoaXMuZGlzdHJpYnV0ZUZpcnN0Q2hhbmdlKClcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlID09PSBcIkFDS1wiKSB7XG4gICAgICB0aGlzLmNvbmZpcm1lZFZhbHVlID0gYXBwbHlQYXRjaGVzKHRoaXMuY29uZmlybWVkVmFsdWUsIGNoYW5nZS5wYXRjaGVzKVxuICAgICAgdGhpcy5jb25maXJtZWRCYXNlSUQgPSBjaGFuZ2UuY2hhbmdlSURcbiAgICAgIHRoaXMucXVldWUuc2hpZnQoKVxuICAgICAgLy8gU2VuZCB0aGUgbmV4dCBjaGFuZ2UhXG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGgpIHRoaXMuZGlzdHJpYnV0ZUZpcnN0Q2hhbmdlKClcbiAgICB9XG4gICAgdGhpcy5jaGFuZ2VkKClcbiAgfVxuXG4gIHN1YnNjcmliZShoYW5kbGVyOiAoZG9jOiBURG9jKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaChoYW5kbGVyKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMubGlzdGVuZXJzLmluZGV4T2YoaGFuZGxlcilcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHBhdGNoKGNoYW5nZTogQ2hhbmdlKSB7XG4gICAgaWYgKGNoYW5nZS5iYXNlSUQgIT09IHRoaXMuY29uZmlybWVkQmFzZUlEKSB0aHJvdyBcIklsbGVnYWwgc3RhdGVcIlxuICAgIHRoaXMuY29uZmlybWVkQmFzZUlEID0gY2hhbmdlLmNoYW5nZUlEXG4gICAgdGhpcy5jb25maXJtZWRWYWx1ZSA9IGFwcGx5UGF0Y2hlcyh0aGlzLmNvbmZpcm1lZFZhbHVlLCBjaGFuZ2UucGF0Y2hlcylcbiAgICBjb25zdCBxdWV1ZSA9IHRoaXMucXVldWVcbiAgICB0aGlzLnF1ZXVlID0gW11cbiAgICB0aGlzLnZhbHVlID0gdGhpcy5jb25maXJtZWRWYWx1ZVxuXG4gICAgLy8gQXBwbHkgcGVuZGluZyBjaGFuZ2VzIGFnYWluXG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgY29uc3QgcCA9IHF1ZXVlLnNoaWZ0KClcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChwKSB0aGlzLnByb3Bvc2UocC5mdW5jKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJEcm9wcGVkIGNoYW5nZSwgaXQgY2FuIG5vIGxvbmdlciBiZSBhcHBsaWVkXCIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VkKClcbiAgfVxuXG4gIHNldEluaXRpYWwoYmFzZUlEOiBzdHJpbmcsIGRvYzogVERvYykge1xuICAgIHRoaXMudmFsdWUgPSBkb2NcbiAgICB0aGlzLmNvbmZpcm1lZFZhbHVlID0gZG9jXG4gICAgdGhpcy5iYXNlSUQgPSBiYXNlSURcbiAgICB0aGlzLmNvbmZpcm1lZEJhc2VJRCA9IGJhc2VJRFxuICAgIHRoaXMucmVhZHkgPSB0cnVlXG4gICAgdGhpcy5jaGFuZ2VkKClcbiAgfVxuXG4gIGNoYW5nZWQoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaChzdWJzY3JpYmVyID0+IHtcbiAgICAgIHN1YnNjcmliZXIodGhpcy52YWx1ZSwgdGhpcylcbiAgICB9KVxuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXVxuICAgIHRoaXMuY2xpZW50LnNlbmQoW1widW5zdWJzY3JpYmVcIiwgeyB0eXBlOiB0aGlzLnR5cGUsIGlkOiB0aGlzLmlkIH1dKVxuICB9XG59XG4iXX0=