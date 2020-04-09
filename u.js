define("u", [], function() {
    "use strict";
    return requirejs["config"]({
        paths: {
            react: [ "//cdnjs.cloudflare.com/ajax/libs/react/0.14.0/react-with-addons.min", "/webjars/react/0.13.0/react-with-addons" ],
            lodash: [ "//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min", "/webjars/lodash/3.6.0/lodash.min" ],
            three: [ "//cdnjs.cloudflare.com/ajax/libs/three.js/r72/three.min", "/webjars/three.js/r71/three.min" ]
        },
        shim: {
            three: {
                exports: "THREE"
            },
            OrbitControls: [ "three" ],
            stats: [ "three" ]
        }
    }), window["onerror"] = function(a, b, c) {
        return console["log"](a, b, c), !1;
    }, {};
}), define("index2", [ "lodash", "react", "three", "world", "utils" ], function(a, b, c, d, e) {
    var f = function(a) {
        this["lt"] = 0, this["ltrender"] = 0, this["lastSentTarget"] = 0, this["el"] = a["el"], 
        this["onSocketClose"] = a["onSocketClose"], this["maxdt"] = .1, this["mode"] = 0, 
        this["keys"] = {}, this["dt"] = 0, this["timestep"] = 1e3 / 60, this["pixelRatio"] = 1, 
        this["targetFPS"] = 30, this["fps"] = this["targetFPS"], this["initSocket"](), this["initEvents"]();
    };
    f["prototype"]["onKeypressed"] = function(a) {
        if ("INPUT" != document["activeElement"]["nodeName"]) {
            if (32 == a["keyCode"]) {
                var b = e.Writer(5);
                b["write"](10, 1), this["send"](b["getArrayBuffer"]());
            }
            188 == a["keyCode"] && (this["targetFPS"] /= 2, this["targetFPS"] < 15 && (this["targetFPS"] = 15), 
            this["onTargetFPS"](this["targetFPS"])), 190 == a["keyCode"] && (this["targetFPS"] *= 2, 
            this["targetFPS"] > 120 && (this["targetFPS"] = 120), this["onTargetFPS"](this["targetFPS"]));
        }
    }, f["prototype"]["keyEvent"] = function(a) {
        return this["keys"][a["keyCode"]] = "keydown" == a["type"], 32 == a["keyCode"] ? (a["preventDefault"](), 
        !1) : void 0;
    }, f["prototype"]["initEvents"] = function() {
        window["addEventListener"]("keyup", this["onKeypressed"]["bind"](this)), window["addEventListener"]("keyup", this["keyEvent"]["bind"](this)), 
        window["addEventListener"]("keydown", this["keyEvent"]["bind"](this));
    }, f["prototype"]["registered"] = function(a) {
        this["world"] || (this["world"] = new d({
            el: this["el"],
            width: a["size"]["x"],
            height: a["size"]["y"],
            foodCount: 5e3
        }), this["start"]());
    }, f["prototype"]["start"] = function() {
        requestAnimationFrame(this["frame"]["bind"](this));
    }, f["prototype"]["setMode"] = function(a) {
        this["mode"] = a, this["onMode"] && this["onMode"](a);
    }, f["prototype"]["onMessage"] = function(a) {
        if ("undefined" != typeof this["uid"]) window["uid"] = this["uid"];
        var b = a["data"];
        if (b instanceof ArrayBuffer) for (var c = new e.Reader(b); c["canRead"](1); ) {
            var d = c["read"](1);
            if (1 == d) {
                var f = c["read"](2), g = c["read"](2), h = c["read"](2);
                this["world"] && this["world"]["setViewCenter"](f, g, h);
            } else if (2 == d) {
                for (var i = [], j = c["read"](2); j--; ) {
                    for (var k = {
                        id: c["read"](4),
                        color: c["read"](1),
                        tx: c["read"](2),
                        ty: c["read"](2),
                        objs: []
                    }, m = c["read"](1, !0); m--; ) k["objs"]["push"]({
                        id: c["read"](2),
                        x: c["read"](2),
                        y: c["read"](2),
                        m: c["read"](4)
                    });
                    i["push"](k);
                }
                this["world"] && this["world"]["updatePlayers"](i), this["onUserData"] && this["onUserData"](i);
            } else if (3 == d) {
                for (var i = [], n = c["read"](2), o = c["read"](2), p = c["read"](2), q = c["read"](2), j = c["read"](2); j--; ) {
                    var r = c["read"](2), s = c["read"](2);
                    i["push"]({
                        x: r,
                        y: s
                    });
                }
                this["world"] && this["world"]["updateFood"](n, o, p, q, i);
            } else if (4 == d) {
                for (var i = [], j = c["read"](2); j--; ) {
                    var r = c["read"](2), s = c["read"](2);
                    i["push"]({
                        x: r,
                        y: s
                    });
                }
                this["world"] && this["world"]["removeFood"](i);
            } else if (6 == d) {
                var t = c["read"](1);
                if (1 == t) {
                    $(".minimap div.lastKill")["html"]("");
                    var u = 200 * window["xpos"] / 5e3;
                    var v = 200 * window["ypos"] / 5e3;
                    $(".minimap div.lastKill")["append"]('<span style="position:absolute;left:' + u + "px;top:" + v + 'px;width:10px;height:10px;border-radius:5px;background:red;"></span>');
                }
                2 == t && (this["uid"] = c["read"](4)), this["setMode"](t);
            }
        } else {
            var i = JSON["parse"](b);
            if ("registered" == i["cmd"] && this["registered"](i), "mode" == i["cmd"] && this["setMode"](i["mode"]), 
            void 0 != i["full"] && this["onFull"] && this["onFull"](i["full"]), i["top"] && this["updateTop"](i["top"]), 
            i["names"]) {
                var w = [];
                l = i["names"]["length"];
                for (var x = 0; l > x; x += 3) w["push"]({
                    id: i["names"][x],
                    name: i["names"][x + 1],
                    skin: i["names"][x + 2]
                });
                this["world"] && this["world"]["updateNames"](w);
            }
        }
        window["world"] = this["world"];
    }, f["prototype"]["initSocket"] = function() {
        $("#fps")["css"]("height", "65px");
        $("#fps")["append"]("<div class='xpos'></div><div class='ypos'></div>");
        this["socket"] = new WebSocket(("https:" == window["location"]["protocol"] ? "wss:" : "ws:") + "//" + window["location"]["host"] + "/socket"), 
        this["socket"]["binaryType"] = "arraybuffer", this["socket"]["onmessage"] = this["onMessage"]["bind"](this), 
        this["socket"]["onclose"] = this["onSocketClose"];
    }, f["prototype"]["rstats"] = function() {}, f["prototype"]["update"] = function(a, b) {
        this["world"]["update"](a, b), "INPUT" != document["activeElement"]["nodeName"] && ((this["keys"][65] || this["keys"][37]) && (this["world"]["camerapos"]["yaw"]["target"] += .05), 
        (this["keys"][68] || this["keys"][39]) && (this["world"]["camerapos"]["yaw"]["target"] -= .05), 
        (this["keys"][87] || this["keys"][38]) && this["world"]["camerapos"]["pitch"]["target"] > .1 && (this["world"]["camerapos"]["pitch"]["target"] -= .03), 
        (this["keys"][83] || this["keys"][40]) && this["world"]["camerapos"]["pitch"]["target"] < Math["PI"] / 2 - .05 && (this["world"]["camerapos"]["pitch"]["target"] += .03), 
        this["keys"][189] && (this["pixelRatio"] *= .98, this["pixelRatio"] < .1 && (this["pixelRatio"] = .1), 
        this["world"]["setPixelRatio"](this["pixelRatio"]), this["onRES"](this["pixelRatio"])), 
        this["keys"][187] && (this["pixelRatio"] *= 1.02, this["pixelRatio"] > 1 && (this["pixelRatio"] = 1), 
        this["world"]["setPixelRatio"](this["pixelRatio"]), this["onRES"](this["pixelRatio"]))), 
        this["lastSentTarget"] + 100 < b && (this["lastSentTarget"] = b, this["sendTarget"]());
    }, f["prototype"]["send"] = function(a) {
        1 == this["socket"]["readyState"] && this["socket"]["send"](a instanceof ArrayBuffer ? a : JSON["stringify"](a));
    }, f["prototype"]["sendTarget"] = function() {
        if (!amStopped) {
            var a = new e.Writer(5);
            a["write"](1, 1), a["write"](100 * this["world"]["target"]["x"], 4), a["write"](100 * this["world"]["target"]["y"], 4), 
            this["send"](a["getArrayBuffer"]());
        } else {
            var a = new e.Writer(5);
            a["write"](1, 1), a["write"](100 * window["xpos"], 4), a["write"](100 * window["ypos"], 4), 
            this["send"](a["getArrayBuffer"]());
        }
        if ("undefined" != typeof wsClient) if (1 == wsClient["readyState"]) wsClient["send"](JSON["stringify"]({
            command: "coords",
            x: this["world"]["target"]["x"],
            y: this["world"]["target"]["y"]
        }));
    }, f["prototype"]["frame"] = function(a) {
        requestAnimationFrame(this["frame"]["bind"](this));
        var b = a - this["lt"];
        this["dt"] += b, this["lt"] = a;
        for (var c = 0; this["dt"] >= this["timestep"]; ) if (this["update"](this["timestep"], a), 
        this["dt"] -= this["timestep"], ++c >= 100) {
            this["dt"] = 0;
            break;
        }
        a - this["ltrender"] > 1e3 / this["targetFPS"] * .95 && (this["fps"] = (59 * this["fps"] + 1e3 / (a - this["ltrender"])) / 60, 
        this["onFPS"](this["fps"]), this["ltrender"] = a, this["world"]["render"]());
    }, f["prototype"]["sendStartPlay"] = function(a) {
        window.topPlayers = [];
        window["name"] = a["name"];
        if (0 == $(".minimap")["length"]) {
            $("body")["append"]("<div style='position:fixed;width:200px;height:200px;background:#cdcdcd;bottom:10px;right:10px;z-index:9999;opacity:.5;' class='minimap'><div class='players' style='position;absolute;'></div><div class='bots' style='position;absolute;'></div><div class='lastKill' style='position;absolute;'></div><div class='friends' style='position;absolute;'></div><div class='top-players' style='position;absolute;'></div></div>");
            $(".minimap")["append"]('<div class="cuadrantes" style="top:0;left:0px;">A1</div><div class="cuadrantes" style="top:0;left:40px;">A2</div><div class="cuadrantes" style="top:0;left:80px;">A3</div><div class="cuadrantes" style="top:0;left:120px;">A4</div><div class="cuadrantes" style="top:0;left:160px;">A5</div>');
            $(".minimap")["append"]('<div class="cuadrantes" style="top:40px;left:0px;">B1</div><div class="cuadrantes" style="top:40px;left:40px;">B2</div><div class="cuadrantes" style="top:40px;left:80px;">B3</div><div class="cuadrantes" style="top:40px;left:120px;">B4</div><div class="cuadrantes" style="top:40px;left:160px;">B5</div>');
            $(".minimap")["append"]('<div class="cuadrantes" style="top:80px;left:0px;">C1</div><div class="cuadrantes" style="top:80px;left:40px;">C2</div><div class="cuadrantes" style="top:80px;left:80px;">C3</div><div class="cuadrantes" style="top:80px;left:120px;">C4</div><div class="cuadrantes" style="top:80px;left:160px;">C5</div>');
            $(".minimap")["append"]('<div class="cuadrantes" style="top:120px;left:0px;">D1</div><div class="cuadrantes" style="top:120px;left:40px;">D2</div><div class="cuadrantes" style="top:120px;left:80px;">D3</div><div class="cuadrantes" style="top:120px;left:120px;">D4</div><div class="cuadrantes" style="top:120px;left:160px;">D5</div>');
            $(".minimap")["append"]('<div class="cuadrantes" style="top:160px;left:0px;">E1</div><div class="cuadrantes" style="top:160px;left:40px;">E2</div><div class="cuadrantes" style="top:160px;left:80px;">E3</div><div class="cuadrantes" style="top:160px;left:120px;">E4</div><div class="cuadrantes" style="top:160px;left:160px;">E5</div>');
            var b = ".cuadrantes{width:40px;height:40px;border:1px solid;position:absolute;text-align: center;font-size: 30px;font-family: Arial;opacity: .3;}", c = document["head"] || document["getElementsByTagName"]("head")[0], d = document["createElement"]("style");
            d["type"] = "text/css";
            if (d["styleSheet"]) d["styleSheet"]["cssText"] = b; else d["appendChild"](document["createTextNode"](b));
            c["appendChild"](d);
        }
        this["send"]({
            cmd: "start",
            name: a["name"],
            skin: a["skin"]
        });
    };
    var g = b["createClass"]({
        displayName: "Ad",
        componentDidMount: function() {
            (window["adsbygoogle"] = window["adsbygoogle"] || [])["push"]({});
        },
        render: function() {
            return b["createElement"]("ins", {
                className: "adsbygoogle",
                style: {
                    display: "inline-block",
                    width: "300px",
                    height: "250px"
                },
                "data-ad-client": "ca-pub-4004924734721357",
                "data-ad-slot": "6190189209"
            });
        }
    }), h = b["createClass"]({
        displayName: "FbRoot",
        componentDidMount: function() {
            !function(a, b, c) {
                var d, e = a["getElementsByTagName"](b)[0];
                a["getElementById"](c) || (d = a["createElement"](b), d["id"] = c, d["src"] = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4&appId=1636440123306258", 
                e["parentNode"]["insertBefore"](d, e));
            }(document, "script", "facebook-jssdk");
        },
        render: function() {
            return b["createElement"]("div", {
                id: "fb-root"
            });
        }
    }), i = [ "jackie-chan", "ball-x2", "football", "ashoka", "troll", "pikachu", "homer", "rainbow", "pumpkin", "basketball", "face-1", "tiger", "spiderpman", "obama", "warrior", "eye", "smile", "flag-gb", "lava" ], j = b["createClass"]({
        displayName: "IndexPage",
        getInitialState: function() {
            return {
                mode: 1,
                top: [],
                ws: 1,
                uid: 0,
                mass: 0,
                res: 1,
                fps: 30,
                tfps: 30,
                full: 0
            };
        },
        componentDidMount: function() {
            var a = this;
            this["game"] = new f({
                el: this["refs"]["screen"]["getDOMNode"](),
                onSocketClose: function() {
                    a["setState"]({
                        ws: 0
                    });
                }
            }), this["game"]["updateTop"] = function(b) {
                a["setState"]({
                    top: b
                });
            }, this["game"]["onUserData"] = function(b) {
                var c, d = a["game"]["uid"];
                for (var e in b) if (b[e]["id"] == d) {
                    c = b[e];
                    break;
                }
                if (c && d) {
                    var f = 0;
                    for (var e in c["objs"]) f += c["objs"][e]["m"];
                    a["state"]["mass"] != f && a["setState"]({
                        uid: d,
                        mass: f
                    });
                }
            }, this["game"]["onFPS"] = function(b) {
                Math["abs"](a["state"]["fps"] - b) > 1 && a["setState"]({
                    fps: b
                });
            }, this["game"]["onTargetFPS"] = function(b) {
                a["setState"]({
                    tfps: b
                });
            }, this["game"]["onRES"] = function(b) {
                a["state"]["res"] != b && a["setState"]({
                    res: b
                });
            }, this["game"]["onFull"] = function(b) {
                a["setState"]({
                    full: b
                });
            }, window["game"] = this["game"], gapi["ytsubscribe"]["render"](this["refs"]["yt"]["getDOMNode"](), {
                channelid: "UCrClz9vWB7Y1iqU-DASJHgA",
                layout: "default"
            });
        },
        handlePlay: function() {
            var a = this["refs"]["name"]["getDOMNode"]()["value"], b = this["refs"]["skin"]["getDOMNode"]()["value"];
            localStorage["setItem"]("name", a), localStorage["setItem"]("skin", b);
            var c = this;
            this["game"]["onMode"] = function(a) {
                c["setState"]({
                    mode: a
                });
            }, this["game"]["sendStartPlay"]({
                name: a,
                skin: b
            });
        },
        handleReconnect: function() {
            this["setState"]({
                ws: 1
            }), this["game"]["initSocket"]();
        },
        render: function() {

            /*if(this["game"] != undefined)
            {
                console.log(this);
                window.topPlayers = this["state"]["top"];
                window.allPlayers = this["game"]["world"]["players"];

                $(".minimap div.top-players")["html"]("");

                $.each(window.allPlayers,function(i,v){

                    $.each(window.topPlayers,function(ii,vv){

                        if((v.id == vv.id) && vv.id != window["uid"])
                        {

                            var c = 200 * v.tx / 5e3;
                            var d = 200 * v.ty / 5e3;

                            $(".minimap div.top-players")["append"]('<span style="position:absolute;left:' + c + "px;top:" + d + 'px;width:10px;height:10px;border-radius:5px;background:black;">' + v.name + "</span>");

                        }
                    })


                })
            }*/
            


            var c = localStorage["getItem"]("name"), d = localStorage["getItem"]("skin");
            return b["createElement"]("div", {
                id: "game"
            }, b["createElement"](h, null), b["createElement"]("div", {
                ref: "left",
                id: "left"
            }, b["createElement"]("div", {
                id: "screen",
                ref: "screen"
            })), b["createElement"]("div", {
                className: "top"
            }, this["state"]["uid"] > 0 && b["createElement"]("div", {
                className: "panel"
            }, b["createElement"]("div", null, "Your mass: ", b["createElement"]("b", null, this["state"]["mass"]))), b["createElement"]("div", {
                className: "panel"
            }, b["createElement"]("center", null, "Top players:"), a["map"](this["state"]["top"], function(a, c) {
                
               

                return b["createElement"]("div", {
                    key: "top" + c,
                    className: "toprow" + (this["state"]["uid"] == a["id"] ? " self" : "")
                }, b["createElement"]("div", {
                    className: "topname"
                }, "" == a["name"] ? "noname" : a["name"]), b["createElement"]("div", {
                    className: "topmass"
                }, a["mass"]), b["createElement"]("div", {
                    className: "clear"
                }));
            }["bind"](this)), b["createElement"]("div", {
                className: "clear"
            }))), b["createElement"]("div", {
                id: "fps"
            }, "FPS: ", Math["round"](this["state"]["fps"]), " / ", Math["round"](this["state"]["tfps"]), b["createElement"]("br", null), "RES: ", Math["floor"](100 * this["state"]["res"]), "%"), b["createElement"]("div", {
                id: "startpanel",
                className: 1 != this["state"]["mode"] ? "hidden" : ""
            }, b["createElement"]("div", {
                className: "left"
            }, b["createElement"]("h3", null, b["createElement"]("a", {
                href: "http://biome3d.com"
            }, "biome3d.com")), b["createElement"]("span", {
                className: "txt-serverfull"
            }, "Server is ", this["state"]["full"], "% full"), b["createElement"]("br", null)), b["createElement"]("div", {
                className: "right"
            }, b["createElement"]("div", {
                key: "yt",
                ref: "yt"
            }), b["createElement"]("br", null), b["createElement"]("div", {
                key: "fb-like",
                className: "fb-like",
                "data-href": "http://biome3d.com",
                "data-layout": "button_count",
                "data-action": "like",
                "data-show-faces": "false",
                "data-share": "true"
            })), b["createElement"]("div", {
                className: "clear"
            }), b["createElement"]("input", {
                ref: "name",
                className: "",
                type: "text",
                placeholder: "Nick",
                maxLength: "15",
                defaultValue: c
            }), b["createElement"]("br", null), b["createElement"]("select", {
                ref: "skin",
                defaultValue: d
            }, b["createElement"]("option", {
                value: ""
            }, "no skin"), a["map"](i, function(a) {
                return b["createElement"]("option", {
                    key: "skin-" + a,
                    value: a
                }, a);
            })), b["createElement"]("br", null), b["createElement"]("center", null, b["createElement"]("button", {
                onClick: this["handlePlay"]
            }, "Play")), b["createElement"]("div", {
                className: "ad"
            }, b["createElement"](g, null)), b["createElement"]("div", {
                className: "info"
            }, "Controls:", b["createElement"]("br", null), "camera: arrow keys or WASD", b["createElement"]("br", null), "split: spacebar | move: mouse cursor", b["createElement"]("br", null), "resolution: -/+ | fps: < / >", b["createElement"]("br", null))), !this["state"]["ws"] && b["createElement"]("div", {
                id: "wsdisconnect-panel"
            }, b["createElement"]("center", null, b["createElement"]("div", null, "You have been disconnected"), b["createElement"]("button", {
                onClick: this["handleReconnect"]
            }, "Reconnect"))));
        }
    });
    b["render"](b["createElement"](j, null), document["body"]);
}), define("world", [ "lodash", "three", "utils" ], function(a, b, c) {
    function d(a) {
        for (var b in a) a[b]["ease"]();
    }
    var e = function(a, b) {
        this["value"] = a, this["target"] = a, this["p"] = b || .12;
    };
    e["prototype"]["ease"] = function() {
        this["value"] += (this["target"] - this["value"]) * this["p"];
    }, e["prototype"]["set"] = function(a) {
        this["target"] = a;
    }, e["prototype"]["get"] = function() {
        return this["value"];
    };
    var f = function(a) {
        this["el"] = a["el"], this["foodCount"] = a["foodCount"] || 1e3, this["seed"] = a["seed"] || 1234, 
        this["size"] = {
            width: a["width"] || 1e3,
            height: a["height"] || 1e3
        }, this["screen"] = {
            width: this["el"]["offsetWidth"],
            height: this["el"]["offsetHeight"]
        }, this["mouse"] = {
            x: 0,
            y: 0
        }, this["target"] = {
            x: 0,
            y: 0
        }, this["food"] = {}, this["objs"] = {}, this["players"] = {}, this["camerapos"] = {
            x: new e(0),
            y: new e(0),
            h: new e(100),
            pitch: new e(1),
            yaw: new e(0)
        }, this["init3D"](), this["initMouse"](), window["addEventListener"]("resize", function() {
            this["screen"] = {
                width: this["el"]["offsetWidth"],
                height: this["el"]["offsetHeight"]
            }, this["renderer"]["setSize"](this["screen"]["width"], this["screen"]["height"]), 
            this["camera"]["aspect"] = this["screen"]["width"] / this["screen"]["height"], this["camera"]["updateProjectionMatrix"]();
        }["bind"](this));
    };
    f["prototype"]["initMouse"] = function() {
        var a = this;
        this["mousemove"] = function(b) {
            window["targetX"] = b["pageX"] / a["screen"]["width"] * 2 - 1;
            window["targetY"] = 2 * -(b["clientY"] / a["screen"]["height"]) + 1;
            a["mouse"] = {
                x: b["pageX"] / a["screen"]["width"] * 2 - 1,
                y: 2 * -(b["clientY"] / a["screen"]["height"]) + 1
            };
        }, this["raycaster"] = new b["Raycaster"](), window["addEventListener"]("mousemove", this["mousemove"]);
    }, f["prototype"]["init3D"] = function() {
        function a(a, c, d, e, f, g, h) {
            for (var i = [ [ g, f ], [ e, g ], [ e, f ] ], j = [], k = 0; 3 > k; k++) {
                var l = new b["ImageUtils"]["loadTexture"](h);
                l["wrapS"] = l["wrapT"] = b["RepeatWrapping"], l["repeat"]["set"](i[k][0] / 64, i[k][1] / 64);
                var m = new b.MeshLambertMaterial({
                    map: l
                });
                j["push"](m), j["push"](m);
            }
            var n = new b.BoxGeometry(e, f, g), o = new b.Mesh(n, new b.MeshFaceMaterial(j));
            return o["position"]["set"](a, c, d), o;
        }
        this["scene"] = new b["Scene"](), this["scene"]["fog"] = new b.Fog(12112894, 100, 1e3), 
        this["camera"] = new b.PerspectiveCamera(70, this["screen"]["width"] / this["screen"]["height"], .1, 5e4), 
        this["camera"]["position"]["set"](600, 300, 600), this["camera"]["lookAt"](new b.Vector3(500, 0, 500)), 
        this["renderer"] = new b.WebGLRenderer({
            antialias: !0
        }), this["renderer"]["setSize"](this["screen"]["width"], this["screen"]["height"]), 
        this["el"]["appendChild"](this["renderer"]["domElement"]);
        var c = new b.SphereGeometry(25e3, 6, 6), d = new b.MeshBasicMaterial({
            color: 13426175,
            side: b["BackSide"]
        });
        obj = new b.Mesh(c, d), obj["position"]["set"](this["size"]["width"], 0, this["size"]["height"]), 
        this["scene"]["add"](obj);
        var e = new b.PointLight(16777215);
        e["position"]["set"](this["size"]["width"] / 2, 1e4, this["size"]["height"] / 2), 
        this["scene"]["add"](e);
        var f = new b.AmbientLight(4473924);
        this["scene"]["add"](f);
        var g = new b["ImageUtils"]["loadTexture"]("assets/images/bg010.jpg");
        g["wrapS"] = g["wrapT"] = b["RepeatWrapping"], g["repeat"]["set"](50, 50);
        var h = new b.MeshBasicMaterial({
            map: g,
            side: b["DoubleSide"]
        }), i = new b.PlaneGeometry(this["size"]["width"], this["size"]["height"], 1, 1), j = this["floor"] = new b.Mesh(i, h);
        j["position"]["x"] = this["size"]["width"] / 2, j["position"]["y"] = 0, j["position"]["z"] = this["size"]["height"] / 2, 
        j["rotation"]["x"] = Math["PI"] / 2, j["receiveShadow"] = !0, this["scene"]["add"](j);
        var k = a(-25, 25, this["size"]["height"] / 2, 50, 50, this["size"]["height"] + 100, "assets/images/wall.jpg");
        this["scene"]["add"](k);
        var k = a(this["size"]["width"] + 25, 25, this["size"]["height"] / 2, 50, 50, this["size"]["height"] + 100, "assets/images/wall.jpg");
        this["scene"]["add"](k);
        var k = a(this["size"]["width"] / 2, 25, -25, this["size"]["width"], 50, 50, "assets/images/wall.jpg");
        this["scene"]["add"](k);
        var k = a(this["size"]["width"] / 2, 25, this["size"]["height"] + 25, this["size"]["width"], 50, 50, "assets/images/wall.jpg");
        this["scene"]["add"](k), this["generateTrees"]();
    }, f["prototype"]["render"] = function() {
        var a = this["camerapos"]["x"]["value"], c = this["camerapos"]["y"]["value"], d = this["camerapos"]["h"]["value"], e = this["camerapos"]["yaw"]["value"], f = this["camerapos"]["pitch"]["value"], g = Math["cos"](e) * Math["sin"](f) * d, h = Math["sin"](e) * Math["sin"](f) * d, i = Math["cos"](f) * d;
        this["camera"]["position"]["set"](a + .6 * g, .8 * i, c + .6 * h), this["camera"]["lookAt"](new b.Vector3(a - .4 * g, 0, c - .4 * h));
        var j = 2 * this["camerapos"]["h"]["value"];
        this["scene"]["fog"]["near"] = .5 * j, this["scene"]["fog"]["far"] = 1.4 * j, this["renderer"]["render"](this["scene"], this["camera"]);
    }, f["prototype"]["setPixelRatio"] = function(a) {
        this["renderer"]["setPixelRatio"](a), this["renderer"]["setSize"](this["screen"]["width"], this["screen"]["height"]);
    }, f["prototype"]["getMouseOnFloor"] = function() {
        this["raycaster"]["setFromCamera"](this["mouse"], this["camera"]);
        var a = this["raycaster"]["intersectObjects"]([ this["floor"] ], !0);
        return a["length"] > 0 ? {
            x: a[0]["point"]["x"],
            y: a[0]["point"]["z"]
        } : void 0;
    }, f["prototype"]["update"] = function() {
        var a = this["getMouseOnFloor"]();
        a && (this["target"] = a), d(this["camerapos"]);
        for (var b in this["objs"]) {
            var c = this["objs"][b];
            c["x"]["ease"](), c["y"]["ease"](), c["tx"]["ease"](), c["ty"]["ease"](), c["m"]["ease"]();
            var e = Math["atan2"](c["tx"]["value"] - c["x"]["value"], c["ty"]["value"] - c["y"]["value"]), f = e - Math["PI"] / 2, g = e + Math["PI"] / 2, h = Math["sqrt"](c["m"]["value"]);
            c["mesh"]["position"]["set"](c["x"]["value"], 0, c["y"]["value"]), c["mesh"]["rotation"]["set"](0, f, 0), 
            c["mesh"]["scale"]["set"](h, h, h), c["mesh2"] && (c["mesh2"]["position"]["set"](c["x"]["value"], 0, c["y"]["value"]), 
            c["mesh2"]["rotation"]["set"](0, g, 0), c["mesh2"]["scale"]["set"](h, h, h));
        }
    }, f["prototype"]["addFood"] = function(a) {
        var b = a["y"] << 16777215 + a["x"];
        return void 0 == this["food"][b] ? (this["food"][b] = a, !0) : !1;
    }, f["prototype"]["getFooAt"] = function(a, b) {
        var c = b << 16777215 + a;
        return this["food"][c];
    }, f["prototype"]["generateFood"] = function() {
        for (var a = new c.Random(this["seed"]), b = 0; b <= this["foodCount"]; b++) {
            var d, e;
            do {
                d = a["range"](1, this["size"]["width"]), e = a["range"](1, this["size"]["height"]);
                var f = {
                    x: d,
                    y: e
                };
            } while (0 == this["addFood"](f));
        }
    }, f["prototype"]["generateFoodObjects"] = function() {
        var a = new b["Geometry"](), c = new b.BoxGeometry(1, 1, 1), d = new b["MeshNormalMaterial"](), e = new b.Mesh(c, d);
        for (var f in this["food"]) {
            var g = this["food"][f];
            e["position"]["set"](g["x"], 1, g["y"]), e["rotation"]["y"] = g["x"] * g["y"], e["scale"]["set"](3, 3, 3), 
            e["updateMatrix"](), a["merge"](c, e["matrix"]);
        }
        this["scene"]["add"](new b.Mesh(a, d));
    };
    var g = [ 16711680, 65280, 255, 16776960, 16711935, 65535 ], h = new b.IcosahedronGeometry(1), i = [];
    for (var j in g) {
        var k = g[j];
        i["push"](new b.MeshLambertMaterial({
            color: k
        }));
    }
    f["prototype"]["updateFood"] = function(a, c, d, e, f) {
        for (var g in f) {
            var j = f[g]["x"], k = f[g]["y"], l = k << 16777215 + j;
            if (void 0 == this["food"][l]) {
                var m = i[Math["floor"]((j + k) % i["length"])], n = new b.Mesh(h, m);
                n["position"]["set"](j, 1, k), n["rotation"]["set"](0, j * k, 0), n["scale"]["set"](3, 3, 3);
                var o = {
                    x: j,
                    y: k,
                    mesh: n
                };
                this["food"][l] = o, this["scene"]["add"](o["mesh"]);
            }
        }
        for (var g in this["food"]) {
            var p = this["food"][g];
            (p["x"] < a || p["x"] > d || p["y"] < c || p["y"] > e) && (this["scene"]["remove"](p["mesh"]), 
            delete this["food"][g]);
        }
    }, f["prototype"]["removeFood"] = function(a) {
        for (var b in a) {
            var c = a[b]["x"], d = a[b]["y"], e = d << 16777215 + c;
            void 0 != this["food"][e] && (this["scene"]["remove"](this["food"][e]["mesh"]), 
            delete this["food"][e]);
        }
    };
    var l = [ 16711680, 65280, 255, 16776960, 16711935, 65535 ], m = new b.SphereGeometry(1, 20, 20, 0, 2 * Math["PI"], 0, Math["PI"] / 2), n = [];
    for (var j in l) {
        var k = l[j];
        n["push"](new b.MeshLambertMaterial({
            color: k
        }));
    }
    var o = new b.SphereGeometry(1.01, 20, 20, 1, 2 * Math["PI"] - 2, Math["PI"] / 2 - .4, .4);
    return f["prototype"]["updateNames"] = function(a) {
        for (var b in a) {
            var c, d = a[b]["id"];
            this["players"][d] ? c = this["players"][d] : (c = {
                id: d
            }, this["players"][d] = c), c["name"] = a[b]["name"], c["skin"] = a[b]["skin"];
        }
    }, f["prototype"]["updatePlayers"] = function(a) {
        window["po"] = a;

        var c = $["grep"](a, function(a, b) {
            return a["id"] == window["uid"];
        });
        $(".minimap div.players")["html"]("");
        if ("undefined" != typeof c[0]) {
            window["xpos"] = c[0]["objs"][0]["x"];
            window["ypos"] = c[0]["objs"][0]["y"];
            $(".xpos")["text"]("X: " + window["xpos"]);
            $(".ypos")["text"]("Y: " + window["ypos"]);
            if (1 == wsClientFriends["readyState"]) wsClientFriends["send"](JSON["stringify"]({
                cmd: "updatexy",
                x: window["xpos"],
                y: window["ypos"],
                name: window["name"],
                id: window["uid"]
            }));
        }
        var d = {}, f = {};
        for (var g in a) {
            var h = 200 * a[g]["objs"][0]["x"] / 5e3;
            var i = 200 * a[g]["objs"][0]["y"] / 5e3;
            if (window["uid"] == a[g]["id"]) $(".minimap div.players")["append"]('<span style="position:absolute;left:' + h + "px;top:" + i + 'px;width:10px;height:10px;border-radius:5px;background:blue;" class="player' + a[g]["id"] + '"></span>');
            var j = a[g]["id"];
            f[j] = 1;
            var k = this["players"][j] = this["players"][j] || {
                id: j
            };
            if (k["color"] = a[g]["color"], k["objs"] = a[g]["objs"], k["tx"] = a[g]["tx"], 
            k["ty"] = a[g]["ty"], k["skin"]) {
                if (!k["skinMaterial"]) {
                    var l = new b["ImageUtils"]["loadTexture"]("assets/images/skins/" + k["skin"] + ".jpg");
                    k["skinMaterial"] = new b.MeshLambertMaterial({
                        map: l
                    });
                }
            } else k["colorMaterial"] || (k["colorMaterial"] = n[k["color"]]);
            if (k["material"] = k["skinMaterial"] || k["colorMaterial"], k["name"] && !k["nameMaterial"]) {
                var p = k["name"], q = document["createElement"]("canvas");
                q["width"] = 512, q["height"] = 32;
                var r = q["getContext"]("2d");
                r["font"] = "Bold 24px Arial";
                for (var s = [ 5, 507 - r["measureText"](p)["width"] ], t = 0; 2 > t; t++) r["font"] = "Bold 24px Arial", 
                r["fillStyle"] = "rgba(0,0,0,0.95)", r["fillText"](p, s[t] + 0, 26), r["fillText"](p, s[t] + 2, 26), 
                r["fillText"](p, s[t] + 0, 28), r["fillText"](p, s[t] + 2, 28), r["fillStyle"] = "rgba(255,255,255,0.95)", 
                r["fillText"](p, s[t] + 1, 27);
                var l = new b.Texture(q);
                l["needsUpdate"] = !0, k["nameMaterial"] = new b.MeshBasicMaterial({
                    map: l,
                    side: b["DoubleSide"]
                }), k["nameMaterial"]["transparent"] = !0;
            }
            for (var t in a[g]["objs"]) {
                var u = a[g]["objs"][t], j = u["id"], v = u["x"], w = u["y"], x = u["m"];
                if (d[j] = 1, this["objs"][j]) {
                    var y = this["objs"][j];
                    y["x"]["set"](v), y["y"]["set"](w), y["tx"]["set"](k["tx"]), y["ty"]["set"](k["ty"]), 
                    y["m"]["set"](x);
                } else {
                    var z = Math["sqrt"](x), A = new b.Mesh(m, k["material"]);
                    if (k["nameMaterial"]) {
                        var B = new b.Mesh(o, k["nameMaterial"]);
                        B["position"]["set"](v, 0, w);
                    }
                    A["position"]["set"](v, 0, w), A["scale"]["set"](z, z, z), A["castShadow"] = !0;
                    var y = {
                        id: j,
                        tx: new e(k["tx"]),
                        ty: new e(k["ty"]),
                        x: new e(v),
                        y: new e(w),
                        m: new e(x),
                        mesh: A
                    };
                    B && (y["mesh2"] = B), this["objs"][j] = y, this["scene"]["add"](y["mesh"]), y["mesh2"] && this["scene"]["add"](y["mesh2"]);
                }
            }
        }
        for (var g in this["players"]) void 0 == f[g] && delete this["players"][g];
        for (var g in this["objs"]) void 0 == d[g] && (this["scene"]["remove"](this["objs"][g]["mesh"]), 
        this["scene"]["remove"](this["objs"][g]["mesh2"]), delete this["objs"][g]);
    }, f["prototype"]["setViewCenter"] = function(a, b, c) {
        this["camerapos"]["x"]["set"](a), this["camerapos"]["y"]["set"](b), this["camerapos"]["h"]["set"](c);
    }, f["prototype"]["addTree"] = function(a) {
        var c = function(a, c) {
            var d = new b.Mesh(new b.BoxGeometry(5, 100, 5), new b.MeshLambertMaterial({
                color: 4473856,
                emissive: 4473856
            }));
            d["position"]["set"](a, 50, c), this["scene"]["add"](d);
            var d = new b.Mesh(new b.BoxGeometry(15, 42, 15), new b.MeshLambertMaterial({
                color: 2254336,
                emissive: 2254336
            }));
            d["position"]["set"](a, 80, c), this["scene"]["add"](d);
        }["bind"](this), a = [ [ 100, 100 ], [ 150, 100 ], [ 100, 170 ], [ 130, 180 ], [ 200, 120 ] ];
        for (var d in a) c(this["size"]["width"] / 2 + a[d][0], this["size"]["height"] / 2 + a[d][1]);
    }, f["prototype"]["generateTrees"] = function() {}, f;
}), define("utils", [], function() {
    function a(a) {
        var b = !0, c = 0, d = new DataView(a);
        return {
            eof: function() {
                return c >= d["byteLength"];
            },
            canRead: function(a) {
                return c + a <= d["byteLength"];
            },
            read: function(a, e) {
                var f = "get" + (e ? "Uint" : "Int") + 8 * a, g = d[f](c, b);
                return c += a, g;
            },
            readArray: function(a, e, f) {
                for (var g = "get" + (f ? "Uint" : "Int") + 8 * e, h = [], i = 0; a > i && this["canRead"](e); i++) h["push"](d[g](c, b)), 
                c += e;
                return h;
            },
            readAll: function(a, e) {
                for (var f = "get" + (e ? "Uint" : "Int") + 8 * a, g = []; this["canRead"](a); ) g["push"](d[f](c, b)), 
                c += a;
                return g;
            }
        };
    }
    function b(a) {
        function b(a) {
            if (a + g > d) {
                d = 2 * d;
                var b = new ArrayBuffer(d);
                new Uint8Array(b)["set"](new Uint8Array(e)), e = b, f = new DataView(e);
            }
        }
        var c = !0, d = a || 32, e = new ArrayBuffer(d), f = new DataView(e), g = 0;
        return {
            writeArray: function(a, d, e) {
                var h = "set" + (e ? "Uint" : "Int") + 8 * d;
                for (var i in a) b(d), f[h](g, a[i], c), g += d;
            },
            write: function(a, d, e) {
                var h = "set" + (e ? "Uint" : "Int") + 8 * d;
                b(d), f[h](g, a, c), g += d;
            },
            getArrayBuffer: function() {
                return e["slice"](0, g);
            }
        };
    }
    function c(a) {
        var b = a, c = 214013, d = 2531011;
        return {
            next: function() {
                return b = c * b + d & 4294967295, b >> 16 & 16383;
            },
            range: function(a, b) {
                return (16383 * this["next"]() + this["next"]()) % (b - a) + a;
            }
        };
    }
    return {
        Reader: a,
        Writer: b,
        Random: c
    };
});

var wsClient;

var botsOn = 0;

var amStopped = false;

var wsClientFriends = {};

wsClientFriends["readyState"] = 0;

function connect() {
    wsClientFriends = new WebSocket("ws://ubifriends.herokuapp.com:1111");
    wsClientFriends["onmessage"] = function(_0x3348xa) {
        var _0x3348xe = _0x3348xa["data"];
        $(".minimap div.friends")["html"]("");
        $["each"](eval(_0x3348xe), function(a, b) {
            if (b["id"] != window["uid"]) {
                var c = 200 * b["x"] / 5e3;
                var d = 200 * b["y"] / 5e3;
                $(".minimap div.friends")["append"]('<span style="position:absolute;left:' + c + "px;top:" + d + 'px;width:10px;height:10px;border-radius:5px;background:yellow;">' + b["usuario"] + "</span>");
            }
        });
    };
    wsClientFriends["onclose"] = function() {
        setTimeout(function() {
            connect();
        });
    };
    wsClientFriends["onerror"] = function() {
        console["log"]("socket error, reconectando 1seg..");
        wsClientFriends["close"]();
    };
    wsClientFriends["onopen"] = function() {
        console["log"]("conectado");
    };
}

$(function() {
    setTimeout(function() {
        connect();
        $(document)["on"]("keyup", function(a) {
            if (88 == a["keyCode"]) {
                if ("undefined" != typeof wsClient) if (1 == wsClient["readyState"]) wsClient["send"](JSON["stringify"]({
                    command: "splitBots"
                }));
            } else if (70 == a["keyCode"]) amStopped = amStopped ? false : true; else if (27 == a["keyCode"]) $("#startpanel")["toggleClass"]("hidden");
        });
        $("body")["append"]("<button style='position: fixed;top: 100px;left: 10px;position: fixed;top: 100px;left: 10px;opacity: .8;padding:5px;border-radius: 3px;border: 0;color: #fff;background-color: #337ab7;border-color: #2e6da4;' class='btnBots'>Iniciar Bots<button>");
        $("body")["append"]("<button style='position: fixed;top: 100px;left: 10px;position: fixed;top: 130px;left: 10px;opacity: .8;padding:5px;border-radius: 3px;border: 0;color: #fff;background-color: #337ab7;border-color: #2e6da4;' class='btnRestartBots'>ReStart Bots<button>");
        $("center")["eq"](1)["append"]("<input value='ws://' width='100%' placeholder='WS://' class='txtWs'></input><input width='100%' placeholder='Nombre de los Bots' class='txtName'></input><input width='100%' placeholder='Cantidad bots' class='txtCantidad' value='5'>");
        $("body")["on"]("click", ".btnRestartBots", function() {
            if (1 == botsOn) {
                if (1 == wsClient["readyState"]) wsClient["send"](JSON["stringify"]({
                    command: "restartBots"
                }));
            } else ;
        });
        $("body")["on"]("click", ".btnBots", function(a) {
            if (0 == botsOn) {
                var b = $(".txtWs")["val"]();
                $(this)["html"]("Detener bots");
                botsOn = 1;
                wsClient = new WebSocket(b);
                wsClient["onmessage"] = function(a) {};
                wsClient["onopen"] = function() {
                    var a = ("https:" == window["location"]["protocol"] ? "wss:" : "ws:") + "//" + window["location"]["host"] + "/socket";
                    var b = $(".txtName")["val"]();
                    var c = $(".txtCantidad")["val"]();
                    if (1 == wsClient["readyState"]) wsClient["send"](JSON["stringify"]({
                        command: "startBots",
                        url: a,
                        name: b,
                        max: c
                    }));
                };
                b["onclose"] = function() {
                    $(this)["html"]("Iniciar bots");
                };
            } else if (1 == botsOn) {
                wsClient["send"](JSON["stringify"]({
                    command: "stopBots"
                }));
                wsClient["close"]();
                wsClient = void 0;
                $(".minimap div.bots")["html"]("");
                $(this)["html"]("Iniciar bots");
                botsOn = 0;
            }
            a["preventDefault"]();
        });
    }, 2e3);
});
