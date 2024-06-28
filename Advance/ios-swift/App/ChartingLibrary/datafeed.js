// 定义一个JS对象，实现图表数据的加载
const chartDataFetcher = {
    // 初始化(必须有)
    onReady: function (callback) {
        console.log('onReady called');
        setTimeout(
            () => {
                callback({
                    supports_search: true,
                    supports_group_request: false,
                    supports_marks: true,
                    supports_timescale_marks: true,
                    supports_time: true,
                    exchanges: [
                        { value: "", name: "All Exchanges", desc: "" },
                        { value: "NasdaqNM", name: "NasdaqNM", desc: "NasdaqNM" },
                        { value: "NYSE", name: "NYSE", desc: "NYSE" }
                    ],
                    symbols_types: [
                        { name: "All types", value: "" },
                        { name: "Stock", value: "stock" },
                        { name: "Index", value: "index" }
                    ],
                    supported_resolutions: ["1", "5", "60", "1W", "1M", "12M"]
                });
            },
            0
        );
    },

    // 获取标记信息（可以没有）
    getMarks: function (symbolInfo, startDate, endDate, onDataCallback, resolution) {
        console.log('getMarks called');
        onDataCallback(
            [
                // {
                //     id: 1,
                //     time: endDate,
                //     color: 'red',
                //     text: ['This is the mark pop-up text.'],
                //     label: 'M',
                //     labelFontColor: 'blue',
                //     minSize: 25
                // },
            ]);
    },

    // 获取symbol的交易信息，比如交易所、时区、交易时间等 (必须有)
    resolveSymbol: function (symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) {
        console.log('resolveSymbol called');
        setTimeout(
            () => {
                // Return some simple symbol information for the TEST symbol
                if (symbolName === 'AAPL') {
                    onSymbolResolvedCallback({
                        "name": "AAPL",
                        "timezone": "America/New_York",
                        "minmov": 1,
                        "minmov2": 0,
                        "pointvalue": 1,
                        "session": "24x7",
                        "has_intraday": false,
                        "visible_plots_set": "c",
                        "description": "AAPL Symbol",
                        "type": "stock",
                        "pricescale": 100,
                        "ticker": "AAPL",
                        "exchange": "Test Exchange",
                        "has_daily": true,
                        "format": "price"
                    });
                } else {
                    // Ignore all other symbols
                    onResolveErrorCallback('unknown_symbol');
                }
            },
            0
        );
    },

    // 获取条形图数据
    getBars: function (symbolInfo, resolution, periodParams, onHistoryCallback, onError) {
        console.log(`getBars called ${symbolInfo.name}
        ${resolution}
        ${periodParams.from}
        ${periodParams.to}
        ${periodParams.firstDataRequest}`);

        // // 注册回调，以便原生代码可以将结果返回
        // window.getBarsErrorCallBack = onError;
        window.getBarsCallback = onHistoryCallback;

        // 调用原生的方法
        window.webkit.messageHandlers.getBars.postMessage({
            resolution: String(resolution),
            symbol: String(symbolInfo.ticker),
            from: periodParams.from,
            to: periodParams.to,
            firstDataRequest: periodParams.firstDataRequest,
            countBack: periodParams.countBack
        });
    },

    // 新增的方法
    getServerTime: function (callback) {
        console.log('getServerTime called');
        const serverTime = Date.now(); // 模拟服务器时间
        callback(serverTime);
    },

    // 获取时间刻度上的标记（可以没有）
    getTimescaleMarks: function (symbolInfo, startDate, endDate, onDataCallback, resolution) {
        console.log('getTimescaleMarks called');
        let marks = [];

        // if (symbolInfo.name === 'AAPL') {
        //     marks = [
        //         {
        //             id: 1,
        //             time: startDate,
        //             color: 'red',
        //             label: 'Aa',
        //             minSize: 30,
        //             tooltip: [
        //                 'Lorem',
        //                 'Ipsum',
        //                 'Dolor',
        //                 'Sit',
        //             ]
        //         },
        //         {
        //             id: 2,
        //             time: startDate + 5260000, // 2 months
        //             color: 'blue',
        //             label: 'B',
        //             minSize: 30,
        //             tooltip: [
        //                 'Amet',
        //                 'Consectetur',
        //                 'Adipiscing',
        //                 'Elit',
        //             ]
        //         }
        //     ];
        // } else {
        //     marks = [
        //         {
        //             id: 'String id',
        //             time: endDate,
        //             color: 'red',
        //             label: 'T',
        //             tooltip: ['Nulla']
        //         }
        //     ];
        // }

        onDataCallback(marks);
    },

    getVolumeProfileResolutionForPeriod: function (currentResolution, from, to, symbolInfo) {
        console.log('getVolumeProfileResolutionForPeriod called');
        return "D"; // 简单返回当前分辨率
    },

    // 搜索symbol（也可以没有）
    searchSymbols: function (userInput, exchange, symbolType, onResult) {
        console.log('searchSymbols called');
        const results = [
            { symbol: userInput, full_name: `${exchange}:${userInput}`, description: `${userInput} Stock`, exchange: exchange, type: symbolType }
        ];
        onResult(results);
    },

    // subscribeBars: function (symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback) {
    //     console.log(`subscribeBars called ${symbolInfo.name} ${resolution} ${listenerGuid}`);
    //     // 模拟订阅行为，这里不执行真正的数据订阅
    //     onTick(
    //         [{
    //             'time': 1714699864099.6055,
    //             'open': 152,
    //             'high': 152,
    //             'low': 148,
    //             'close': 150
    //         },
    //             {
    //                 'time': 1714702804099.6055,
    //                 'open': 153,
    //                 'high': 153,
    //                 'low': 147,
    //                 'close': 151
    //             }]
    //     )
    // },

    subscribeDepth: function (symbol, callback) {
        console.log('subscribeDepth called');
        return 'depthSubscriptionId'; // 返回订阅ID
    },

    unsubscribeBars: function (listenerGuid) {
        console.log('unsubscribeBars called');
        // 模拟取消订阅行为
    },

    unsubscribeDepth: function (subscriberUID) {
        console.log('unsubscribeDepth called');
        // 模拟取消深度订阅
    }
};
