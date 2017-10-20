$(document).ready(function () {
    function pageCutshow() {
        $(".model").css({
            "display": "block"
        });
        $(".Screenshot").css({
            "display": "block"
        });
    }

    function pageCuthide() {
        $(".model").css({
            "display": "none"
        });
        $(".Screenshot").css({
            "display": "none"
        });
    }

    chrome.cookies.get({
        url: 'http://zbb.fa123.com/',
        name: 'auth-token',
    }, function (Cookie) {
        loginStatus(Cookie);
    });

    $('#login').on('click', function () {
        chrome.tabs.create({
            url: 'http://zbb.fa123.com/'
        });
    });

    //面板消失
    function vanish() {
        $('.Screenshot').delay(3000).fadeOut(1000,function(){
      $(this).css({'display':'none'});
    });
    }

    function isshow() {
        $('.spaceShort .cancelLog').css({visibility: 'visible'});
        $('.operationBar').css({display: 'block'});
    }

    function ishide() {
        $('.spaceShort .cancelLog').css({visibility: 'hidden'});
        $('.operationBar').css({display: 'none'});
    }

    var cutflag, printflag;

    function loginStatus(Cookie) {
        // console.log(Cookie);
        if (Cookie === null) {
            $('.isShow').hide();
            $('#login span').html('登录/注册');
            $('#login').css({'text-align': 'center'});
            $('#login span').css({'border': 0});
            $("#login i").css({
                background: "url('img/suo.png') no-repeat center"
            })
            $('.model').hide();
            // if(isSogo()){
            //     sogouExplorer.browserAction.setPopup('popup.html',)
            // }
        } else {
            $('.isShow').show();
            // sogouExplorer.pageAction.setPopup({"path":"./popup.html","width":280,"height":46});
            $.ajax({
                type: 'GET',
                url: 'https://api.51zbb.net/web/web/print/task/status',
                dataType: 'json',
                headers: {
                    'source': 'web',
                    'auth-token': Cookie.value
                },
            }).done(res => {
                $('.resSuccess').html(res.data.print_success);
                $('.requestNum').html(res.data.print_total);
                $('.shortcut_total').html(res.data.shortcut_total);
                $('.short_success').html(res.data.shortcut_success);
            });
            $.ajax({
                type: 'get',
                url: 'https://api.51zbb.net/web/user/info',
                dataType: 'json',
                headers: {
                    'source': 'web',
                    'auth-token': Cookie.value
                }
            })
                .done(res => {
                    // console.log(res);
                    $('#phone').html(`(+${res.data.area_code})${res.data.cell_phone}`);
                    $('#remain').html((res.data.cash_available + res.data.gift_available) / 100);
                })
                .fail(function () {
                    pageCutshow();
                    ishide();
                    $(".reason").html('请求失败，刷新或重新打开浏览器再试试');
                    vanish()
                });

            function printAjax(response, printflag) {
                if (!response) {
                    pageCutshow();
                    ishide();
                    $(".reason").html('出错了，刷新或重新打开浏览器再试试');
                    vanish()
                } else {
                    $.ajax({
                        type: 'POST',
                        url: 'https://api.51zbb.net/web/pdf/print/apply',
                        dataType: 'json',
                        data: {
                            type: 1,
                            url: response.url,
                            width: response.width,
                            height: response.height,
                            cookie: response.cookie,
                        },
                        headers: {
                            'source': 'web',
                            'auth-token': Cookie.value
                        }
                    })
                        .done(res => {
                                // console.log(res);
                                if (res.error === 0) {
                                    // if (printflag !== 1) {
                                        pageCutshow();
                                        isshow();
                                        $('.spaceShort .reason').html('打印成功，余额-2元，您可以在用户中心查看取证结果。');
                                        vanish();
                                        ishide();
                                    // }
                                }
                                else if (res.error === 30014) {
                                    pageCutshow();
                                    isshow();
                                    $(".cancelLog").html('<span class="cha cha01"></span>')
                                    $(".reason").html('存储空间不足，请购买空间');
                                    $('.addml').addClass('addmlkr').html("去扩容");
                                    $('.addml').on('click', function () {
                                        window.open('http://zbb.fa123.com/#/buy');
                                    });
                                }
                                else if (res.error === 30012) {
                                    pageCutshow();
                                    isshow();
                                    $(".cancelLog").html('<span class="cha cha01"></span>');
                                    $(".reason").html('账户余额不足！');
                                    $('.addml').addClass('addmlcz').html("去充值");
                                    $('.addmlcz').removeClass('addmlkr').on('click', function () {
                                        // console.log('eeeee');
                                        window.open('http://zbb.fa123.com/#/pay')
                                    });
                                } else {
                                    pageCutshow();
                                    $('.operationBar').hide();
                                    $('.reason').html('网页打印失败，请重新尝试');
                                    vanish();
                                }
                            }
                        )
                        .fail(function () {
                            pageCutshow();
                            isshow();
                            $('.spaceShort .reason').html('网页请求失败，请重新尝试');
                            vanish();
                            ishide();
                        });
                }
            }

            function Print(printflag) {
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {greeting: "print"}, function (response) {
                            printAjax(response, printflag)
                        });
                    });
                } catch (e) {
                    pageCutshow();

                    $('.spaceShort .reason').html('请求错误，可重新打开浏览器或刷新网页试试');
                    vanish();

                }
            }

            // 网页打印

            $('#print').on('click', function () {

                // if(avilibleSize)
                $.ajax({
                    url: 'https://api.51zbb.net/web/user/plugin/status/check',
                    type: 'GET',
                    dataType: 'json',
                    data: {type: 1},
                    headers: {
                        'source': 'web',
                        'auth-token': Cookie.value
                    }
                }).done(res => {
                    // console.log(res);
                    printflag = res.data.first_click;
                    // console.log(printflag);
                    if (printflag === 1) {
                        pageCutshow();
                        isshow();
                        $('.addml').removeClass('addmlkr').removeClass('addmlcz')
                        $(".reason").html("（选择“确定”之后操作将不再提示）");
                        $(".addml").html("确定");
                        // printflag=1
                        $(".addml").on("click", function () {
                            Print(printflag);
                            $.ajax({
                                url: 'https://api.51zbb.net/web/user/plugin/status/mark',
                                type: 'GET',
                                dataType: 'json',
                                data: {type: 1},
                                headers: {
                                    'source': 'web',
                                    'auth-token': Cookie.value
                                }
                            }).done(res => {
                                // console.log(res);
                            })
                        });
                    } else {
                        Print(printflag);
                    }
                });

            });

            //充值
            //关闭弹窗
            $('.can').on("click", function () {
                pageCuthide();
                ishide();
                $('.Screenshot').stop();
            });

            function CutAjax(response, cutflag) {
                if (!response) {
                    pageCutshow();
                    ishide();
                    $(".reason").html('出错了，刷新网页或重新打开浏览器再试试');
                    vanish();
                }
                else {
                    // console.log(response);
                    $.ajax({
                        type: 'POST',
                        url: 'https://api.51zbb.net/web/pdf/print/apply',
                        dataType: 'json',
                        data: {
                            type: 2,
                            cookie: response.cookie,
                            url: response.url,
                            width: response.width,
                            height: window.screen.height,
                            top: response.top,
                            left: response.left
                        },
                        headers: {
                            'source': 'web',
                            'auth-token': Cookie.value
                        }
                    })
                        .done(res => {
                            // console.log(res);
                            if (res.error === 0) {
                                    pageCutshow();
                                    isshow();
                                    $('.spaceShort .reason').html('截屏成功，余额-2元，您可以在用户中心查看取证结果。');
                                    vanish();
                                    ishide();
                            } else if (res.error === 30014) {
                                pageCutshow();
                                isshow();
                                $(".cancelLog").html('<span class="cha cha01"></span>')
                                $(".reason").html('存储空间不足，请购买空间');
                                $('.addml').addClass('addmlkr').html("去扩容");
                                $('.addml').on('click', function () {
                                    window.open('http://zbb.fa123.com/#/buy');
                                });

                            } else if (res.error === 30012) {
                                pageCutshow();
                                isshow();
                                $(".cancelLog").html('<span class="cha cha01"></span>');
                                $(".reason").html('账户余额不足！');
                                $('.addml').addClass('addmlcz').html("去充值");
                                $('.addmlcz').removeClass('addmlkr').on('click', function () {
                                    // console.log('eeeee');
                                    window.open('http://zbb.fa123.com/#/pay')
                                });
                            }
                            else if (res.error === 30006) {
                                ishide();
                                $(".reason").html('API参数校验失败，缺失或者格式错误');
                                vanish();
                            } else {
                                ishide();
                                $(".reason").html('未知错误');
                                vanish();
                            }
                        });
                }
            }

            // console.log('.addmlkr');
            function Cut(cutflag) {
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {greeting: "capture"}, function (response) {
                            //console.log('截屏',response);
                            CutAjax(response, cutflag);
                        });
                    });


                } catch (e) {
                    pageCutshow();
                    $('.spaceShort .reason').html('请求错误，可重新打开浏览器或刷新网页试试');
                    vanish();
                }
            }

            // 网页截屏
            $('#capture').on('click', function () {
                $.ajax({
                    url: 'https://api.51zbb.net/web/user/plugin/status/check',
                    type: 'GET',
                    dataType: 'json',
                    data: {type: 2},
                    headers: {
                        'source': 'web',
                        'auth-token': Cookie.value
                    }
                }).done(res => {
                    cutflag = res.data.first_click;
                    if (cutflag === 1) {
                        pageCutshow();
                        isshow();
                        $(".addml").removeClass('addmlcz').removeClass('addmlkr');
                        $(".cancelLog").html('进行“网页截屏操作”将扣除2.00元余额');
                        $(".reason").html("（选择“确定”之后操作将不再提示）");
                        $('.operationBar').css({display: 'block'})
                        $(".addml").html("确定");

                        $(".addml").on("click", function () {
                            if (cutflag === 1) {
                                Cut(cutflag)
                            }
                            $.ajax({
                                url: 'https://api.51zbb.net/web/user/plugin/status/mark',
                                type: 'GET',
                                dataType: 'json',
                                data: {type: 2},
                                headers: {
                                    'source': 'web',
                                    'auth-token': Cookie.value
                                }
                            }).done(res => {
                                // console.log(res);
                            })
                        });
                    } else {
                        Cut(cutflag);
                    }
                });

            });


            $('.addmlkr').on('click', function () {
                chrome.tabs.create({
                    url: 'http://zbb.fa123.com/#/buy',
                });
            });


            $('#doc').on('click', function () {
                chrome.tabs.create({
                    url: 'http://zbb.fa123.com/#/doc',
                });
            });

            $('#pay').on('click', function () {
                chrome.tabs.create({
                    url: 'http://zbb.fa123.com/#/pay',
                });
            });

            $('#logout').on('click', function () {
                $('.storeSpace').css({'display': 'block'});
                $('.storeSpace .sure').on('click', function () {
                    chrome.cookies.remove({
                        url: 'http://zbb.fa123.com/',
                        name: 'auth-token'
                    }, function () {
                        chrome.tabs.getCurrent(function(tab){
                            chrome.tabs.update({
                                url: 'http://zbb.fa123.com/'
                            },function(){
                                window.close();
                            });
                        })
                       // console.log(result);
                    });
                    return false;
                });
            });
            $('.makesure a').on('click', function () {
                $('.storeSpace').css({
                    'display': 'none'
                });
            });
        }
    }


    // var used_size,total_size,cash_avalable,gift_available,avilibleSize,avilibleMoney;

});