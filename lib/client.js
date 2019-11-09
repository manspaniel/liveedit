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
      console.log("Proposing");
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
        console.log("Distributing");
        var response = yield this.sendProposal({
          baseID: this.confirmedBaseID,
          changeID: change.changeID,
          patches: change.patches
        });
        console.log("Got result back");
        this.proposing = false;

        if (response === "NOPE") {
          console.log("Got rejected"); // we keep the actions for now, and we will try to replay them after receiving the next change
        } else if (response === "DROP") {
          // we've been instructed to drop this change
          console.log("Dropping");
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
          console.log("Applying");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQudHMiXSwibmFtZXMiOlsiTGl2ZUVkaXRDbGllbnQiLCJzZW5kIiwibXNnIiwic2VsZiIsImlkIiwidHlwZSIsImNoYW5nZSIsImNvbnNvbGUiLCJsb2ciLCJ0eXBlZEl0ZW1zIiwiZG9jdW1lbnRzIiwibGl2ZUVkaXREb2MiLCJwYXRjaCIsImNoYW5nZUlEIiwicmVzdWx0IiwicGVuZGluZ1Jlc3BvbnNlcyIsInZhbHVlIiwiYmFzZUlEIiwiTGl2ZUVkaXREb2N1bWVudCIsInNldEluaXRpYWwiLCJwZW5kaW5nRG9jdW1lbnRzIiwicGVuZGluZyIsInJlc29sdmUiLCJlcnJvck1lc3NhZ2UiLCJyZWplY3QiLCJFcnJvciIsIlByb21pc2UiLCJTdHJpbmciLCJwdXNoIiwiZG9jIiwiZXJyIiwiY2xpZW50IiwiZnVuYyIsImRyYWZ0IiwibmV4dFZhbHVlIiwicGF0Y2hlcyIsImxlbmd0aCIsInF1ZXVlIiwiY2hhbmdlZCIsImRpc3RyaWJ1dGVGaXJzdENoYW5nZSIsInByb3Bvc2luZyIsInJlc3BvbnNlIiwic2VuZFByb3Bvc2FsIiwiY29uZmlybWVkQmFzZUlEIiwiY29uZmlybWVkVmFsdWUiLCJzaGlmdCIsImhhbmRsZXIiLCJsaXN0ZW5lcnMiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJwIiwicHJvcG9zZSIsImUiLCJ3YXJuIiwicmVhZHkiLCJmb3JFYWNoIiwic3Vic2NyaWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFTYUEsYzs7O0FBaUJYLDBCQUFZQyxJQUFaLEVBQXdEO0FBQUE7O0FBQUEsdUNBWnBELEVBWW9EOztBQUFBOztBQUFBLDhDQUpsRCxFQUlrRDs7QUFBQSx1Q0FGbkMsS0FFbUM7O0FBQ3RELFNBQUtBLElBQUwsR0FBWUEsSUFBWjtBQUNEOzs7O2tDQUVhQyxHLEVBQTRCO0FBQ3hDLFVBQU1DLElBQUksR0FBRyxJQUFiOztBQUNBLGNBQVFE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LEtBQU4sRUFBVjs7QUFDQSxZQUFJO0FBQ0YsY0FBSU0sQ0FBSixFQUFPLEtBQUtDLE9BQUwsQ0FBYUQsQ0FBQyxDQUFDbkIsSUFBZjtBQUNSLFNBRkQsQ0FFRSxPQUFPcUIsQ0FBUCxFQUFVO0FBQ1Y5QyxVQUFBQSxPQUFPLENBQUMrQyxJQUFSLENBQWEsNkNBQWI7QUFDRDtBQUNGOztBQUVELFdBQUtoQixPQUFMO0FBQ0Q7OzsrQkFFVXJCLE0sRUFBZ0JZLEcsRUFBVztBQUNwQyxXQUFLYixLQUFMLEdBQWFhLEdBQWI7QUFDQSxXQUFLZSxjQUFMLEdBQXNCZixHQUF0QjtBQUNBLFdBQUtaLE1BQUwsR0FBY0EsTUFBZDtBQUNBLFdBQUswQixlQUFMLEdBQXVCMUIsTUFBdkI7QUFDQSxXQUFLc0MsS0FBTCxHQUFhLElBQWI7QUFDQSxXQUFLakIsT0FBTDtBQUNEOzs7OEJBRVM7QUFBQTs7QUFDUixXQUFLUyxTQUFMLENBQWVTLE9BQWYsQ0FBdUIsVUFBQUMsVUFBVSxFQUFJO0FBQ25DQSxRQUFBQSxVQUFVLENBQUMsTUFBSSxDQUFDekMsS0FBTixFQUFhLE1BQWIsQ0FBVjtBQUNELE9BRkQ7QUFHRDs7OzRCQUVPO0FBQ04sV0FBSytCLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxXQUFLaEIsTUFBTCxDQUFZOUIsSUFBWixDQUFpQixDQUFDLGFBQUQsRUFBZ0I7QUFBRUksUUFBQUEsSUFBSSxFQUFFLEtBQUtBLElBQWI7QUFBbUJELFFBQUFBLEVBQUUsRUFBRSxLQUFLQTtBQUE1QixPQUFoQixDQUFqQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU2VydmVyVG9DbGllbnRNZXNzYWdlLFxuICBDbGllbnRUb1NlcnZlck1lc3NhZ2UsXG4gIENoYW5nZSxcbiAgUHJvcG9zYWxSZXN1bHRcbn0gZnJvbSBcIi4vcHJvdG9jb2xcIlxuaW1wb3J0IHByb2R1Y2UsIHsgUGF0Y2gsIGFwcGx5UGF0Y2hlcywgcHJvZHVjZVdpdGhQYXRjaGVzIH0gZnJvbSBcImltbWVyXCJcbmltcG9ydCB1dWlkIGZyb20gXCJ1dWlkL3Y0XCJcbmltcG9ydCB7IHN0cmluZyB9IGZyb20gXCJwcm9wLXR5cGVzXCJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwiZG5zXCJcbmltcG9ydCB7IHJlamVjdHMgfSBmcm9tIFwiYXNzZXJ0XCJcblxuaW50ZXJmYWNlIERvY1R5cGVTZXQge1xuICBbdHlwZU5hbWU6IHN0cmluZ106IGFueVxufVxuXG5leHBvcnQgY2xhc3MgTGl2ZUVkaXRDbGllbnQ8VERvY1R5cGVTZXQgZXh0ZW5kcyBEb2NUeXBlU2V0PiB7XG4gIGRvY3VtZW50czoge1xuICAgIFtrZXkgaW4ga2V5b2YgVERvY1R5cGVTZXRdPzoge1xuICAgICAgW2lkOiBzdHJpbmddOiBMaXZlRWRpdERvY3VtZW50PFREb2NUeXBlU2V0W2tleV0+XG4gICAgfVxuICB9ID0ge31cbiAgc2VuZDogKG1zZzogQ2xpZW50VG9TZXJ2ZXJNZXNzYWdlKSA9PiB2b2lkXG5cbiAgcGVuZGluZ0RvY3VtZW50czoge1xuICAgIHR5cGU6IHN0cmluZ1xuICAgIGlkOiBzdHJpbmdcbiAgICByZXNvbHZlOiAodmFsOiBhbnkpID0+IHZvaWRcbiAgICByZWplY3Q6IChlcnI6IEVycm9yKSA9PiB2b2lkXG4gIH1bXSA9IFtdXG5cbiAgY29ubmVjdGVkOiBib29sZWFuID0gZmFsc2VcblxuICBjb25zdHJ1Y3RvcihzZW5kOiAobXNnOiBDbGllbnRUb1NlcnZlck1lc3NhZ2UpID0+IHZvaWQpIHtcbiAgICB0aGlzLnNlbmQgPSBzZW5kXG4gIH1cblxuICBoYW5kbGVNZXNzYWdlKG1zZzogU2VydmVyVG9DbGllbnRNZXNzYWdlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXNcbiAgICBzd2l0Y2ggKG1zZ1swXSkge1xuICAgICAgY2FzZSBcImNoYW5nZWRcIjpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IHsgaWQsIHR5cGUsIGNoYW5nZSB9ID0gbXNnWzFdXG4gICAgICAgICAgY29uc29sZS5sb2coXCJHb3QgY2hhbmdlXCIsIGNoYW5nZSlcbiAgICAgICAgICBjb25zdCB0eXBlZEl0ZW1zID0gdGhpcy5kb2N1bWVudHNbdHlwZV1cbiAgICAgICAgICBpZiAodHlwZWRJdGVtcykge1xuICAgICAgICAgICAgaWYgKGlkIGluIHR5cGVkSXRlbXMpIHtcbiAgICAgICAgICAgICAgY29uc3QgbGl2ZUVkaXREb2M6IExpdmVFZGl0RG9jdW1lbnQgPSB0eXBlZEl0ZW1zW2lkXVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZvdW5kIGRvY1wiLCBsaXZlRWRpdERvYylcbiAgICAgICAgICAgICAgbGl2ZUVkaXREb2MucGF0Y2goY2hhbmdlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcInByb3Bvc2FsUmVzdWx0XCI6XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlLCBjaGFuZ2VJRCwgcmVzdWx0IH0gPSBtc2dbMV1cbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwiR290IHJlc3BvbnNlXCIsXG4gICAgICAgICAgICB0eXBlIGluIHRoaXMuZG9jdW1lbnRzLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRzXG4gICAgICAgICAgKVxuICAgICAgICAgIGlmICh0eXBlIGluIHRoaXMuZG9jdW1lbnRzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4gVHlwZVwiLCB0aGlzLmRvY3VtZW50cywgdHlwZSlcbiAgICAgICAgICAgIGNvbnN0IHR5cGVkSXRlbXMgPSB0aGlzLmRvY3VtZW50c1t0eXBlXVxuICAgICAgICAgICAgaWYgKHR5cGVkSXRlbXMgJiYgaWQgaW4gdHlwZWRJdGVtcykge1xuICAgICAgICAgICAgICBjb25zdCBsaXZlRWRpdERvYzogTGl2ZUVkaXREb2N1bWVudCA9IHR5cGVkSXRlbXNbaWRdXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRG9jP1wiLCBsaXZlRWRpdERvYy5wZW5kaW5nUmVzcG9uc2VzKVxuICAgICAgICAgICAgICBpZiAobGl2ZUVkaXREb2MucGVuZGluZ1Jlc3BvbnNlc1tjaGFuZ2VJRF0pIHtcbiAgICAgICAgICAgICAgICBsaXZlRWRpdERvYy5wZW5kaW5nUmVzcG9uc2VzW2NoYW5nZUlEXShyZXN1bHQpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJpbml0aWFsXCI6XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlLCB2YWx1ZSwgYmFzZUlEIH0gPSBtc2dbMV1cbiAgICAgICAgICBjb25zdCBsaXZlRWRpdERvYzogTGl2ZUVkaXREb2N1bWVudCA9IG5ldyBMaXZlRWRpdERvY3VtZW50KFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgdGhpc1xuICAgICAgICAgIClcbiAgICAgICAgICBsaXZlRWRpdERvYy5zZXRJbml0aWFsKGJhc2VJRCwgdmFsdWUpXG4gICAgICAgICAgZm9yIChjb25zdCBwZW5kaW5nIG9mIHRoaXMucGVuZGluZ0RvY3VtZW50cykge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcudHlwZSA9PT0gdHlwZSAmJiBwZW5kaW5nLmlkID09PSBpZCkge1xuICAgICAgICAgICAgICBwZW5kaW5nLnJlc29sdmUobGl2ZUVkaXREb2MpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IHsgaWQsIHR5cGUsIGVycm9yTWVzc2FnZSB9ID0gbXNnWzFdXG4gICAgICAgICAgZm9yIChjb25zdCBwZW5kaW5nIG9mIHRoaXMucGVuZGluZ0RvY3VtZW50cykge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcudHlwZSA9PT0gdHlwZSAmJiBwZW5kaW5nLmlkID09PSBpZCkge1xuICAgICAgICAgICAgICBwZW5kaW5nLnJlamVjdChuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2FkRG9jdW1lbnQ8XG4gICAgVFR5cGVOYW1lIGV4dGVuZHMga2V5b2YgVERvY1R5cGVTZXQsXG4gICAgVERvY1R5cGUgPSBURG9jVHlwZVNldFtUVHlwZU5hbWVdXG4gID4odHlwZTogVFR5cGVOYW1lLCBpZDogc3RyaW5nKTogUHJvbWlzZTxMaXZlRWRpdERvY3VtZW50PFREb2NUeXBlPj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBTdWJzY3JpYmVcbiAgICAgIHRoaXMuc2VuZChbXCJzdWJzY3JpYmVcIiwgeyBpZDogU3RyaW5nKGlkKSwgdHlwZTogU3RyaW5nKHR5cGUpIH1dKVxuXG4gICAgICAvLyBDcmVhdGUgdGhlIGRvY3VtZW50XG4gICAgICB0aGlzLnBlbmRpbmdEb2N1bWVudHMucHVzaCh7XG4gICAgICAgIHR5cGU6IFN0cmluZyh0eXBlKSxcbiAgICAgICAgaWQ6IGlkLFxuICAgICAgICByZXNvbHZlOiBkb2MgPT4ge1xuICAgICAgICAgIC8vIFNhdmUgaXRcbiAgICAgICAgICBpZiAoIXRoaXMuZG9jdW1lbnRzW3R5cGVdKSB7XG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50c1t0eXBlXSA9IHt9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVE9ETzogZml4IHRoaXM/IFR5cGVzIHNlZW0gY29tcGF0aWJsZSB0byBtZSEgVFMgY29tcGxhaW5zIHRob3VnaC4uLlxuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICB0aGlzLmRvY3VtZW50c1t0eXBlXVtpZF0gPSBkb2NcblxuICAgICAgICAgIHJlc29sdmUoZG9jKVxuICAgICAgICB9LFxuICAgICAgICByZWplY3Q6IGVyciA9PiB7XG4gICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG59XG5cbnR5cGUgRG9jdW1lbnRMaXN0ZW5lcjxURG9jID0gYW55PiA9IChcbiAgdmFsdWU6IFREb2MsXG4gIGRvYzogTGl2ZUVkaXREb2N1bWVudDxURG9jPlxuKSA9PiB2b2lkXG5cbmV4cG9ydCBjbGFzcyBMaXZlRWRpdERvY3VtZW50PFREb2MgPSBhbnk+IHtcbiAgdHlwZTogc3RyaW5nXG4gIGlkOiBzdHJpbmdcbiAgY2xpZW50OiBMaXZlRWRpdENsaWVudDxhbnk+XG5cbiAgLy8gTGlzdGVuZXJzXG4gIGxpc3RlbmVyczogRG9jdW1lbnRMaXN0ZW5lcltdID0gW11cblxuICAvLyBGYWxzZSB3aGVuIHRoZSBkb2N1bWVudCBoYXNuJ3QgeWV0IGxvYWRlZCwgdHJ1ZSB3aGVuIGl0IGhhc1xuICByZWFkeTogYm9vbGVhbiA9IGZhbHNlXG4gIC8vIFRydWUgd2hlbiBhIHByb3Bvc2FsIGlzIGluIHByb2dyZXNzXG4gIHByb3Bvc2luZzogYm9vbGVhbiA9IGZhbHNlXG4gIHBlbmRpbmdSZXNwb25zZXM6IHtcbiAgICBbY2hhbmdlSUQ6IHN0cmluZ106IChyZXN1bHQ6IFByb3Bvc2FsUmVzdWx0KSA9PiB2b2lkXG4gIH0gPSB7fVxuXG4gIC8vIFRoZSBjb25maXJtZWQgc3RhdGUgYW5kIGJhc2VJRFxuICB2YWx1ZT86IFREb2NcbiAgYmFzZUlEOiBzdHJpbmcgPSBcIlwiXG5cbiAgLy8gVGhlIG9wdGltaXN0aWMgdmFsdWUgYW5kIGJhc2VJRFxuICBjb25maXJtZWRWYWx1ZT86IFREb2NcbiAgY29uZmlybWVkQmFzZUlEOiBzdHJpbmcgPSBcIlwiXG5cbiAgcXVldWU6IHtcbiAgICBjaGFuZ2VJRDogc3RyaW5nXG4gICAgZnVuYzogKGRyYWZ0OiBURG9jKSA9PiB2b2lkXG4gICAgcGF0Y2hlczogUGF0Y2hbXVxuICB9W10gPSBbXVxuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgaWQ6IHN0cmluZywgY2xpZW50OiBMaXZlRWRpdENsaWVudDxhbnk+KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuaWQgPSBpZFxuICAgIHRoaXMuY2xpZW50ID0gY2xpZW50XG4gIH1cblxuICBwcm9wb3NlKGZ1bmM6IChkcmFmdDogVERvYykgPT4gdm9pZCkge1xuICAgIGNvbnN0IGNoYW5nZUlEID0gdXVpZCgpXG4gICAgLy8gbGV0IHBhdGNoZXM6IFBhdGNoW11cbiAgICBjb25zdCBbbmV4dFZhbHVlLCBwYXRjaGVzXSA9IHByb2R1Y2VXaXRoUGF0Y2hlcyh0aGlzLnZhbHVlLCBkcmFmdCA9PiB7XG4gICAgICBmdW5jKGRyYWZ0IGFzIFREb2MpXG4gICAgfSlcbiAgICBpZiAoIXBhdGNoZXMgfHwgcGF0Y2hlcy5sZW5ndGggPT09IDApIHJldHVyblxuICAgIGNvbnNvbGUubG9nKFwiUHJvcG9zaW5nXCIpXG4gICAgdGhpcy52YWx1ZSA9IG5leHRWYWx1ZVxuICAgIHRoaXMucXVldWUucHVzaCh7XG4gICAgICBjaGFuZ2VJRCxcbiAgICAgIGZ1bmMsXG4gICAgICBwYXRjaGVzXG4gICAgfSlcbiAgICB0aGlzLmNoYW5nZWQoKVxuICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5kaXN0cmlidXRlRmlyc3RDaGFuZ2UoKVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNlbmRQcm9wb3NhbChjaGFuZ2U6IENoYW5nZSk6IFByb21pc2U8UHJvcG9zYWxSZXN1bHQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnBlbmRpbmdSZXNwb25zZXNbY2hhbmdlLmNoYW5nZUlEXSA9IHJlc29sdmVcbiAgICAgIHRoaXMuY2xpZW50LnNlbmQoW1wicHJvcG9zZVwiLCB7IGlkOiB0aGlzLmlkLCB0eXBlOiB0aGlzLnR5cGUsIGNoYW5nZSB9XSlcbiAgICB9KVxuICB9XG5cbiAgYXN5bmMgZGlzdHJpYnV0ZUZpcnN0Q2hhbmdlKCkge1xuICAgIGlmICh0aGlzLnByb3Bvc2luZykgcmV0dXJuXG4gICAgY29uc3QgY2hhbmdlID0gdGhpcy5xdWV1ZVswXVxuICAgIHRoaXMucHJvcG9zaW5nID0gdHJ1ZVxuICAgIGNvbnNvbGUubG9nKFwiRGlzdHJpYnV0aW5nXCIpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnNlbmRQcm9wb3NhbCh7XG4gICAgICBiYXNlSUQ6IHRoaXMuY29uZmlybWVkQmFzZUlELFxuICAgICAgY2hhbmdlSUQ6IGNoYW5nZS5jaGFuZ2VJRCxcbiAgICAgIHBhdGNoZXM6IGNoYW5nZS5wYXRjaGVzXG4gICAgfSlcbiAgICBjb25zb2xlLmxvZyhcIkdvdCByZXN1bHQgYmFja1wiKVxuICAgIHRoaXMucHJvcG9zaW5nID0gZmFsc2VcbiAgICBpZiAocmVzcG9uc2UgPT09IFwiTk9QRVwiKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkdvdCByZWplY3RlZFwiKVxuICAgICAgLy8gd2Uga2VlcCB0aGUgYWN0aW9ucyBmb3Igbm93LCBhbmQgd2Ugd2lsbCB0cnkgdG8gcmVwbGF5IHRoZW0gYWZ0ZXIgcmVjZWl2aW5nIHRoZSBuZXh0IGNoYW5nZVxuICAgIH0gZWxzZSBpZiAocmVzcG9uc2UgPT09IFwiRFJPUFwiKSB7XG4gICAgICAvLyB3ZSd2ZSBiZWVuIGluc3RydWN0ZWQgdG8gZHJvcCB0aGlzIGNoYW5nZVxuICAgICAgY29uc29sZS5sb2coXCJEcm9wcGluZ1wiKVxuICAgICAgbGV0IGRvYyA9IHRoaXMuY29uZmlybWVkVmFsdWVcbiAgICAgIHRoaXMucXVldWUuc2hpZnQoKVxuICAgICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgdGhpcy5xdWV1ZSkge1xuICAgICAgICBkb2MgPSBhcHBseVBhdGNoZXMoZG9jLCBjaGFuZ2UucGF0Y2hlcylcbiAgICAgIH1cbiAgICAgIHRoaXMudmFsdWUgPSBkb2NcbiAgICAgIHRoaXMuY2hhbmdlZCgpXG4gICAgICAvLyBTZW5kIHRoZSBuZXh0IGNoYW5nZSFcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkgdGhpcy5kaXN0cmlidXRlRmlyc3RDaGFuZ2UoKVxuICAgIH0gZWxzZSBpZiAocmVzcG9uc2UgPT09IFwiQUNLXCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQXBwbHlpbmdcIilcbiAgICAgIHRoaXMuY29uZmlybWVkVmFsdWUgPSBhcHBseVBhdGNoZXModGhpcy5jb25maXJtZWRWYWx1ZSwgY2hhbmdlLnBhdGNoZXMpXG4gICAgICB0aGlzLmNvbmZpcm1lZEJhc2VJRCA9IGNoYW5nZS5jaGFuZ2VJRFxuICAgICAgdGhpcy5xdWV1ZS5zaGlmdCgpXG4gICAgICAvLyBTZW5kIHRoZSBuZXh0IGNoYW5nZSFcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkgdGhpcy5kaXN0cmlidXRlRmlyc3RDaGFuZ2UoKVxuICAgIH1cbiAgICB0aGlzLmNoYW5nZWQoKVxuICB9XG5cbiAgc3Vic2NyaWJlKGhhbmRsZXI6IChkb2M6IFREb2MpID0+IHZvaWQpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGhhbmRsZXIpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5saXN0ZW5lcnMuaW5kZXhPZihoYW5kbGVyKVxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcGF0Y2goY2hhbmdlOiBDaGFuZ2UpIHtcbiAgICBjb25zb2xlLmxvZyhcIkNoYW5naW5nXCIsIGNoYW5nZSlcbiAgICBpZiAoY2hhbmdlLmJhc2VJRCAhPT0gdGhpcy5jb25maXJtZWRCYXNlSUQpIHRocm93IFwiSWxsZWdhbCBzdGF0ZVwiXG4gICAgdGhpcy5jb25maXJtZWRCYXNlSUQgPSBjaGFuZ2UuY2hhbmdlSURcbiAgICB0aGlzLmNvbmZpcm1lZFZhbHVlID0gYXBwbHlQYXRjaGVzKHRoaXMuY29uZmlybWVkVmFsdWUsIGNoYW5nZS5wYXRjaGVzKVxuICAgIGNvbnN0IHF1ZXVlID0gdGhpcy5xdWV1ZVxuICAgIHRoaXMucXVldWUgPSBbXVxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmNvbmZpcm1lZFZhbHVlXG5cbiAgICAvLyBBcHBseSBwZW5kaW5nIGNoYW5nZXMgYWdhaW5cbiAgICB3aGlsZSAocXVldWUubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwID0gcXVldWUuc2hpZnQoKVxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHApIHRoaXMucHJvcG9zZShwLmZ1bmMpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkRyb3BwZWQgY2hhbmdlLCBpdCBjYW4gbm8gbG9uZ2VyIGJlIGFwcGxpZWRcIilcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNoYW5nZWQoKVxuICB9XG5cbiAgc2V0SW5pdGlhbChiYXNlSUQ6IHN0cmluZywgZG9jOiBURG9jKSB7XG4gICAgdGhpcy52YWx1ZSA9IGRvY1xuICAgIHRoaXMuY29uZmlybWVkVmFsdWUgPSBkb2NcbiAgICB0aGlzLmJhc2VJRCA9IGJhc2VJRFxuICAgIHRoaXMuY29uZmlybWVkQmFzZUlEID0gYmFzZUlEXG4gICAgdGhpcy5yZWFkeSA9IHRydWVcbiAgICB0aGlzLmNoYW5nZWQoKVxuICB9XG5cbiAgY2hhbmdlZCgpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKHN1YnNjcmliZXIgPT4ge1xuICAgICAgc3Vic2NyaWJlcih0aGlzLnZhbHVlLCB0aGlzKVxuICAgIH0pXG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdXG4gICAgdGhpcy5jbGllbnQuc2VuZChbXCJ1bnN1YnNjcmliZVwiLCB7IHR5cGU6IHRoaXMudHlwZSwgaWQ6IHRoaXMuaWQgfV0pXG4gIH1cbn1cbiJdfQ==