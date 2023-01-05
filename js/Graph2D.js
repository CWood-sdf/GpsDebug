class Graph2D {
    data = [];
    highlight = 0;
    graphFns = [];
    auxiliaryData = {};
    auxiliaryHighlights = {};

    otherI = 0;
    constructor(x, y, width, height, xRange, yRange, dataCol, vertSub = 10, xSub = 10) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.xRange = xRange;
        this.yRange = yRange;
        this.col = dataCol;
        this.vertSub = vertSub;
        this.xSub = xSub;
    }
    addFn(f) {
        this.graphFns.push(f);
    }
    popFn(i) {
        this.graphFns.splice(i, 1);
    }
    clearFns() {
        this.graphFns = [];
    }
    ah() {
        return this.auxiliaryHighlights;
    }
    ad() {
        return this.auxiliaryData;
    }
    resetI() {
        this.otherI = 0;
        for (var i in this.auxiliaryData) {
            this.auxiliaryHighlights[i] = this.auxiliaryData[this.otherI];
        }
    }
    incI() {
        this.otherI++;
        
        for (var i in this.auxiliaryData) {
            if (this.otherI >= this.auxiliaryData[i].length) {
                this.otherI--;
            }
            this.auxiliaryHighlights[i] = this.auxiliaryData[i][this.otherI];
        }
    }
    getHighlight() {
        return this.data[this.highlight];
    }
    setHighlight(i) {

        if (i < this.data.length && 0 <= i) {
            this.highlight = i;
        }
        
    }
    incHighlight() {
        if (this.highlight < this.data.length - 1) {
            this.highlight++;
        }
    }
    moveHighlightEnd() {
        this.highlight = this.data.length - 1;
    }
    moveIEnd() {
        for (var i in this.auxiliaryData) {
            this.otherI = this.auxiliaryData[i].length - 1;
            this.auxiliaryHighlights[i] = this.auxiliaryData[i][this.otherI];
        }
    }
    inputData(d) {
        this.data = d;
    }
    customizeRange() {
        if(this.data.length === 0) return;
        this.xRange = [this.data[0].x, this.data[0].x];
        this.yRange = [this.data[0].y, this.data[0].y];
        for (var i of this.data) {
            this.xRange[0] = Math.max(i.x, this.xRange[0]);
            this.xRange[1] = Math.min(i.x, this.xRange[1]);
        }
        for (var i of this.data) {
            this.yRange[0] = Math.max(i.x, this.yRange[0]);
            this.yRange[1] = Math.min(i.x, this.yRange[1]);
        }
        var xRangeSize = this.xRange[0] - this.xRange[1];
        var yRangeSize = this.yRange[0] - this.yRange[1];
        this.xRange[0] += 0.05 * xRangeSize;
        this.xRange[1] -= 0.05 * xRangeSize;
        this.yRange[0] += 0.05 * yRangeSize;
        this.yRange[1] -= 0.05 * yRangeSize;
    }
    draw() {
        var dWidth = this.data.length;
        var xRangeSize = this.xRange[0] - this.xRange[1];
        var xRangeMult = this.width / xRangeSize;
        var yRangeSize = this.yRange[0] - this.yRange[1];
        var yRangeMult = this.height / yRangeSize;
        var xRange = this.xRange;
        var yRange = this.yRange;
        var thisX = this.x;
        var thisY = this.y;
        var toX = x => x * xRangeMult - xRange[1] * xRangeMult + thisX;
        var toY = y => -y * yRangeMult + yRange[0] * yRangeMult + thisY;
        p.fill(255);
        p.noStroke();
        p.rect(this.x * height, this.y * height, this.width * height, this.height * height);

        {
            p.stroke(0);
            p.strokeWeight(1);
            p.fill(0);
            p.textSize(10);
            p.textAlign(p.RIGHT);
            /*
             var bottom = this.x + this.width;
                var y = i / this.vertSub * this.height + this.y;
                p.line(bottom * height, y * height, this.x * height - 5, y * height);
                p.text(limDecimal(-i / this.vertSub * rangeSize + this.range[0], 1), this.x * height - 7, y * height + 3);*/
            for (var i = 0; i <= this.vertSub; i++) {
                var bottom = this.x + this.width;
                var y = i / this.vertSub * this.height + this.y;
                p.line(bottom * height, y * height, this.x * height - 5, y * height);
                p.text(limDecimal(-i / this.vertSub * yRangeSize + this.yRange[0], 1), this.x * height - 7, y * height + 3);
            }
            p.textAlign(p.CENTER);
            for (var i = 0; i <= this.xSub; i++) {
                var bottom = this.y + this.height;
                var x = i / this.xSub * this.width + this.x;
                p.line(x * height, bottom * height + 5, x * height, this.y * height);
                p.text(limDecimal(i / this.xSub * xRangeSize + this.xRange[1], 1), x * height, bottom * height + 18);
            }
        } // Axis drawing

        {
            var pt = this.data[this.highlight];
            var newX = toX(pt.x);
            p.strokeWeight(1);
            p.stroke(0);
            p.line(newX * height, this.y * height, newX * height, (this.y + this.height) * height);
            var newY = toY(pt.y);
            p.strokeWeight(1);
            p.stroke(0);
            p.line(this.x * height, newY * height, (this.x + this.width) * height, newY * height);
        } // Line Highlight

        for (var x = 0; x < dWidth; x++) {
            var pt = this.data[x];
            var newX = toX(pt.x);
            var newY = toY(pt.y);
            p.strokeWeight(2);
            p.stroke(this.col);
            p.point(newX * height, newY * height);
        } // Data display

        {
            var pt = this.data[this.highlight];
            var newX = toX(pt.x);
            var newY = toY(pt.y);
            p.strokeWeight(3);
            p.stroke(255 - p.red(this.col), 255 - p.green(this.col), 255 - p.blue(this.col));
            p.point(newX * height, newY * height);
        } // Highlight

        {
            for (var f of this.graphFns) {
                f(toX, toY, this, this.data[this.highlight]);
            }
        } // Graph Fns
    }
};