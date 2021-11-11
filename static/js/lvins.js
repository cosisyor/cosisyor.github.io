var LvIns = {
    channel:{},
    param:{},
    localip:"",
    init : function (opts,success) {
        param = opts;
        param= this.getquery(param);
        var dopost = function(callback) {
            param.ua = navigator.userAgent;
            $.ajax({
                type: "post",
                url: "https://567live.vip/channel/init",
                data: JSON.stringify(param),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    var ret = JSON.parse(data);
                    if (ret.code == 1) {
                        channel = JSON.parse(ret.data);
                        if(callback!=null) {
                            callback(channel);
                        }
                    } else {
                        showmsg(ret.msg);
                    }
                },
                error: function (message) {
                    showmsg(message.statusText);
                }
            });
        };
        // this.getip(function (ip){
        //     showmsg("ip:" + ip);
        //     param.localip = ip;
        // });
        dopost(success);
    },
    wakeup: function (){
        if(channel.schema!=null) {
            try {
                window.location.href = channel.schema;
            }catch (e){}
        }
    },
    download : function () {
        if(channel.url!=null) {
            try {
                window.location.href = channel.url;
            }catch (e){}
        }
    },
    getip1 : function (callback) {
        var recode = {};
        var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var pc = new RTCPeerConnection();
        function handleCandidate(candidate) {
            var ip_regexp = /([0-9]{1,3}(\.[0-9]{1,3}){3}|([a-f0-9]{1,4}((:[a-f0-9]{1,4}){7}|:+[a-f0-9]{1,4}){6}))/;
            var ip_isMatch = candidate.match(ip_regexp)[1];
            if (!recode[ip_isMatch]) {
                callback(ip_isMatch);
                recode[ip_isMatch] = true;
            }
        }
        pc.onicecandidate = (ice) => {
            if (ice.candidate) {
                handleCandidate(ice.candidate.candidate);
            }
        };
        pc.createDataChannel('');
        pc.createOffer((res) => {
            pc.setLocalDescription(res);
        }, () => {});

        setTimeout(() => {
            var lines = pc.localDescription.sdp.split('\n');
            lines.forEach(item => {
                if (item.indexOf('a=candidate:') === 0) {
                    handleCandidate(item);
                }
            })
        }, 100);
    },
    getip: function (callback) {

        var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var pc = new myPeerConnection({
                iceServers: []
            }),
            noop = function() {},
            localIPs = {},
            ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
            key;

        function iterateIP(ip) {
            if (!localIPs[ip]) callback(ip);
            localIPs[ip] = true;
        }
        pc.createDataChannel("");
        pc.createOffer().then(function(sdp) {
            sdp.sdp.split('\n').forEach(function(line) {
                if (line.indexOf('candidate') < 0) return;
                line.match(ipRegex).forEach(iterateIP);
            });

            pc.setLocalDescription(sdp, noop, noop);
        }).catch(function(reason) {
        });
        pc.onicecandidate = function(ice) {
            if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
            ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
        };
    },
    getOs : function () {
        var u = navigator.userAgent;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios
        if (isAndroid) { //Androi
            return "and";
        } else if (isiOS) { // ios
            return "ios";
        } else {
            return "win";
        }
    },
    getquery : function (obj) {
        var ss = window.location.search;
        if(ss.indexOf("?")>=0) {
            var str = ss.substring(1, ss.length);
            var arr = str.split("&");
            for (var i = 0; i < arr.length; i++) {
                var t = arr[i].split("=");
                obj[decodeURIComponent(t[0])] = decodeURIComponent(t[1]);
            }
        }
        return obj;
    }
}