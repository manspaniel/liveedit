"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LiveEditServerDocument = exports.LiveEditServer = void 0;

var _immer = require("immer");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LiveEditServer =
/*#__PURE__*/
function () {
  function LiveEditServer(opts) {
    _classCallCheck(this, LiveEditServer);

    _defineProperty(this, "types", void 0);

    _defineProperty(this, "connections", []);

    _defineProperty(this, "docs", {});

    this.types = opts.types;
  }

  _createClass(LiveEditServer, [{
    key: "connect",
    value: function connect(user, sender) {
      var _this = this;

      var conn = {
        user: user,
        docs: [],
        closed: false,
        handleIncoming: function handleIncoming(msg) {
          _this.handleMessage(conn, msg);
        },
        close: function close() {
          conn.closed = true;

          var i = _this.connections.indexOf(conn);

          if (i !== -1) {
            _this.connections.splice(i, 1);
          }
        },
        send: function send(msg) {
          if (conn.closed) return;
          sender(msg);
        }
      };
      this.connections.push(conn);
      return conn;
    }
  }, {
    key: "handleMessage",
    value: function () {
      var _handleMessage = _asyncToGenerator(function* (conn, msg) {
        switch (msg[0]) {
          case "propose":
            {
              var _msg$ = msg[1],
                  _id = _msg$.id,
                  _type = _msg$.type,
                  change = _msg$.change;

              var _doc = this.getOpenDoc(_type, _id);

              if (!_doc) {
                conn.send(["error", {
                  type: _type,
                  id: _id,
                  code: 400,
                  errorMessage: "The document you are attempting to modify has not been loaded"
                }]);
              } else {
                _doc.handleProposal(change, conn);
              }
            }
            break;

          case "subscribe":
            {
              var _msg$2 = msg[1],
                  _id2 = _msg$2.id,
                  _type2 = _msg$2.type;

              var _doc2 = this.getOpenDoc(_type2, _id2);

              if (_doc2) {
                // Doc is already loaded!
                conn.docs.push({
                  id: _id2,
                  type: _type2
                });
                conn.send(["initial", {
                  type: _type2,
                  id: _id2,
                  baseID: _doc2.changeID,
                  value: _doc2.doc
                }]);
              } else {
                // Doc hasn't loaded... load it
                try {
                  _doc2 = yield this.loadDoc(_type2, _id2);
                } catch (err) {
                  console.error(err);
                  console.error("The error above was generated while attempting to load a document (type=".concat(_type2, ",id=").concat(_id2, ")"));
                  conn.send(["error", {
                    type: _type2,
                    id: _id2,
                    code: 500,
                    errorMessage: "An error occurred while attempting to load the document"
                  }]);
                  break;
                }

                _doc2 = this.getOpenDoc(_type2, _id2) || _doc2;

                if (_doc2) {
                  if (!this.docs[_type2]) this.docs[_type2] = {};
                  this.docs[_type2][_id2] = _doc2;
                  conn.send(["initial", {
                    type: _type2,
                    id: _id2,
                    baseID: _doc2.changeID,
                    value: _doc2.doc
                  }]);
                } else {
                  conn.send(["error", {
                    type: _type2,
                    id: _id2,
                    code: 404,
                    errorMessage: "The document you are attempting to access could not be found"
                  }]);
                }
              }
            }
            break;

          case "unsubscribe":
            {
              var _msg$3 = msg[1],
                  _id3 = _msg$3.id,
                  _type3 = _msg$3.type;
              conn.docs = conn.docs.filter(function (item) {
                return item.type === _type3 && item.id === _id3 ? false : true;
              });
              this.closeInactiveDocs();
            }
            break;
        }
      });

      function handleMessage(_x, _x2) {
        return _handleMessage.apply(this, arguments);
      }

      return handleMessage;
    }()
  }, {
    key: "getOpenDoc",
    value: function getOpenDoc(type, id) {
      console.log("Is doc open?", type, id);
      var doc = this.docs[type] && this.docs[type][id] ? this.docs[type][id] : null;
      console.log("doc", doc);
      return doc;
    }
  }, {
    key: "loadDoc",
    value: function () {
      var _loadDoc = _asyncToGenerator(function* (type, id) {
        console.log("Open file", type, id); // if (this.types)

        if (this.types[type]) {
          // Load the doc using config
          var _doc3 = yield this.types[type].load(id); // Return the new object with initial value already set, and give it a validator function


          return new LiveEditServerDocument(this, id, type, _doc3, this.types[type].validate);
        } else {
          return null;
        }
      });

      function loadDoc(_x3, _x4) {
        return _loadDoc.apply(this, arguments);
      }

      return loadDoc;
    }()
  }, {
    key: "closeInactiveDocs",
    value: function closeInactiveDocs() {
      console.log("Close unused files");
    }
  }, {
    key: "sendToSubscribers",
    value: function sendToSubscribers(msg, filter) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.connections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _conn = _step.value;

          if (!filter || filter(_conn)) {
            _conn.send(msg);
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
  }]);

  return LiveEditServer;
}();

exports.LiveEditServer = LiveEditServer;

var LiveEditServerDocument =
/*#__PURE__*/
function () {
  // State
  function LiveEditServerDocument(server, id, type, initial, validate) {
    _classCallCheck(this, LiveEditServerDocument);

    _defineProperty(this, "server", void 0);

    _defineProperty(this, "id", void 0);

    _defineProperty(this, "type", void 0);

    _defineProperty(this, "validate", void 0);

    _defineProperty(this, "changeID", "initial");

    _defineProperty(this, "doc", void 0);

    this.server = server;
    this.id = id;
    this.type = type;
    this.doc = initial;

    this.validate = validate || function (doc) {
      return true;
    };
  }

  _createClass(LiveEditServerDocument, [{
    key: "handleProposal",
    value: function handleProposal(change, conn) {
      var _this2 = this;

      console.log("Handling proposal", change, conn); // Only accept the proposal if the change is coming from the latest version of the document

      if (change.baseID !== this.changeID) {
        console.log("Nope, your baseID is wrong yours=".concat(change.baseID, ", mine = ").concat(this.changeID));
        conn.send(["proposalResult", {
          id: this.id,
          type: this.type,
          changeID: change.changeID,
          result: "NOPE"
        }]);
        return;
      } // Apply patches, receiving a new doc


      var nextDoc = (0, _immer.applyPatches)(this.doc, change.patches); // Ensure the document is still valid

      if (!this.validate(nextDoc)) {
        // Inform the user that the change is invalid, as it makes the document invalid
        console.log("Drop this request - your update caused the document to become invalid.");
        conn.send(["proposalResult", {
          id: this.id,
          type: this.type,
          changeID: change.changeID,
          result: "DROP"
        }]);
        return;
      } // The changes are accepted


      this.doc = nextDoc;
      this.changeID = change.changeID; // console.log("Informing other clients", this.clients)
      // Distribute the change to all subscribers of this document, except for the client who sent this one

      console.log("Distributing change");
      this.server.sendToSubscribers(["changed", {
        id: this.id,
        type: this.type,
        change: change
      }], function (c) {
        return c !== conn && !!c.docs.find(function (d) {
          return d.type === _this2.type && d.id === _this2.id;
        });
      }); // Inform the current client of their success

      console.log("Proposal accepted!");
      conn.send(["proposalResult", {
        id: this.id,
        type: this.type,
        changeID: change.changeID,
        result: "ACK"
      }]);
    } // produce(changer: (draft: TDoc) => void) {
    //   this.doc = produce(this.doc, changer, patches => {
    //     const change: Change = {
    //       baseID: this.changeID,
    //       changeID: "__" + uuid(),
    //       patches
    //     }
    //     this.changeID = change.changeID
    //     this.clients.forEach(c => {
    //       this.handler.send(c, { change })
    //     })
    //   })
    // }

  }]);

  return LiveEditServerDocument;
}();

exports.LiveEditServerDocument = LiveEditServerDocument;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIudHMiXSwibmFtZXMiOlsiTGl2ZUVkaXRTZXJ2ZXIiLCJvcHRzIiwidHlwZXMiLCJ1c2VyIiwic2VuZGVyIiwiY29ubiIsImRvY3MiLCJjbG9zZWQiLCJoYW5kbGVJbmNvbWluZyIsIm1zZyIsImhhbmRsZU1lc3NhZ2UiLCJjbG9zZSIsImkiLCJjb25uZWN0aW9ucyIsImluZGV4T2YiLCJzcGxpY2UiLCJzZW5kIiwicHVzaCIsImlkIiwidHlwZSIsImNoYW5nZSIsImRvYyIsImdldE9wZW5Eb2MiLCJjb2RlIiwiZXJyb3JNZXNzYWdlIiwiaGFuZGxlUHJvcG9zYWwiLCJiYXNlSUQiLCJjaGFuZ2VJRCIsInZhbHVlIiwibG9hZERvYyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImZpbHRlciIsIml0ZW0iLCJjbG9zZUluYWN0aXZlRG9jcyIsImxvZyIsImxvYWQiLCJMaXZlRWRpdFNlcnZlckRvY3VtZW50IiwidmFsaWRhdGUiLCJzZXJ2ZXIiLCJpbml0aWFsIiwicmVzdWx0IiwibmV4dERvYyIsInBhdGNoZXMiLCJzZW5kVG9TdWJzY3JpYmVycyIsImMiLCJmaW5kIiwiZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOzs7Ozs7Ozs7Ozs7OztJQXFCYUEsYzs7O0FBYVgsMEJBQVlDLElBQVosRUFBa0M7QUFBQTs7QUFBQTs7QUFBQSx5Q0FQQyxFQU9EOztBQUFBLGtDQUY5QixFQUU4Qjs7QUFDaEMsU0FBS0MsS0FBTCxHQUFhRCxJQUFJLENBQUNDLEtBQWxCO0FBQ0Q7Ozs7NEJBR0NDLEksRUFDQUMsTSxFQUNtQjtBQUFBOztBQUNuQixVQUFNQyxJQUFJLEdBQUc7QUFDWEYsUUFBQUEsSUFBSSxFQUFKQSxJQURXO0FBRVhHLFFBQUFBLElBQUksRUFBRSxFQUZLO0FBR1hDLFFBQUFBLE1BQU0sRUFBRSxLQUhHO0FBSVhDLFFBQUFBLGNBQWMsRUFBRSx3QkFBQ0MsR0FBRCxFQUFnQztBQUM5QyxVQUFBLEtBQUksQ0FBQ0MsYUFBTCxD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LFFBQUFBLElBQUksRUFBRSxLQUFLQSxJQUExQjtBQUFnQ0MsUUFBQUEsTUFBTSxFQUFOQTtBQUFoQyxPQUFaLENBREYsRUFFRSxVQUFBMEIsQ0FBQztBQUFBLGVBQ0NBLENBQUMsS0FBS3pDLElBQU4sSUFDQSxDQUFDLENBQUN5QyxDQUFDLENBQUN4QyxJQUFGLENBQU95QyxJQUFQLENBQVksVUFBQUMsQ0FBQztBQUFBLGlCQUFJQSxDQUFDLENBQUM3QixJQUFGLEtBQVcsTUFBSSxDQUFDQSxJQUFoQixJQUF3QjZCLENBQUMsQ0FBQzlCLEVBQUYsS0FBUyxNQUFJLENBQUNBLEVBQTFDO0FBQUEsU0FBYixDQUZIO0FBQUEsT0FGSCxFQS9DK0MsQ0FzRC9DOztBQUNBYSxNQUFBQSxPQUFPLENBQUNLLEdBQVI7QUFDQS9CLE1BQUFBLElBQUksQ0FBQ1csSUFBTCxDQUFVLENBQ1IsZ0JBRFEsRUFFUjtBQUFFRSxRQUFBQSxFQUFFLEVBQUUsS0FBS0EsRUFBWDtBQUFlQyxRQUFBQSxJQUFJLEVBQUUsS0FBS0EsSUFBMUI7QUFBZ0NRLFFBQUFBLFFBQVEsRUFBRVAsTUFBTSxDQUFDTyxRQUFqRDtBQUEyRGUsUUFBQUEsTUFBTSxFQUFFO0FBQW5FLE9BRlEsQ0FBVjtBQUlELEssQ0FFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENsaWVudFRvU2VydmVyTWVzc2FnZSxcbiAgU2VydmVyVG9DbGllbnRNZXNzYWdlLFxuICBDaGFuZ2UsXG4gIFByb3Bvc2FsUmVzdWx0XG59IGZyb20gXCIuL3Byb3RvY29sXCJcbmltcG9ydCB7IGFwcGx5UGF0Y2hlcywgcHJvZHVjZSB9IGZyb20gXCJpbW1lclwiXG5cbmludGVyZmFjZSBPcHRpb25zPFQgZXh0ZW5kcyB7IFtrZXk6IHN0cmluZ106IGFueSB9PiB7XG4gIHR5cGVzOiB7XG4gICAgW2tleSBpbiBrZXlvZiBUXToge1xuICAgICAgbG9hZChpZDogc3RyaW5nKTogUHJvbWlzZTxUW2tleV0+XG4gICAgICBzYXZlKGlkOiBzdHJpbmcsIGRhdGE6IFRba2V5XSk6IFByb21pc2U8dm9pZD5cbiAgICAgIHZhbGlkYXRlPyhkYXRhOiBUW2tleV0pOiBib29sZWFuXG4gICAgfVxuICB9XG59XG5cbmludGVyZmFjZSBDb25uZWN0aW9uPFRVc2VyID0gYW55PiB7XG4gIHVzZXI6IFRVc2VyXG4gIGRvY3M6IHsgdHlwZTogc3RyaW5nOyBpZDogc3RyaW5nIH1bXVxuICBjbG9zZWQ6IGJvb2xlYW5cbiAgaGFuZGxlSW5jb21pbmcobXNnOiBDbGllbnRUb1NlcnZlck1lc3NhZ2UpOiB2b2lkXG4gIGNsb3NlKCk6IHZvaWRcbiAgc2VuZChtc2c6IFNlcnZlclRvQ2xpZW50TWVzc2FnZSk6IHZvaWRcbn1cblxuZXhwb3J0IGNsYXNzIExpdmVFZGl0U2VydmVyPFxuICBURG9jcyBleHRlbmRzIHsgW2tleTogc3RyaW5nXTogYW55IH0gPSBhbnksXG4gIFRVc2VyID0gYW55XG4+IHtcbiAgdHlwZXM6IE9wdGlvbnM8VERvY3M+W1widHlwZXNcIl1cblxuICBjb25uZWN0aW9uczogQ29ubmVjdGlvbjxUVXNlcj5bXSA9IFtdXG4gIGRvY3M6IHtcbiAgICBbdHlwZTogc3RyaW5nXToge1xuICAgICAgW2lkOiBzdHJpbmddOiBMaXZlRWRpdFNlcnZlckRvY3VtZW50XG4gICAgfVxuICB9ID0ge31cblxuICBjb25zdHJ1Y3RvcihvcHRzOiBPcHRpb25zPFREb2NzPikge1xuICAgIHRoaXMudHlwZXMgPSBvcHRzLnR5cGVzXG4gIH1cblxuICBjb25uZWN0KFxuICAgIHVzZXI6IFRVc2VyLFxuICAgIHNlbmRlcjogKG1zZzogU2VydmVyVG9DbGllbnRNZXNzYWdlKSA9PiB2b2lkXG4gICk6IENvbm5lY3Rpb248VFVzZXI+IHtcbiAgICBjb25zdCBjb25uID0ge1xuICAgICAgdXNlcixcbiAgICAgIGRvY3M6IFtdLFxuICAgICAgY2xvc2VkOiBmYWxzZSxcbiAgICAgIGhhbmRsZUluY29taW5nOiAobXNnOiBDbGllbnRUb1NlcnZlck1lc3NhZ2UpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVNZXNzYWdlKGNvbm4sIG1zZylcbiAgICAgIH0sXG4gICAgICBjbG9zZTogKCkgPT4ge1xuICAgICAgICBjb25uLmNsb3NlZCA9IHRydWVcbiAgICAgICAgY29uc3QgaSA9IHRoaXMuY29ubmVjdGlvbnMuaW5kZXhPZihjb25uKVxuICAgICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25zLnNwbGljZShpLCAxKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2VuZDogKG1zZzogU2VydmVyVG9DbGllbnRNZXNzYWdlKSA9PiB7XG4gICAgICAgIGlmIChjb25uLmNsb3NlZCkgcmV0dXJuXG4gICAgICAgIHNlbmRlcihtc2cpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29ubmVjdGlvbnMucHVzaChjb25uKVxuICAgIHJldHVybiBjb25uXG4gIH1cblxuICBhc3luYyBoYW5kbGVNZXNzYWdlKGNvbm46IENvbm5lY3Rpb248VFVzZXI+LCBtc2c6IENsaWVudFRvU2VydmVyTWVzc2FnZSkge1xuICAgIHN3aXRjaCAobXNnWzBdKSB7XG4gICAgICBjYXNlIFwicHJvcG9zZVwiOlxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgeyBpZCwgdHlwZSwgY2hhbmdlIH0gPSBtc2dbMV1cbiAgICAgICAgICBjb25zdCBkb2MgPSB0aGlzLmdldE9wZW5Eb2ModHlwZSwgaWQpXG4gICAgICAgICAgaWYgKCFkb2MpIHtcbiAgICAgICAgICAgIGNvbm4uc2VuZChbXG4gICAgICAgICAgICAgIFwiZXJyb3JcIixcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgY29kZTogNDAwLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTpcbiAgICAgICAgICAgICAgICAgIFwiVGhlIGRvY3VtZW50IHlvdSBhcmUgYXR0ZW1wdGluZyB0byBtb2RpZnkgaGFzIG5vdCBiZWVuIGxvYWRlZFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvYy5oYW5kbGVQcm9wb3NhbChjaGFuZ2UsIGNvbm4pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwic3Vic2NyaWJlXCI6XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlIH0gPSBtc2dbMV1cbiAgICAgICAgICBsZXQgZG9jID0gdGhpcy5nZXRPcGVuRG9jKHR5cGUsIGlkKVxuICAgICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgIC8vIERvYyBpcyBhbHJlYWR5IGxvYWRlZCFcbiAgICAgICAgICAgIGNvbm4uZG9jcy5wdXNoKHsgaWQsIHR5cGUgfSlcbiAgICAgICAgICAgIGNvbm4uc2VuZChbXG4gICAgICAgICAgICAgIFwiaW5pdGlhbFwiLFxuICAgICAgICAgICAgICB7IHR5cGUsIGlkLCBiYXNlSUQ6IGRvYy5jaGFuZ2VJRCwgdmFsdWU6IGRvYy5kb2MgfVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRG9jIGhhc24ndCBsb2FkZWQuLi4gbG9hZCBpdFxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZG9jID0gYXdhaXQgdGhpcy5sb2FkRG9jKHR5cGUsIGlkKVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgICAgIGBUaGUgZXJyb3IgYWJvdmUgd2FzIGdlbmVyYXRlZCB3aGlsZSBhdHRlbXB0aW5nIHRvIGxvYWQgYSBkb2N1bWVudCAodHlwZT0ke3R5cGV9LGlkPSR7aWR9KWBcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBjb25uLnNlbmQoW1xuICAgICAgICAgICAgICAgIFwiZXJyb3JcIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgICBjb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgICAgIFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgYXR0ZW1wdGluZyB0byBsb2FkIHRoZSBkb2N1bWVudFwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9jID0gdGhpcy5nZXRPcGVuRG9jKHR5cGUsIGlkKSB8fCBkb2NcbiAgICAgICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgICAgaWYgKCF0aGlzLmRvY3NbdHlwZV0pIHRoaXMuZG9jc1t0eXBlXSA9IHt9XG4gICAgICAgICAgICAgIHRoaXMuZG9jc1t0eXBlXVtpZF0gPSBkb2NcbiAgICAgICAgICAgICAgY29ubi5zZW5kKFtcbiAgICAgICAgICAgICAgICBcImluaXRpYWxcIixcbiAgICAgICAgICAgICAgICB7IHR5cGUsIGlkLCBiYXNlSUQ6IGRvYy5jaGFuZ2VJRCwgdmFsdWU6IGRvYy5kb2MgfVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29ubi5zZW5kKFtcbiAgICAgICAgICAgICAgICBcImVycm9yXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgICAgICAgY29kZTogNDA0LFxuICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOlxuICAgICAgICAgICAgICAgICAgICBcIlRoZSBkb2N1bWVudCB5b3UgYXJlIGF0dGVtcHRpbmcgdG8gYWNjZXNzIGNvdWxkIG5vdCBiZSBmb3VuZFwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcInVuc3Vic2NyaWJlXCI6XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlIH0gPSBtc2dbMV1cbiAgICAgICAgICBjb25uLmRvY3MgPSBjb25uLmRvY3MuZmlsdGVyKGl0ZW0gPT5cbiAgICAgICAgICAgIGl0ZW0udHlwZSA9PT0gdHlwZSAmJiBpdGVtLmlkID09PSBpZCA/IGZhbHNlIDogdHJ1ZVxuICAgICAgICAgIClcbiAgICAgICAgICB0aGlzLmNsb3NlSW5hY3RpdmVEb2NzKClcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGdldE9wZW5Eb2ModHlwZTogc3RyaW5nLCBpZDogc3RyaW5nKSB7XG4gICAgY29uc29sZS5sb2coXCJJcyBkb2Mgb3Blbj9cIiwgdHlwZSwgaWQpXG4gICAgY29uc3QgZG9jID1cbiAgICAgIHRoaXMuZG9jc1t0eXBlXSAmJiB0aGlzLmRvY3NbdHlwZV1baWRdID8gdGhpcy5kb2NzW3R5cGVdW2lkXSA6IG51bGxcbiAgICBjb25zb2xlLmxvZyhcImRvY1wiLCBkb2MpXG4gICAgcmV0dXJuIGRvY1xuICB9XG5cbiAgYXN5bmMgbG9hZERvYzxUVHlwZU5hbWUgZXh0ZW5kcyBrZXlvZiBURG9jcz4oXG4gICAgdHlwZTogVFR5cGVOYW1lLFxuICAgIGlkOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxMaXZlRWRpdFNlcnZlckRvY3VtZW50PFREb2NzW1RUeXBlTmFtZV0+IHwgbnVsbD4ge1xuICAgIGNvbnNvbGUubG9nKFwiT3BlbiBmaWxlXCIsIHR5cGUsIGlkKVxuICAgIC8vIGlmICh0aGlzLnR5cGVzKVxuICAgIGlmICh0aGlzLnR5cGVzW3R5cGVdKSB7XG4gICAgICAvLyBMb2FkIHRoZSBkb2MgdXNpbmcgY29uZmlnXG4gICAgICBjb25zdCBkb2MgPSBhd2FpdCB0aGlzLnR5cGVzW3R5cGVdLmxvYWQoaWQpXG4gICAgICAvLyBSZXR1cm4gdGhlIG5ldyBvYmplY3Qgd2l0aCBpbml0aWFsIHZhbHVlIGFscmVhZHkgc2V0LCBhbmQgZ2l2ZSBpdCBhIHZhbGlkYXRvciBmdW5jdGlvblxuICAgICAgcmV0dXJuIG5ldyBMaXZlRWRpdFNlcnZlckRvY3VtZW50KFxuICAgICAgICB0aGlzLFxuICAgICAgICBpZCxcbiAgICAgICAgdHlwZSBhcyBzdHJpbmcsXG4gICAgICAgIGRvYyxcbiAgICAgICAgdGhpcy50eXBlc1t0eXBlXS52YWxpZGF0ZVxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIGNsb3NlSW5hY3RpdmVEb2NzKCkge1xuICAgIGNvbnNvbGUubG9nKFwiQ2xvc2UgdW51c2VkIGZpbGVzXCIpXG4gIH1cblxuICBzZW5kVG9TdWJzY3JpYmVycyhcbiAgICBtc2c6IFNlcnZlclRvQ2xpZW50TWVzc2FnZSxcbiAgICBmaWx0ZXI/OiAoY29ubjogQ29ubmVjdGlvbjxUVXNlcj4pID0+IGJvb2xlYW5cbiAgKSB7XG4gICAgZm9yIChjb25zdCBjb25uIG9mIHRoaXMuY29ubmVjdGlvbnMpIHtcbiAgICAgIGlmICghZmlsdGVyIHx8IGZpbHRlcihjb25uKSkge1xuICAgICAgICBjb25uLnNlbmQobXNnKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTGl2ZUVkaXRTZXJ2ZXJEb2N1bWVudDxURG9jID0gYW55PiB7XG4gIHNlcnZlcjogTGl2ZUVkaXRTZXJ2ZXJcbiAgaWQ6IHN0cmluZ1xuICB0eXBlOiBzdHJpbmdcbiAgdmFsaWRhdGU6IChkb2M6IFREb2MpID0+IGJvb2xlYW5cblxuICAvLyBTdGF0ZVxuICBjaGFuZ2VJRDogc3RyaW5nID0gXCJpbml0aWFsXCJcbiAgZG9jOiBURG9jXG5cbiAgY29uc3RydWN0b3IoXG4gICAgc2VydmVyOiBMaXZlRWRpdFNlcnZlcixcbiAgICBpZDogc3RyaW5nLFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBpbml0aWFsOiBURG9jLFxuICAgIHZhbGlkYXRlPzogKGRvYzogVERvYykgPT4gYm9vbGVhblxuICApIHtcbiAgICB0aGlzLnNlcnZlciA9IHNlcnZlclxuICAgIHRoaXMuaWQgPSBpZFxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLmRvYyA9IGluaXRpYWxcbiAgICB0aGlzLnZhbGlkYXRlID0gdmFsaWRhdGUgfHwgKChkb2M6IFREb2MpID0+IHRydWUpXG4gIH1cblxuICBoYW5kbGVQcm9wb3NhbChjaGFuZ2U6IENoYW5nZSwgY29ubjogQ29ubmVjdGlvbikge1xuICAgIGNvbnNvbGUubG9nKFwiSGFuZGxpbmcgcHJvcG9zYWxcIiwgY2hhbmdlLCBjb25uKVxuICAgIC8vIE9ubHkgYWNjZXB0IHRoZSBwcm9wb3NhbCBpZiB0aGUgY2hhbmdlIGlzIGNvbWluZyBmcm9tIHRoZSBsYXRlc3QgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnRcbiAgICBpZiAoY2hhbmdlLmJhc2VJRCAhPT0gdGhpcy5jaGFuZ2VJRCkge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBOb3BlLCB5b3VyIGJhc2VJRCBpcyB3cm9uZyB5b3Vycz0ke2NoYW5nZS5iYXNlSUR9LCBtaW5lID0gJHt0aGlzLmNoYW5nZUlEfWBcbiAgICAgIClcbiAgICAgIGNvbm4uc2VuZChbXG4gICAgICAgIFwicHJvcG9zYWxSZXN1bHRcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICBjaGFuZ2VJRDogY2hhbmdlLmNoYW5nZUlELFxuICAgICAgICAgIHJlc3VsdDogXCJOT1BFXCJcbiAgICAgICAgfVxuICAgICAgXSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIEFwcGx5IHBhdGNoZXMsIHJlY2VpdmluZyBhIG5ldyBkb2NcbiAgICBjb25zdCBuZXh0RG9jID0gYXBwbHlQYXRjaGVzKHRoaXMuZG9jLCBjaGFuZ2UucGF0Y2hlcylcblxuICAgIC8vIEVuc3VyZSB0aGUgZG9jdW1lbnQgaXMgc3RpbGwgdmFsaWRcbiAgICBpZiAoIXRoaXMudmFsaWRhdGUobmV4dERvYykpIHtcbiAgICAgIC8vIEluZm9ybSB0aGUgdXNlciB0aGF0IHRoZSBjaGFuZ2UgaXMgaW52YWxpZCwgYXMgaXQgbWFrZXMgdGhlIGRvY3VtZW50IGludmFsaWRcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgRHJvcCB0aGlzIHJlcXVlc3QgLSB5b3VyIHVwZGF0ZSBjYXVzZWQgdGhlIGRvY3VtZW50IHRvIGJlY29tZSBpbnZhbGlkLmBcbiAgICAgIClcbiAgICAgIGNvbm4uc2VuZChbXG4gICAgICAgIFwicHJvcG9zYWxSZXN1bHRcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICBjaGFuZ2VJRDogY2hhbmdlLmNoYW5nZUlELFxuICAgICAgICAgIHJlc3VsdDogXCJEUk9QXCJcbiAgICAgICAgfVxuICAgICAgXSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFRoZSBjaGFuZ2VzIGFyZSBhY2NlcHRlZFxuICAgIHRoaXMuZG9jID0gbmV4dERvY1xuICAgIHRoaXMuY2hhbmdlSUQgPSBjaGFuZ2UuY2hhbmdlSURcblxuICAgIC8vIGNvbnNvbGUubG9nKFwiSW5mb3JtaW5nIG90aGVyIGNsaWVudHNcIiwgdGhpcy5jbGllbnRzKVxuICAgIC8vIERpc3RyaWJ1dGUgdGhlIGNoYW5nZSB0byBhbGwgc3Vic2NyaWJlcnMgb2YgdGhpcyBkb2N1bWVudCwgZXhjZXB0IGZvciB0aGUgY2xpZW50IHdobyBzZW50IHRoaXMgb25lXG4gICAgY29uc29sZS5sb2coYERpc3RyaWJ1dGluZyBjaGFuZ2VgKVxuICAgIHRoaXMuc2VydmVyLnNlbmRUb1N1YnNjcmliZXJzKFxuICAgICAgW1wiY2hhbmdlZFwiLCB7IGlkOiB0aGlzLmlkLCB0eXBlOiB0aGlzLnR5cGUsIGNoYW5nZSB9XSxcbiAgICAgIGMgPT5cbiAgICAgICAgYyAhPT0gY29ubiAmJlxuICAgICAgICAhIWMuZG9jcy5maW5kKGQgPT4gZC50eXBlID09PSB0aGlzLnR5cGUgJiYgZC5pZCA9PT0gdGhpcy5pZClcbiAgICApXG5cbiAgICAvLyBJbmZvcm0gdGhlIGN1cnJlbnQgY2xpZW50IG9mIHRoZWlyIHN1Y2Nlc3NcbiAgICBjb25zb2xlLmxvZyhgUHJvcG9zYWwgYWNjZXB0ZWQhYClcbiAgICBjb25uLnNlbmQoW1xuICAgICAgXCJwcm9wb3NhbFJlc3VsdFwiLFxuICAgICAgeyBpZDogdGhpcy5pZCwgdHlwZTogdGhpcy50eXBlLCBjaGFuZ2VJRDogY2hhbmdlLmNoYW5nZUlELCByZXN1bHQ6IFwiQUNLXCIgfVxuICAgIF0pXG4gIH1cblxuICAvLyBwcm9kdWNlKGNoYW5nZXI6IChkcmFmdDogVERvYykgPT4gdm9pZCkge1xuICAvLyAgIHRoaXMuZG9jID0gcHJvZHVjZSh0aGlzLmRvYywgY2hhbmdlciwgcGF0Y2hlcyA9PiB7XG4gIC8vICAgICBjb25zdCBjaGFuZ2U6IENoYW5nZSA9IHtcbiAgLy8gICAgICAgYmFzZUlEOiB0aGlzLmNoYW5nZUlELFxuICAvLyAgICAgICBjaGFuZ2VJRDogXCJfX1wiICsgdXVpZCgpLFxuICAvLyAgICAgICBwYXRjaGVzXG4gIC8vICAgICB9XG4gIC8vICAgICB0aGlzLmNoYW5nZUlEID0gY2hhbmdlLmNoYW5nZUlEXG4gIC8vICAgICB0aGlzLmNsaWVudHMuZm9yRWFjaChjID0+IHtcbiAgLy8gICAgICAgdGhpcy5oYW5kbGVyLnNlbmQoYywgeyBjaGFuZ2UgfSlcbiAgLy8gICAgIH0pXG4gIC8vICAgfSlcbiAgLy8gfVxufVxuIl19