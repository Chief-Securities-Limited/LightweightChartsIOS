const CFDataFeed = {
    // 1. 设置图表库支持支持的图表配置(必须有)
    onReady: function (callback) {
        setTimeout(() => {
            callback({
                supports_search: false,
                supports_group_request: false,
                supports_marks: false,
                supports_timescale_marks: false,
                supports_time: true,
                exchanges: [],
                symbols_types: [],
                // K线的周期数组：单位是分钟，也就是分线日线等
                // 分别是： 分时、5分钟、60分钟、日线、周线、月线、年线
                supported_resolutions: ["1", "5", "60", "1W", "1M", "12M"]
            });
        }
        );
    },

    // 获取标记信息（可以没有）
    getMarks: function (symbolInfo, startDate, endDate, onDataCallback, resolution) {
        console.log('getMarks called');
        onDataCallback(
            [
                // {
                // 	id: 1,
                // 	time: endDate,
                // 	color: 'red',
                // 	text: ['This is the mark pop-up text.'],
                // 	label: 'M',
                // 	labelFontColor: 'blue',
                // 	minSize: 25
                // },
            ]);
    },

    // 获取symbol的交易信息，比如交易所、时区、交易时间等 (必须有)
    // 2. 设置表可以显示哪些数据（也就是上面说的分线日线等）
    resolveSymbol: function (symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) {
        console.log('resolveSymbol called');
        var data = {
            name: symbolName,               // 名称
            has_intraday: true,             // 是否有分时线
            has_daily: true,                // 是否有日线
            has_weekly_and_monthly: true,   // 是否有周线和月线
        }

        if (!this.onSymbolResolvedCallback) {
            this.onSymbolResolvedCallback = onSymbolResolvedCallback;
        }

        setTimeout( () => {
            onSymbolResolvedCallback(data);
        }, 0);
    },

    // 3. 获取条形图数据(必须有)
    // periodParams: { from, to, firstDataRequest, countBack}
    //      from 最左边的bar的时间戳（包括）
    //      to 最右边的bar的时间戳(不包括在内)
    //      firstDataRequest 是否是第一次请求
    //      countBack 请求的条数
    //      备注：
    //      为了避免getBars的调用过于频繁，需要返回的bars的数量与countBack相同,
    //      比如在from...to之间中countBack是300个，而我们的数据只有250个，再请求from日期之前的数据50个，拼在一起返回
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
        // 	marks = [
        // 		{
        // 			id: 1,
        // 			time: startDate,
        // 			color: 'red',
        // 			label: 'Aa',
        // 			minSize: 30,
        // 			tooltip: [
        // 				'Lorem',
        // 				'Ipsum',
        // 				'Dolor',
        // 				'Sit',
        // 			]
        // 		},
        // 		{
        // 			id: 2,
        // 			time: startDate + 5260000, // 2 months
        // 			color: 'blue',
        // 			label: 'B',
        // 			minSize: 30,
        // 			tooltip: [
        // 				'Amet',
        // 				'Consectetur',
        // 				'Adipiscing',
        // 				'Elit',
        // 			]
        // 		}
        // 	];
        // } else {
        // 	marks = [
        // 		{
        // 			id: 'String id',
        // 			time: endDate,
        // 			color: 'red',
        // 			label: 'T',
        // 			tooltip: ['Nulla']
        // 		}
        // 	];
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
    // 	console.log(`subscribeBars called ${symbolInfo.name} ${resolution} ${listenerGuid}`);
    // 	// 模拟订阅行为，这里不执行真正的数据订阅
    // 	onTick(
    // 		[{
    // 			'time': 1714699864099.6055,
    // 			'open': 152,
    // 			'high': 152,
    // 			'low': 148,
    // 			'close': 150
    // 		},
    // 			{
    // 				'time': 1714702804099.6055,
    // 				'open': 153,
    // 				'high': 153,
    // 				'low': 147,
    // 				'close': 151
    // 			}]
    // 	)
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
