TAG = "custom_y_axis: "

refreshAllPanesCustomYAxis = function (widget) {
    this.clearAllPanesCustomYAxis(widget)
    var panes = widget.activeChart().getPanes()
    console.log("refreshAllPanesCustomYAxis")
    panes.forEach((pane, paneIndex) => {
        this.createCustomYAxisForPane(pane, widget)
    })
}

clearAllPanesCustomYAxis = function (widget) {
    if (widget.allPanesCustomYAxis == null) {
        return
    }
    while (widget.allPanesCustomYAxis.length > 0) {
        var customYAxis = widget.allPanesCustomYAxis.pop();
        customYAxis.destroy()
    }
}

createCustomYAxisForPane = function (pane, widget) {
    var customYAxis = new CustomYAxis(widget, pane)
    if (widget.allPanesCustomYAxis == null) {
        widget.allPanesCustomYAxis = []
    }
    widget.allPanesCustomYAxis.push(customYAxis)
}

class CustomYAxis {

    textSize = 14
    font = "Arial"
    lineHeight = 14 * 1.5

    pointsCount = 5

    yAxisPosition = "left" // left or right

    _hiddleYAxisOriginal = function (isVisible) {
        if (isVisible) {
            this.seriesPane.getMainSourcePriceScale()._priceScale.isVisible().setValue(false)
        }
    }

    constructor(widget, seriesPane) {
        this.widget = widget
        this.seriesPane = seriesPane
        this.paneId = seriesPane._pane.m_dataSources[0]._id
        this.updatePrice()

        this.priceRangeChangedSubscription = this.seriesPane.getMainSourcePriceScale()._priceScale.priceRangeChanged().subscribe(
            this,
            () => {
                var range = this.widget.activeChart().getVisiblePriceRange()
                console.log("this.widget.getVisiblePriceRange= " + " from:" + range.from + " to:" + range.to)
                this.updatePrice()
            }
        )

        // hiddle Y Axis
        var isVisibleChanged = this.seriesPane.getMainSourcePriceScale()._priceScale.isVisible()
        isVisibleChanged.setValue(false)
        this._onPriceScaleIsVisibleChanged = (isVisible) => {
            if (isVisible) {
                isVisibleChanged.setValue(false)
            }
        }
        isVisibleChanged.subscribe(this._onPriceScaleIsVisibleChanged)
    }

    destroy() {
        this.seriesPane.getMainSourcePriceScale()._priceScale.priceRangeChanged().unsubscribeAll(this)
        this.seriesPane.getMainSourcePriceScale()._priceScale.isVisible().unsubscribe(this._onPriceScaleIsVisibleChanged)

        for (let index = 0; index < this.pointsCount; index++) {
            var shapeId = this[`yShapeId${index}`];
            var lineShapeId = this[`yLineShapeId${index}`];

            this.widget.activeChart().removeEntity(shapeId)
            this.widget.activeChart().removeEntity(lineShapeId)
        }
    }

    updatePrice() {

        // chart height
        var paneHeight = this.seriesPane.getHeight()
        var paneWidth = this.seriesPane._pane._width

        var positions = [];
        for (let i = 0; i < this.pointsCount; i++) {
            let position = i / (this.pointsCount - 1);
            positions.push(position);
        }

        var priceScale = this.seriesPane.getMainSourcePriceScale()

        positions.forEach((position, index) => {

            var y = position * paneHeight;
            var price = priceScale.coordinateToPrice(y);
            var shapeId = `yShapeId${index}`;
            var lineShapeId = `yLineShapeId${index}`;

            if (price == null) return;

            var priceText = price.toFixed(2)

            var textMarginBottom = this.textSize + 2
            if (index == 0) textMarginBottom = 0
            var textY = y - textMarginBottom
            var textX = 0.0
            if (this.yAxisPosition == "right") {
                textX = (paneWidth - this.measureTextWidth(priceText))
            }

            // create text label
            this[shapeId] = this.createYIndexShape(this[shapeId], { x: (textX / paneWidth), y: (textY / paneHeight) }, priceText);

            // create line
            this[lineShapeId] = this.createYIndexLineShape(this[lineShapeId], { price: price })
        });
    }

    createYIndexShape(yIndexShapeId, point, text) {
        if (yIndexShapeId == null) {
            var _yIndexShapeId = this.widget.activeChart().createAnchoredShape(
                point,
                {
                    shape: 'anchored_text',
                    lock: true,
                    disableSelection: true,
                    text: text,
                    zOrder: "top",
                    ownerStudyId: this.paneId,
                    overrides: {
                        color: 'black',
                        fontsize: this.textSize,
                        font: this.font
                    },
                }
            )
            return _yIndexShapeId
        }

        var anchoredShape = this.widget.activeChart().getShapeById(yIndexShapeId)
        anchoredShape.setAnchoredPosition(point)
        anchoredShape.setProperties({
            text: text
        })

        return yIndexShapeId
    }

    // https://www.tradingview.com/charting-library-docs/latest/customization/overrides/Shapes-and-Overrides
    createYIndexLineShape(yIndexShapeId, point) {
        if (yIndexShapeId == null) {
            var _yIndexShapeId = this.widget.activeChart().createShape(
                point,
                {
                    shape: 'horizontal_line',
                    lock: true,
                    disableSelection: true,
                    zOrder: "bottom",
                    ownerStudyId: this.paneId,
                    overrides: {
                        linewidth: 1,
                        linecolor: "rgba(242, 242, 242, 0.6)",
                        showLabel: false,
                        showPrice: false,
                        vertLabelsAlign: "top",
                        horzLabelsAlign: "left"
                    },
                }
            )
            return _yIndexShapeId
        }

        var anchoredShape = this.widget.activeChart().getShapeById(yIndexShapeId)
        anchoredShape.setPoints([point])
        return yIndexShapeId
    }

    measureTextWidth(text) {
        // 创建一个隐藏的 canvas 元素
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // 设置字体样式
        context.font = `${this.textSize}pt ${this.font}`;

        // 测量文本宽度
        const metrics = context.measureText(text);
        return metrics.width;
    }
}
