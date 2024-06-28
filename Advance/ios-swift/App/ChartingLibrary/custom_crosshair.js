// 十字线移动
function crossHairMoved(x, y) {
    console.log("Touch=== moveCrosshair: ======== )");
    // 更新十字線
    var mainChart = document.getElementById('tv_chart_container');
    var vLine = document.getElementById('vertical-line');
    var hLine = document.getElementById('horizontal-line');
    vLine.style.left = x + 'px';
    hLine.style.top = y + 'px';
    vLine.style.display = 'block';
    hLine.style.display = 'block';

    // 更新x，y軸的Label
    var timeScaleWidth = window.tvWidget.activeChart().getTimeScale().width();
    var priceScaleWidth = mainChart.offsetWidth - timeScaleWidth;
    var height = window.tvWidget.activeChart().getPanes()[0].getHeight();
    var price = window.tvWidget.activeChart().getPanes()[0].getMainSourcePriceScale().coordinateToPrice(y);
    var time = window.tvWidget.activeChart().getTimeScale().coordinateToTime(x - priceScaleWidth);

    var xAxisLabel = document.getElementById('x-axis-label');
    var yAxisLabel = document.getElementById('y-axis-label');

    if (price !== null && time !== null) {
        xAxisLabel.innerHTML = formatTimestamp(time);
        yAxisLabel.innerHTML = price.toFixed(2);

        xAxisLabel.style.left = (x - xAxisLabel.offsetWidth / 2) + 'px';
        xAxisLabel.style.top = height + 'px';
        xAxisLabel.style.display = 'block';

        yAxisLabel.style.left = 0 + 'px';
        yAxisLabel.style.top = (y - yAxisLabel.offsetHeight / 2) + 'px';
        yAxisLabel.style.display = 'block';

    } else {
        document.getElementById('x-axis-label').style.display = 'none';
        document.getElementById('y-axis-label').style.display = 'none';
    }

}

// 移除十字线
function removeCrosshair() {
    console.log("Touch=== removeCrosshair: ======== )");
    document.getElementById('vertical-line').style.display = 'none';
    document.getElementById('horizontal-line').style.display = 'none';
    document.getElementById('x-axis-label').style.display = 'none';
    document.getElementById('y-axis-label').style.display = 'none';
}

// 时间格式化
function formatTimestamp(timestamp) {
    var date = new Date(timestamp * 1000);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);

    var formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}