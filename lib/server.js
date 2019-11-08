"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LiveEditServerDocument = exports.LiveEditServer = void 0;

var _immer = require("immer");

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
    value: function handleMessage(conn, msg) {
      var _msg$, _id, _type, change, _doc, _msg$2, _id2, _type2, _doc2, _msg$3, _id3, _type3;

      return regeneratorRuntime.async(function handleMessage$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.t0 = msg[0];
              _context.next = _context.t0 === "propose" ? 3 : _context.t0 === "subscribe" ? 7 : _context.t0 === "unsubscribe" ? 29 : 33;
              break;

            case 3:
              _msg$ = msg[1], _id = _msg$.id, _type = _msg$.type, change = _msg$.change;
              _doc = this.getOpenDoc(_type, _id);

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

              return _context.abrupt("break", 33);

            case 7:
              _msg$2 = msg[1], _id2 = _msg$2.id, _type2 = _msg$2.type;
              _doc2 = this.getOpenDoc(_type2, _id2);

              if (!_doc2) {
                _context.next = 14;
                break;
              }

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
              _context.next = 28;
              break;

            case 14:
              _context.prev = 14;
              _context.next = 17;
              return regeneratorRuntime.awrap(this.loadDoc(_type2, _id2));

            case 17:
              _doc2 = _context.sent;
              _context.next = 26;
              break;

            case 20:
              _context.prev = 20;
              _context.t1 = _context["catch"](14);
              console.error(_context.t1);
              console.error("The error above was generated while attempting to load a document (type=".concat(_type2, ",id=").concat(_id2, ")"));
              conn.send(["error", {
                type: _type2,
                id: _id2,
                code: 500,
                errorMessage: "An error occurred while attempting to load the document"
              }]);
              return _context.abrupt("break", 33);

            case 26:
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

            case 28:
              return _context.abrupt("break", 33);

            case 29:
              _msg$3 = msg[1], _id3 = _msg$3.id, _type3 = _msg$3.type;
              conn.docs = conn.docs.filter(function (item) {
                return item.type === _type3 && item.id === _id3 ? false : true;
              });
              this.closeInactiveDocs();
              return _context.abrupt("break", 33);

            case 33:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[14, 20]]);
    }
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
    value: function loadDoc(type, id) {
      var _doc3;

      return regeneratorRuntime.async(function loadDoc$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              console.log("Open file", type, id); // if (this.types)

              if (!this.types[type]) {
                _context2.next = 8;
                break;
              }

              _context2.next = 4;
              return regeneratorRuntime.awrap(this.types[type].load(id));

            case 4:
              _doc3 = _context2.sent;
              return _context2.abrupt("return", new LiveEditServerDocument(this, id, type, _doc3, this.types[type].validate));

            case 8:
              return _context2.abrupt("return", null);

            case 9:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIudHMiXSwibmFtZXMiOlsiTGl2ZUVkaXRTZXJ2ZXIiLCJvcHRzIiwidHlwZXMiLCJ1c2VyIiwic2VuZGVyIiwiY29ubiIsImRvY3MiLCJjbG9zZWQiLCJoYW5kbGVJbmNvbWluZyIsIm1zZyIsImhhbmRsZU1lc3NhZ2UiLCJjbG9zZSIsImkiLCJjb25uZWN0aW9ucyIsImluZGV4T2YiLCJzcGxpY2UiLCJzZW5kIiwicHVzaCIsImlkIiwidHlwZSIsImNoYW5nZSIsImRvYyIsImdldE9wZW5Eb2MiLCJjb2RlIiwiZXJyb3JNZXNzYWdlIiwiaGFuZGxlUHJvcG9zYWwiLCJiYXNlSUQiLCJjaGFuZ2VJRCIsInZhbHVlIiwibG9hZERvYyIsImNvbnNvbGUiLCJlcnJvciIsImZpbHRlciIsIml0ZW0iLCJjbG9zZUluYWN0aXZlRG9jcyIsImxvZyIsImxvYWQiLCJMaXZlRWRpdFNlcnZlckRvY3VtZW50IiwidmFsaWRhdGUiLCJzZXJ2ZXIiLCJpbml0aWFsIiwicmVzdWx0IiwibmV4dERvYyIsInBhdGNoZXMiLCJzZW5kVG9TdWJzY3JpYmVycyIsImMiLCJmaW5kIiwiZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOzs7Ozs7Ozs7O0lBcUJhQSxjOzs7QUFhWCwwQkFBWUMsSUFBWixFQUFrQztBQUFBOztBQUFBOztBQUFBLHlDQVBDLEVBT0Q7O0FBQUEsa0NBRjlCLEVBRThCOztBQUNoQyxTQUFLQyxLQUFMLEdBQWFELElBQUksQ0FBQ0MsS0FBbEI7QUFDRDs7Ozs0QkFHQ0MsSSxFQUNBQyxNLEVBQ21CO0FBQUE7O0FBQ25CLFVBQU1DLElBQUksR0FBRztBQUNYRixRQUFBQSxJQUFJLEVBQUpBLElBRFc7QUFFWEcsUUFBQUEsSUFBSSxFQUFFLEVBRks7QUFHWEMsUUFBQUEsTUFBTSxFQUFFLEtBSEc7QUFJWEMsUUFBQUEsY0FBYyxFQUFFLHdCQUFDQyxHQUFELEVBQWdDO0FBQzlDLFVBQUEsS0FBSSxDQUFDQyxhQUFMLENBQW1CTCxJQUFu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O0FBQUVFLFFBQUFBLEVBQUUsRUFBRSxLQUFLQSxFQUFYO0FBQWVDLFFBQUFBLElBQUksRUFBRSxLQUFLQSxJQUExQjtBQUFnQ1EsUUFBQUEsUUFBUSxFQUFFUCxNQUFNLENBQUNPLFFBQWpEO0FBQTJEYyxRQUFBQSxNQUFNLEVBQUU7QUFBbkUsT0FGUSxDQUFWO0FBSUQsSyxDQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ2xpZW50VG9TZXJ2ZXJNZXNzYWdlLFxuICBTZXJ2ZXJUb0NsaWVudE1lc3NhZ2UsXG4gIENoYW5nZSxcbiAgUHJvcG9zYWxSZXN1bHRcbn0gZnJvbSBcIi4vcHJvdG9jb2xcIlxuaW1wb3J0IHsgYXBwbHlQYXRjaGVzLCBwcm9kdWNlIH0gZnJvbSBcImltbWVyXCJcblxuaW50ZXJmYWNlIE9wdGlvbnM8VCBleHRlbmRzIHsgW2tleTogc3RyaW5nXTogYW55IH0+IHtcbiAgdHlwZXM6IHtcbiAgICBba2V5IGluIGtleW9mIFRdOiB7XG4gICAgICBsb2FkKGlkOiBzdHJpbmcpOiBQcm9taXNlPFRba2V5XT5cbiAgICAgIHNhdmUoaWQ6IHN0cmluZywgZGF0YTogVFtrZXldKTogUHJvbWlzZTx2b2lkPlxuICAgICAgdmFsaWRhdGU/KGRhdGE6IFRba2V5XSk6IGJvb2xlYW5cbiAgICB9XG4gIH1cbn1cblxuaW50ZXJmYWNlIENvbm5lY3Rpb248VFVzZXIgPSBhbnk+IHtcbiAgdXNlcjogVFVzZXJcbiAgZG9jczogeyB0eXBlOiBzdHJpbmc7IGlkOiBzdHJpbmcgfVtdXG4gIGNsb3NlZDogYm9vbGVhblxuICBoYW5kbGVJbmNvbWluZyhtc2c6IENsaWVudFRvU2VydmVyTWVzc2FnZSk6IHZvaWRcbiAgY2xvc2UoKTogdm9pZFxuICBzZW5kKG1zZzogU2VydmVyVG9DbGllbnRNZXNzYWdlKTogdm9pZFxufVxuXG5leHBvcnQgY2xhc3MgTGl2ZUVkaXRTZXJ2ZXI8XG4gIFREb2NzIGV4dGVuZHMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IGFueSxcbiAgVFVzZXIgPSBhbnlcbj4ge1xuICB0eXBlczogT3B0aW9uczxURG9jcz5bXCJ0eXBlc1wiXVxuXG4gIGNvbm5lY3Rpb25zOiBDb25uZWN0aW9uPFRVc2VyPltdID0gW11cbiAgZG9jczoge1xuICAgIFt0eXBlOiBzdHJpbmddOiB7XG4gICAgICBbaWQ6IHN0cmluZ106IExpdmVFZGl0U2VydmVyRG9jdW1lbnRcbiAgICB9XG4gIH0gPSB7fVxuXG4gIGNvbnN0cnVjdG9yKG9wdHM6IE9wdGlvbnM8VERvY3M+KSB7XG4gICAgdGhpcy50eXBlcyA9IG9wdHMudHlwZXNcbiAgfVxuXG4gIGNvbm5lY3QoXG4gICAgdXNlcjogVFVzZXIsXG4gICAgc2VuZGVyOiAobXNnOiBTZXJ2ZXJUb0NsaWVudE1lc3NhZ2UpID0+IHZvaWRcbiAgKTogQ29ubmVjdGlvbjxUVXNlcj4ge1xuICAgIGNvbnN0IGNvbm4gPSB7XG4gICAgICB1c2VyLFxuICAgICAgZG9jczogW10sXG4gICAgICBjbG9zZWQ6IGZhbHNlLFxuICAgICAgaGFuZGxlSW5jb21pbmc6IChtc2c6IENsaWVudFRvU2VydmVyTWVzc2FnZSkgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UoY29ubiwgbXNnKVxuICAgICAgfSxcbiAgICAgIGNsb3NlOiAoKSA9PiB7XG4gICAgICAgIGNvbm4uY2xvc2VkID0gdHJ1ZVxuICAgICAgICBjb25zdCBpID0gdGhpcy5jb25uZWN0aW9ucy5pbmRleE9mKGNvbm4pXG4gICAgICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMuY29ubmVjdGlvbnMuc3BsaWNlKGksIDEpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZW5kOiAobXNnOiBTZXJ2ZXJUb0NsaWVudE1lc3NhZ2UpID0+IHtcbiAgICAgICAgaWYgKGNvbm4uY2xvc2VkKSByZXR1cm5cbiAgICAgICAgc2VuZGVyKG1zZylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb25uZWN0aW9ucy5wdXNoKGNvbm4pXG4gICAgcmV0dXJuIGNvbm5cbiAgfVxuXG4gIGFzeW5jIGhhbmRsZU1lc3NhZ2UoY29ubjogQ29ubmVjdGlvbjxUVXNlcj4sIG1zZzogQ2xpZW50VG9TZXJ2ZXJNZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtc2dbMF0pIHtcbiAgICAgIGNhc2UgXCJwcm9wb3NlXCI6XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlLCBjaGFuZ2UgfSA9IG1zZ1sxXVxuICAgICAgICAgIGNvbnN0IGRvYyA9IHRoaXMuZ2V0T3BlbkRvYyh0eXBlLCBpZClcbiAgICAgICAgICBpZiAoIWRvYykge1xuICAgICAgICAgICAgY29ubi5zZW5kKFtcbiAgICAgICAgICAgICAgXCJlcnJvclwiLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBjb2RlOiA0MDAsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOlxuICAgICAgICAgICAgICAgICAgXCJUaGUgZG9jdW1lbnQgeW91IGFyZSBhdHRlbXB0aW5nIHRvIG1vZGlmeSBoYXMgbm90IGJlZW4gbG9hZGVkXCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jLmhhbmRsZVByb3Bvc2FsKGNoYW5nZSwgY29ubilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJzdWJzY3JpYmVcIjpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IHsgaWQsIHR5cGUgfSA9IG1zZ1sxXVxuICAgICAgICAgIGxldCBkb2MgPSB0aGlzLmdldE9wZW5Eb2ModHlwZSwgaWQpXG4gICAgICAgICAgaWYgKGRvYykge1xuICAgICAgICAgICAgLy8gRG9jIGlzIGFscmVhZHkgbG9hZGVkIVxuICAgICAgICAgICAgY29ubi5kb2NzLnB1c2goeyBpZCwgdHlwZSB9KVxuICAgICAgICAgICAgY29ubi5zZW5kKFtcbiAgICAgICAgICAgICAgXCJpbml0aWFsXCIsXG4gICAgICAgICAgICAgIHsgdHlwZSwgaWQsIGJhc2VJRDogZG9jLmNoYW5nZUlELCB2YWx1ZTogZG9jLmRvYyB9XG4gICAgICAgICAgICBdKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBEb2MgaGFzbid0IGxvYWRlZC4uLiBsb2FkIGl0XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBkb2MgPSBhd2FpdCB0aGlzLmxvYWREb2ModHlwZSwgaWQpXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgYFRoZSBlcnJvciBhYm92ZSB3YXMgZ2VuZXJhdGVkIHdoaWxlIGF0dGVtcHRpbmcgdG8gbG9hZCBhIGRvY3VtZW50ICh0eXBlPSR7dHlwZX0saWQ9JHtpZH0pYFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIGNvbm4uc2VuZChbXG4gICAgICAgICAgICAgICAgXCJlcnJvclwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTpcbiAgICAgICAgICAgICAgICAgICAgXCJBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBhdHRlbXB0aW5nIHRvIGxvYWQgdGhlIGRvY3VtZW50XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2MgPSB0aGlzLmdldE9wZW5Eb2ModHlwZSwgaWQpIHx8IGRvY1xuICAgICAgICAgICAgaWYgKGRvYykge1xuICAgICAgICAgICAgICBpZiAoIXRoaXMuZG9jc1t0eXBlXSkgdGhpcy5kb2NzW3R5cGVdID0ge31cbiAgICAgICAgICAgICAgdGhpcy5kb2NzW3R5cGVdW2lkXSA9IGRvY1xuICAgICAgICAgICAgICBjb25uLnNlbmQoW1xuICAgICAgICAgICAgICAgIFwiaW5pdGlhbFwiLFxuICAgICAgICAgICAgICAgIHsgdHlwZSwgaWQsIGJhc2VJRDogZG9jLmNoYW5nZUlELCB2YWx1ZTogZG9jLmRvYyB9XG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25uLnNlbmQoW1xuICAgICAgICAgICAgICAgIFwiZXJyb3JcIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgICBjb2RlOiA0MDQsXG4gICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgICAgIFwiVGhlIGRvY3VtZW50IHlvdSBhcmUgYXR0ZW1wdGluZyB0byBhY2Nlc3MgY291bGQgbm90IGJlIGZvdW5kXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwidW5zdWJzY3JpYmVcIjpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IHsgaWQsIHR5cGUgfSA9IG1zZ1sxXVxuICAgICAgICAgIGNvbm4uZG9jcyA9IGNvbm4uZG9jcy5maWx0ZXIoaXRlbSA9PlxuICAgICAgICAgICAgaXRlbS50eXBlID09PSB0eXBlICYmIGl0ZW0uaWQgPT09IGlkID8gZmFsc2UgOiB0cnVlXG4gICAgICAgICAgKVxuICAgICAgICAgIHRoaXMuY2xvc2VJbmFjdGl2ZURvY3MoKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgZ2V0T3BlbkRvYyh0eXBlOiBzdHJpbmcsIGlkOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZyhcIklzIGRvYyBvcGVuP1wiLCB0eXBlLCBpZClcbiAgICBjb25zdCBkb2MgPVxuICAgICAgdGhpcy5kb2NzW3R5cGVdICYmIHRoaXMuZG9jc1t0eXBlXVtpZF0gPyB0aGlzLmRvY3NbdHlwZV1baWRdIDogbnVsbFxuICAgIGNvbnNvbGUubG9nKFwiZG9jXCIsIGRvYylcbiAgICByZXR1cm4gZG9jXG4gIH1cblxuICBhc3luYyBsb2FkRG9jPFRUeXBlTmFtZSBleHRlbmRzIGtleW9mIFREb2NzPihcbiAgICB0eXBlOiBUVHlwZU5hbWUsXG4gICAgaWQ6IHN0cmluZ1xuICApOiBQcm9taXNlPExpdmVFZGl0U2VydmVyRG9jdW1lbnQ8VERvY3NbVFR5cGVOYW1lXT4gfCBudWxsPiB7XG4gICAgY29uc29sZS5sb2coXCJPcGVuIGZpbGVcIiwgdHlwZSwgaWQpXG4gICAgLy8gaWYgKHRoaXMudHlwZXMpXG4gICAgaWYgKHRoaXMudHlwZXNbdHlwZV0pIHtcbiAgICAgIC8vIExvYWQgdGhlIGRvYyB1c2luZyBjb25maWdcbiAgICAgIGNvbnN0IGRvYyA9IGF3YWl0IHRoaXMudHlwZXNbdHlwZV0ubG9hZChpZClcbiAgICAgIC8vIFJldHVybiB0aGUgbmV3IG9iamVjdCB3aXRoIGluaXRpYWwgdmFsdWUgYWxyZWFkeSBzZXQsIGFuZCBnaXZlIGl0IGEgdmFsaWRhdG9yIGZ1bmN0aW9uXG4gICAgICByZXR1cm4gbmV3IExpdmVFZGl0U2VydmVyRG9jdW1lbnQoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIGlkLFxuICAgICAgICB0eXBlIGFzIHN0cmluZyxcbiAgICAgICAgZG9jLFxuICAgICAgICB0aGlzLnR5cGVzW3R5cGVdLnZhbGlkYXRlXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgY2xvc2VJbmFjdGl2ZURvY3MoKSB7XG4gICAgY29uc29sZS5sb2coXCJDbG9zZSB1bnVzZWQgZmlsZXNcIilcbiAgfVxuXG4gIHNlbmRUb1N1YnNjcmliZXJzKFxuICAgIG1zZzogU2VydmVyVG9DbGllbnRNZXNzYWdlLFxuICAgIGZpbHRlcj86IChjb25uOiBDb25uZWN0aW9uPFRVc2VyPikgPT4gYm9vbGVhblxuICApIHtcbiAgICBmb3IgKGNvbnN0IGNvbm4gb2YgdGhpcy5jb25uZWN0aW9ucykge1xuICAgICAgaWYgKCFmaWx0ZXIgfHwgZmlsdGVyKGNvbm4pKSB7XG4gICAgICAgIGNvbm4uc2VuZChtc2cpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXZlRWRpdFNlcnZlckRvY3VtZW50PFREb2MgPSBhbnk+IHtcbiAgc2VydmVyOiBMaXZlRWRpdFNlcnZlclxuICBpZDogc3RyaW5nXG4gIHR5cGU6IHN0cmluZ1xuICB2YWxpZGF0ZTogKGRvYzogVERvYykgPT4gYm9vbGVhblxuXG4gIC8vIFN0YXRlXG4gIGNoYW5nZUlEOiBzdHJpbmcgPSBcImluaXRpYWxcIlxuICBkb2M6IFREb2NcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzZXJ2ZXI6IExpdmVFZGl0U2VydmVyLFxuICAgIGlkOiBzdHJpbmcsXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIGluaXRpYWw6IFREb2MsXG4gICAgdmFsaWRhdGU/OiAoZG9jOiBURG9jKSA9PiBib29sZWFuXG4gICkge1xuICAgIHRoaXMuc2VydmVyID0gc2VydmVyXG4gICAgdGhpcy5pZCA9IGlkXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuZG9jID0gaW5pdGlhbFxuICAgIHRoaXMudmFsaWRhdGUgPSB2YWxpZGF0ZSB8fCAoKGRvYzogVERvYykgPT4gdHJ1ZSlcbiAgfVxuXG4gIGhhbmRsZVByb3Bvc2FsKGNoYW5nZTogQ2hhbmdlLCBjb25uOiBDb25uZWN0aW9uKSB7XG4gICAgY29uc29sZS5sb2coXCJIYW5kbGluZyBwcm9wb3NhbFwiLCBjaGFuZ2UsIGNvbm4pXG4gICAgLy8gT25seSBhY2NlcHQgdGhlIHByb3Bvc2FsIGlmIHRoZSBjaGFuZ2UgaXMgY29taW5nIGZyb20gdGhlIGxhdGVzdCB2ZXJzaW9uIG9mIHRoZSBkb2N1bWVudFxuICAgIGlmIChjaGFuZ2UuYmFzZUlEICE9PSB0aGlzLmNoYW5nZUlEKSB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYE5vcGUsIHlvdXIgYmFzZUlEIGlzIHdyb25nIHlvdXJzPSR7Y2hhbmdlLmJhc2VJRH0sIG1pbmUgPSAke3RoaXMuY2hhbmdlSUR9YFxuICAgICAgKVxuICAgICAgY29ubi5zZW5kKFtcbiAgICAgICAgXCJwcm9wb3NhbFJlc3VsdFwiLFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICAgIGNoYW5nZUlEOiBjaGFuZ2UuY2hhbmdlSUQsXG4gICAgICAgICAgcmVzdWx0OiBcIk5PUEVcIlxuICAgICAgICB9XG4gICAgICBdKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gQXBwbHkgcGF0Y2hlcywgcmVjZWl2aW5nIGEgbmV3IGRvY1xuICAgIGNvbnN0IG5leHREb2MgPSBhcHBseVBhdGNoZXModGhpcy5kb2MsIGNoYW5nZS5wYXRjaGVzKVxuXG4gICAgLy8gRW5zdXJlIHRoZSBkb2N1bWVudCBpcyBzdGlsbCB2YWxpZFxuICAgIGlmICghdGhpcy52YWxpZGF0ZShuZXh0RG9jKSkge1xuICAgICAgLy8gSW5mb3JtIHRoZSB1c2VyIHRoYXQgdGhlIGNoYW5nZSBpcyBpbnZhbGlkLCBhcyBpdCBtYWtlcyB0aGUgZG9jdW1lbnQgaW52YWxpZFxuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBEcm9wIHRoaXMgcmVxdWVzdCAtIHlvdXIgdXBkYXRlIGNhdXNlZCB0aGUgZG9jdW1lbnQgdG8gYmVjb21lIGludmFsaWQuYFxuICAgICAgKVxuICAgICAgY29ubi5zZW5kKFtcbiAgICAgICAgXCJwcm9wb3NhbFJlc3VsdFwiLFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICAgIGNoYW5nZUlEOiBjaGFuZ2UuY2hhbmdlSUQsXG4gICAgICAgICAgcmVzdWx0OiBcIkRST1BcIlxuICAgICAgICB9XG4gICAgICBdKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gVGhlIGNoYW5nZXMgYXJlIGFjY2VwdGVkXG4gICAgdGhpcy5kb2MgPSBuZXh0RG9jXG4gICAgdGhpcy5jaGFuZ2VJRCA9IGNoYW5nZS5jaGFuZ2VJRFxuXG4gICAgLy8gY29uc29sZS5sb2coXCJJbmZvcm1pbmcgb3RoZXIgY2xpZW50c1wiLCB0aGlzLmNsaWVudHMpXG4gICAgLy8gRGlzdHJpYnV0ZSB0aGUgY2hhbmdlIHRvIGFsbCBzdWJzY3JpYmVycyBvZiB0aGlzIGRvY3VtZW50LCBleGNlcHQgZm9yIHRoZSBjbGllbnQgd2hvIHNlbnQgdGhpcyBvbmVcbiAgICBjb25zb2xlLmxvZyhgRGlzdHJpYnV0aW5nIGNoYW5nZWApXG4gICAgdGhpcy5zZXJ2ZXIuc2VuZFRvU3Vic2NyaWJlcnMoXG4gICAgICBbXCJjaGFuZ2VkXCIsIHsgaWQ6IHRoaXMuaWQsIHR5cGU6IHRoaXMudHlwZSwgY2hhbmdlIH1dLFxuICAgICAgYyA9PlxuICAgICAgICBjICE9PSBjb25uICYmXG4gICAgICAgICEhYy5kb2NzLmZpbmQoZCA9PiBkLnR5cGUgPT09IHRoaXMudHlwZSAmJiBkLmlkID09PSB0aGlzLmlkKVxuICAgIClcblxuICAgIC8vIEluZm9ybSB0aGUgY3VycmVudCBjbGllbnQgb2YgdGhlaXIgc3VjY2Vzc1xuICAgIGNvbnNvbGUubG9nKGBQcm9wb3NhbCBhY2NlcHRlZCFgKVxuICAgIGNvbm4uc2VuZChbXG4gICAgICBcInByb3Bvc2FsUmVzdWx0XCIsXG4gICAgICB7IGlkOiB0aGlzLmlkLCB0eXBlOiB0aGlzLnR5cGUsIGNoYW5nZUlEOiBjaGFuZ2UuY2hhbmdlSUQsIHJlc3VsdDogXCJBQ0tcIiB9XG4gICAgXSlcbiAgfVxuXG4gIC8vIHByb2R1Y2UoY2hhbmdlcjogKGRyYWZ0OiBURG9jKSA9PiB2b2lkKSB7XG4gIC8vICAgdGhpcy5kb2MgPSBwcm9kdWNlKHRoaXMuZG9jLCBjaGFuZ2VyLCBwYXRjaGVzID0+IHtcbiAgLy8gICAgIGNvbnN0IGNoYW5nZTogQ2hhbmdlID0ge1xuICAvLyAgICAgICBiYXNlSUQ6IHRoaXMuY2hhbmdlSUQsXG4gIC8vICAgICAgIGNoYW5nZUlEOiBcIl9fXCIgKyB1dWlkKCksXG4gIC8vICAgICAgIHBhdGNoZXNcbiAgLy8gICAgIH1cbiAgLy8gICAgIHRoaXMuY2hhbmdlSUQgPSBjaGFuZ2UuY2hhbmdlSURcbiAgLy8gICAgIHRoaXMuY2xpZW50cy5mb3JFYWNoKGMgPT4ge1xuICAvLyAgICAgICB0aGlzLmhhbmRsZXIuc2VuZChjLCB7IGNoYW5nZSB9KVxuICAvLyAgICAgfSlcbiAgLy8gICB9KVxuICAvLyB9XG59XG4iXX0=