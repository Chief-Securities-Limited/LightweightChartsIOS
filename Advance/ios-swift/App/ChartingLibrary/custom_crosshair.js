/**
 * dateTime format
 * @param {*} trackingDocumentElement 
 * @param {*} isSeries 
 */
function observeCrosshairMove(trackingDocumentElement, isSeries) {
    let longPressTimer;
    var startTrackingMode = false;
    var tradingDocumentElement = trackingDocumentElement;

    tradingDocumentElement.addEventListener('touchmove', function (event) {
        const touch = event.touches[0];
        var x = touch.clientX;
        var y = touch.clientY;
        y += getOriginPoint(isSeries);

        if (startTrackingMode) {
            crossHairMoved(x, y);
        } else {
            cancelLongPressTimer();
            startTrackingMode = false;
            hiddenCrosshair();
        }
    });

    tradingDocumentElement.addEventListener('touchstart', function (event) {
        if (startTrackingMode) {
            startTrackingMode = false;
            hiddenCrosshair();
        }
        startLongPressTimer(event);
    }, { passive: true });

    tradingDocumentElement.addEventListener('touchend', function (event) {
        cancelLongPressTimer();
        if (startTrackingMode) {
            hiddenCrosshair();
        }
        window.tvWidget.activeChart()._chartWidget.exitTrackingMode();
        window.tvWidget2.activeChart()._chartWidget.exitTrackingMode();
    });

    function startLongPressTimer(e) {
        cancelLongPressTimer();
        longPressTimer = setTimeout(() => handleLongPress(e), 100); // tradingView default long press time is 240ms
    }

    function cancelLongPressTimer() {
        clearTimeout(longPressTimer);
    }

    function handleLongPress(e) {
        // start tracking
        startTrackingMode = true;
        window.tvWidget.activeChart()._chartWidget.startTrackingMode();
        window.tvWidget2.activeChart()._chartWidget.startTrackingMode();
        cancelLongPressTimer(longPressTimer);
        const touch = e.touches[0];
        var x = touch.clientX;
        var y = touch.clientY;
        y += getOriginPoint(isSeries);
        crossHairMoved(x, y);
    }

    function getOriginPoint(isSeries) {
        if (isSeries) {
            return 0;
        } else {
            var mainChart = document.getElementById('tv_chart_container');
            var mainChartHeight = mainChart.offsetHeight;
            var divSpacing = document.getElementById('customerDiv');
            mainChartHeight += divSpacing.offsetHeight;
            return mainChartHeight;
        }
    }
}


/**
 * crosshair drawing
 * @param {*} x (according to full screen)
 * @param {*} y (according to full screen)
 * @returns 
 */
function crossHairMoved(x, y) {
    var seriesChartContainer = document.getElementById('tv_chart_container');
    var vLine = document.getElementById('vertical-line');
    var hLine = document.getElementById('horizontal-line');
    var xAxisLabel = document.getElementById('x-axis-label');
    var yAxisLabel = document.getElementById('y-axis-label');

    var yAxisPosition = y;
    vLine.style.left = x + 'px';
    hLine.style.top = y + 'px';
    vLine.style.display = 'block';
    hLine.style.display = 'block';

    // get widget and pane according to y position
    var seriesContainerHeight = seriesChartContainer.offsetHeight;
    var seriesPaneHeight = window.tvWidget.activeChart().getPanes()[0].getHeight();
    var divSpacing = document.getElementById('customerDiv').offsetHeight;
    var timeScaleWidth = window.tvWidget.activeChart().getTimeScale().width();
    var priceScaleWidth = seriesChartContainer.offsetWidth - timeScaleWidth;

    var widget;
    var pane;
    if (y < seriesPaneHeight) {
        widget = window.tvWidget;
        pane = widget.activeChart().getPanes()[0];

    } else if (shouldHiddenYAxisLabel(y)) {
        var time = window.tvWidget.activeChart().getTimeScale().coordinateToTime(x - priceScaleWidth);
        xAxisLabel.innerHTML = formatTimestamp(time);
        xAxisLabel.style.left = (x - xAxisLabel.offsetWidth / 2) + 'px';
        xAxisLabel.style.top = height + 'px';
        xAxisLabel.style.display = 'block';
        yAxisLabel.style.display = 'none';
        hLine.style.display = 'none';
        return;

    } else {
        widget = window.tvWidget2;
        var allPanes = window.tvWidget2.activeChart().getPanes();
        var offsetY = seriesContainerHeight + divSpacing;
        for (let i = 0; i < allPanes.length; i++) {
            var height = allPanes[i].getHeight();
            if (y < offsetY + height) {
                pane = allPanes[i];
                break;
            }
            offsetY += (height + 14);
        }
        yAxisPosition -= offsetY;
    }

    // update labels position
    var height = window.tvWidget.activeChart().getPanes()[0].getHeight();
    var price = pane.getMainSourcePriceScale().coordinateToPrice(yAxisPosition);
    var time = widget.activeChart().getTimeScale().coordinateToTime(x - priceScaleWidth);

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


/**
 * Determine if the y-axis should be hidden
 * @param {*} y (according to full screen)
 * @returns 
 */
function shouldHiddenYAxisLabel(y) {
    var seriesChartContainer = document.getElementById('tv_chart_container');
    var seriesContainerHeight = seriesChartContainer.offsetHeight;
    var seriesPaneHeight = window.tvWidget.activeChart().getPanes()[0].getHeight();
    var divSpacing = document.getElementById('customerDiv').offsetHeight;

    if (y < seriesPaneHeight) {
        return false;

    } else if (y < (seriesContainerHeight + divSpacing)) {
        return true;

    } else {
        var offsetY = seriesContainerHeight + divSpacing;
        var allPanes = window.tvWidget2.activeChart().getPanes();

        for (let i = 0; i < allPanes.length; i++) {
            var height = allPanes[i].getHeight();

            if (y < offsetY + height) {
                continue;
            } else if (y <= offsetY + height + 14) {
                return true;
            }
            offsetY += (height + 14);
        }
        return false;
    }
}


/**
 * hidden crosshair
 */
function hiddenCrosshair() {
    document.getElementById('vertical-line').style.display = 'none';
    document.getElementById('horizontal-line').style.display = 'none';
    document.getElementById('x-axis-label').style.display = 'none';
    document.getElementById('y-axis-label').style.display = 'none';
}


/**
 * dateTime format
 * @param {*} timestamp e.g. 1627584000
 * @returns 
 */
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